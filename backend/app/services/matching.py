from app.db.models import Opportunity, User, StudentProfile

def calculate_match_score(student_user: User, opportunity: Opportunity):
    """
    Calculates the match percentage between a student and an opportunity
    based on weighted skills.
    """
    # 1. Get student skills (set of skill IDs)
    student_skill_ids = {s.id for s in student_user.skills}
    
    # 2. Get opportunity required skills
    # opportunity.required_skills is a list of OpportunitySkill objects
    required_skills = opportunity.required_skills
    
    if not required_skills:
        # If no skills are explicitly required, we might consider it a 100% match or 0%.
        # Usually if no requirements, anyone can apply.
        return 100.0, {"details": "No specific skills required."}
        
    total_weight = 0
    matched_weight = 0
    missing_skills = []
    matched_skills = []
    
    for req_skill in required_skills:
        weight = req_skill.weight
        total_weight += weight
        
        # Access skill name safely
        skill_name = req_skill.skill.name if req_skill.skill else f"Skill ID {req_skill.skill_id}"
        
        if req_skill.skill_id in student_skill_ids:
            matched_weight += weight
            matched_skills.append(skill_name)
        else:
            missing_skills.append({
                "name": skill_name,
                "weight": weight,
                "importance": "Critical" if weight >= 5 else ("Important" if weight >= 3 else "Nice to have")
            })
            
    if total_weight == 0:
        score = 100.0
    else:
        score = (matched_weight / total_weight) * 100.0
        
    details = {
        "score": round(score, 1),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "total_required_skills": len(required_skills),
        "matched_count": len(matched_skills)
    }
    
    return round(score, 1), details

def calculate_readiness_score(student_profile: StudentProfile, user_skills: list):
    """
    Calculates a global readiness score for a student based on profile completeness and skills.
    """
    if not student_profile:
        return 0.0
        
    score = 0
    
    # Profile Completeness (Total 60)
    if student_profile.university and student_profile.degree and student_profile.major:
        score += 30
    
    if student_profile.bio and len(student_profile.bio) > 50:
        score += 10
        
    if student_profile.github_url:
        score += 10
        
    if student_profile.scholar_url or student_profile.website_url:
        score += 5
        
    if student_profile.intro_video_url:
        score += 5
        
    # Skills (Total 40)
    skill_count = len(user_skills)
    if skill_count >= 5:
        score += 40
    elif skill_count >= 3:
        score += 25
    elif skill_count >= 1:
        score += 10
        
    return float(min(100, score))
