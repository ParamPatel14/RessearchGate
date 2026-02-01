import logging
import math
from typing import List, Dict, Any
from app.db import models
from app.services import ai_service

logger = logging.getLogger(__name__)

class MatchingEngine:
    """
    Intelligent Matching Engine implementing the 3-Lens Architecture:
    1. Domain Filtering (Hard Filter)
    2. Semantic Similarity (Soft Match)
    3. Profile Alignment Score
    """

    @staticmethod
    def _cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return 0.0
        
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        norm1 = math.sqrt(sum(a * a for a in vec1))
        norm2 = math.sqrt(sum(b * b for b in vec2))
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
            
        return dot_product / (norm1 * norm2)

    @staticmethod
    def _lens_1_domain_filtering(student: models.StudentProfile, mentor: models.MentorProfile) -> bool:
        """
        LENS 1: DOMAIN FILTERING (HARD FILTER)
        Remove obviously irrelevant supervisors.
        """
        # If mentor has no specific preferred backgrounds, assume they are open
        if not mentor.preferred_backgrounds:
            return True
            
        # If student has no major specified, we can't filter, so keep them
        if not student.major:
            return True

        student_major = student.major.lower().strip()
        preferred = [bg.lower().strip() for bg in mentor.preferred_backgrounds.split(',')]
        
        # Check for direct match or substring match (e.g. "CS" in "Computer Science")
        # Also check for broad categories
        aliases = {
            "cs": "computer science",
            "cse": "computer science",
            "ece": "electrical engineering",
            "ee": "electrical engineering",
            "ml": "machine learning",
            "ai": "artificial intelligence"
        }
        
        normalized_student = aliases.get(student_major, student_major)
        
        for bg in preferred:
            normalized_bg = aliases.get(bg, bg)
            if normalized_student in normalized_bg or normalized_bg in normalized_student:
                return True
                
        # If no match found in preferences, return False (Filter out)
        return False

    @staticmethod
    async def _lens_2_semantic_similarity(student: models.StudentProfile, mentor: models.MentorProfile) -> float:
        """
        LENS 2: SEMANTIC SIMILARITY (SOFT MATCH)
        Understand meaning, not just keywords.
        """
        # Construct rich text representations
        student_text = f"{student.research_interests or ''} {student.bio or ''} {student.primary_skills or ''}"
        mentor_text = f"{mentor.research_areas or ''} {mentor.bio or ''} {mentor.project_keywords or '' if hasattr(mentor, 'project_keywords') else ''}"
        
        # Get embeddings (Cached ideally, but for now live)
        # In production, mentor embeddings should be pre-computed and stored in DB (pgvector)
        student_vec = await ai_service.get_embedding(student_text)
        mentor_vec = await ai_service.get_embedding(mentor_text)
        
        return MatchingEngine._cosine_similarity(student_vec, mentor_vec)

    @staticmethod
    def _lens_3_profile_alignment(student: models.StudentProfile, mentor: models.MentorProfile) -> float:
        """
        LENS 3: PROFILE ALIGNMENT SCORE
        Adjust ranking using background compatibility.
        """
        score = 0.0
        max_score = 40.0 # This lens contributes 40% to the remaining score? 
        # Let's say Score is 0-100.
        
        # 1. Academic Level Fit (10 pts)
        if mentor.mentor_type == 'academic_supervisor':
            # PhD Supervisors prefer students with research intent
            if student.is_phd_seeker:
                score += 10
            elif student.degree and "master" in student.degree.lower():
                score += 5
        else:
            # Industry mentors might prefer practical skills/projects
            if student.projects and len(student.projects) > 0:
                score += 10

        # 2. Skill Overlap (20 pts)
        # Parse text-based skills for now
        student_skills = set()
        if student.primary_skills:
            student_skills.update([s.strip().lower() for s in student.primary_skills.split(',')])
            
        mentor_reqs = set()
        if mentor.min_expectations:
            mentor_reqs.update([s.strip().lower() for s in mentor.min_expectations.split(',')])
            
        if mentor_reqs:
            overlap = student_skills.intersection(mentor_reqs)
            overlap_ratio = len(overlap) / len(mentor_reqs)
            score += 20 * overlap_ratio
        else:
            # If no specific expectations, give full points for skills to avoid penalizing
            score += 20
            
        # 3. Availability/Logistics (10 pts)
        if mentor.accepting_phd_students == 'Yes':
            score += 10
        elif mentor.accepting_phd_students == 'Maybe':
            score += 5
            
        return score

    @staticmethod
    def _generate_explanation(student: models.StudentProfile, mentor: models.MentorProfile, 
                            semantic_score: float, alignment_score: float) -> str:
        """
        EXPLAINABILITY (NON-NEGOTIABLE)
        Every match must have a reason.
        """
        reasons = []
        
        # Extract key overlaps for explanation
        student_interests = (student.research_interests or "").split(',')
        mentor_areas = (mentor.research_areas or "").split(',')
        
        # Find overlapping keywords (simple check for explanation text)
        common_areas = []
        for s_int in student_interests:
            for m_area in mentor_areas:
                if s_int.strip().lower() in m_area.strip().lower() or m_area.strip().lower() in s_int.strip().lower():
                    if len(s_int.strip()) > 3: # Avoid matching short words
                        common_areas.append(s_int.strip())
        
        # 1. Interest Match
        if semantic_score > 0.8:
            reasons.append(f"Strong alignment in research focus{' (' + common_areas[0] + ')' if common_areas else ''}")
        elif semantic_score > 0.6:
            reasons.append(f"Good overlap in research interests")
            
        # 2. Skill/Profile Match
        if alignment_score > 30:
            reasons.append("your technical background strongly matches the lab's requirements")
        elif alignment_score > 15:
            reasons.append("your profile fits the general expectations")
            
        # 3. Specifics
        if mentor.mentor_type == 'academic_supervisor' and student.is_phd_seeker:
            reasons.append("active PhD recruitment matches your goals")
            
        # 4. Research Intelligence (Trend Analysis)
        # Check if mentor has trend data (lazy loaded or eager loaded)
        try:
            if hasattr(mentor, 'topic_trends') and mentor.topic_trends:
                # Find a "Rising" topic or the most active one in recent years
                rising_trends = [t for t in mentor.topic_trends if t.trend_status == "Rising"]
                if rising_trends:
                    # Pick the one with highest count
                    top_trend = max(rising_trends, key=lambda x: x.total_count)
                    if top_trend.topic:
                        reasons.append(f"this supervisor has actively published on {top_trend.topic.name} in the last 3 years")
                elif mentor.topic_trends:
                     # Fallback to most active overall if no rising trend
                    top_trend = max(mentor.topic_trends, key=lambda x: x.total_count)
                    if top_trend.topic:
                        reasons.append(f"recent research focus includes {top_trend.topic.name}")
        except Exception as e:
            # Fallback if DB relation issue
            pass

        if not reasons:
            return "Profile matched based on general domain availability."
            
        return "Matched because " + " and ".join(reasons) + "."

    @classmethod
    async def match_student_with_mentors(cls, student: models.StudentProfile, mentors: List[models.MentorProfile]) -> List[Dict[str, Any]]:
        """
        Main Entry Point: Returns ranked list of mentors for a student.
        """
        matches = []
        
        # Cache student embedding once
        student_text = f"{student.research_interests or ''} {student.bio or ''} {student.primary_skills or ''}"
        student_vec = await ai_service.get_embedding(student_text)
        
        for mentor in mentors:
            # LENS 1: Domain Filtering
            if not cls._lens_1_domain_filtering(student, mentor):
                continue # Hard filter
                
            # LENS 2: Semantic Similarity (0-100 scale equivalent)
            mentor_text = f"{mentor.research_areas or ''} {mentor.bio or ''}"
            mentor_vec = await ai_service.get_embedding(mentor_text)
            
            semantic_sim = cls._cosine_similarity(student_vec, mentor_vec)
            semantic_score = semantic_sim * 100 # Convert to 0-100
            
            # LENS 3: Profile Alignment (0-40 scale in our implementation, normalized to 100 range)
            alignment_score = cls._lens_3_profile_alignment(student, mentor)
            
            # FINAL MATCH SCORE
            # Formula: 60% Semantic + 40% Alignment
            # (Domain filter is binary)
            final_score = (semantic_score * 0.6) + (alignment_score)
            final_score = min(100.0, final_score) # Cap at 100
            
            if final_score > 10: # Minimum threshold to show
                explanation = cls._generate_explanation(student, mentor, semantic_sim, alignment_score)
                
                # Extract trend info for frontend display
                trends = []
                if hasattr(mentor, 'topic_trends') and mentor.topic_trends:
                    # Sort by count desc
                    sorted_trends = sorted(mentor.topic_trends, key=lambda x: x.total_count, reverse=True)
                    for t in sorted_trends[:3]: # Top 3
                        if t.topic:
                            trends.append({
                                "topic": t.topic.name,
                                "status": t.trend_status,
                                "count": t.total_count
                            })

                matches.append({
                    "mentor_id": mentor.id,
                    "mentor_name": mentor.user.name if mentor.user else "Unknown",
                    "mentor_type": mentor.mentor_type,
                    "institution": mentor.university or mentor.company,
                    "position": mentor.position,
                    "match_score": round(final_score),
                    "semantic_score": round(semantic_score),
                    "alignment_score": round(alignment_score),
                    "explanation": explanation,
                    "research_areas": mentor.research_areas,
                    "accepting_students": mentor.accepting_phd_students,
                    "trends": trends
                })
        
        # Sort by Final Match Score (Desc)
        matches.sort(key=lambda x: x["match_score"], reverse=True)
        
        return matches
