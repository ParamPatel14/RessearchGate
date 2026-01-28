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
    Updated to support both legacy fields and new structured data arrays.
    """
    if not student_profile:
        return 0.0
        
    score = 0
    
    # 1. Education (Max 30)
    has_education = False
    # Check new array relationship
    if student_profile.educations and len(student_profile.educations) > 0:
        has_education = True
    # Check legacy fields
    elif student_profile.university and student_profile.degree:
        has_education = True
        
    if has_education:
        score += 30
    
    # 2. Profile Basics (Max 20)
    # Bio/Headline
    if (student_profile.bio and len(student_profile.bio) > 20) or (student_profile.headline and len(student_profile.headline) > 5):
        score += 10
        
    # Links (GitHub/LinkedIn/Resume/Website)
    links_count = 0
    if student_profile.github_url: links_count += 1
    if student_profile.linkedin_url: links_count += 1
    if student_profile.resume_url: links_count += 1
    if student_profile.website_url: links_count += 1
    if student_profile.scholar_url: links_count += 1
    
    if links_count >= 2:
        score += 10
    elif links_count >= 1:
        score += 5
        
    # 3. Skills (Max 30)
    # Check both relational skills and text-based skills
    skill_points = 0
    
    # Relational skills
    if user_skills and len(user_skills) >= 3:
        skill_points = 30
    elif user_skills and len(user_skills) >= 1:
        skill_points = 15
        
    # Text-based skills (fallback or additive if relational is missing)
    if skill_points < 30:
        text_skills_count = 0
        if student_profile.primary_skills:
            text_skills_count += len(student_profile.primary_skills.split(','))
        if student_profile.tools_libraries:
            text_skills_count += len(student_profile.tools_libraries.split(','))
            
        if text_skills_count >= 5:
            skill_points = 30
        elif text_skills_count >= 3:
            skill_points = max(skill_points, 15)
            
    score += skill_points
    
    # 4. Experience & Projects (Max 20)
    has_exp = False
    if student_profile.work_experiences and len(student_profile.work_experiences) > 0:
        has_exp = True
    
    has_proj = False
    if student_profile.projects and len(student_profile.projects) > 0:
        has_proj = True
        
    if has_exp:
        score += 20
    elif has_proj:
        score += 15 # Projects only gives 15 if no work exp
    
    return float(min(100, score))
