from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app import deps
from app.db import models
from app import schemas
from app.services.matching import calculate_readiness_score

router = APIRouter()

def calculate_student_completeness(profile: models.StudentProfile, skill_count: int) -> int:
    # Deprecated in favor of readiness_score, but keeping for backward compatibility if needed
    score = 0
    if profile.university: score += 15
    if profile.degree: score += 15
    if profile.major: score += 15
    if profile.bio and len(profile.bio) > 20: score += 15
    if profile.github_url: score += 20
    if skill_count > 0: score += 20
    return min(score, 100)

def calculate_mentor_completeness(profile: models.MentorProfile) -> int:
    score = 0
    if profile.lab_name: score += 15
    if profile.university: score += 15
    if profile.position: score += 15
    if profile.bio and len(profile.bio) > 20: score += 15
    if profile.research_areas: score += 20
    if profile.is_verified: score += 20
    return min(score, 100)

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(deps.get_current_user)):
    """
    Get current user details with profile information.
    """
    return current_user

@router.put("/me/student", response_model=schemas.StudentProfileResponse)
def update_student_profile(
    profile_in: schemas.StudentProfileUpdate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.role != "student" and current_user.role != "user":
        raise HTTPException(status_code=403, detail="Only students can create student profiles")
    
    if current_user.role == "user":
        current_user.role = "student"
        db.add(current_user)
    
    profile = current_user.student_profile
    profile_data = profile_in.dict(exclude_unset=True)
    
    # Optional: Update user's display name if provided
    name = profile_data.pop("name", None)
    if name:
        current_user.name = name
        db.add(current_user)
    
    # Handle Nested Relations (Arrays)
    work_ex_data = profile_data.pop("work_experiences", None)
    edu_data = profile_data.pop("educations", None)
    proj_data = profile_data.pop("projects", None)
    pub_data = profile_data.pop("publications", None)
    
    if not profile:
        profile = models.StudentProfile(user_id=current_user.id, **profile_data)
        db.add(profile)
        db.flush() # Ensure ID is generated
    else:
        for field, value in profile_data.items():
            setattr(profile, field, value)
    
    # Update Relations if provided
    # Strategy: Replace all (since form sends full list)
    if work_ex_data is not None:
        # Clear existing (cascade delete should handle orphans if configured, 
        # but explicit clear is safer for replacing list)
        # Note: SQLAlchemy relationship assignment usually replaces the collection.
        # We need to convert dicts to model instances.
        profile.work_experiences = [models.WorkExperience(**item) for item in work_ex_data]
        
    if edu_data is not None:
        profile.educations = [models.Education(**item) for item in edu_data]
        
    if proj_data is not None:
        profile.projects = [models.Project(**item) for item in proj_data]
        
    if pub_data is not None:
        profile.publications = [models.Publication(**item) for item in pub_data]
    
    # Update readiness score
    # Note: Skills might not be updated here (usually separate endpoint), but we use current skills
    profile.readiness_score = calculate_readiness_score(profile, current_user.skills)
    
    db.commit()
    db.refresh(profile)
    return profile

@router.put("/me/mentor", response_model=schemas.MentorProfileResponse)
def update_mentor_profile(
    profile_in: schemas.MentorProfileUpdate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.role != "mentor" and current_user.role != "user":
        raise HTTPException(status_code=403, detail="Only mentors can create mentor profiles")
    
    if current_user.role == "user":
        current_user.role = "mentor"
        db.add(current_user)
    
    profile = current_user.mentor_profile
    if not profile:
        profile = models.MentorProfile(user_id=current_user.id, **profile_in.dict(exclude_unset=True))
        db.add(profile)
    else:
        for field, value in profile_in.dict(exclude_unset=True).items():
            setattr(profile, field, value)
            
    db.commit()
    db.refresh(profile)
    return profile

@router.post("/me/skills", response_model=List[schemas.SkillResponse])
def update_user_skills(
    skills: List[schemas.SkillCreate],
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Update user skills (replace existing).
    Creates skills if they don't exist.
    """
    # clear existing skills
    current_user.skills = []
    
    for skill_data in skills:
        # Check if skill exists
        skill = db.query(models.Skill).filter(models.Skill.name.ilike(skill_data.name)).first()
        if not skill:
            skill = models.Skill(name=skill_data.name)
            db.add(skill)
            db.commit()
            db.refresh(skill)
        
        current_user.skills.append(skill)
    
    # Update readiness score if student
    if current_user.student_profile:
        current_user.student_profile.readiness_score = calculate_readiness_score(current_user.student_profile, current_user.skills)
    
    db.commit()
    db.refresh(current_user)
    return current_user.skills

@router.get("/{user_id}", response_model=schemas.UserResponse)
def read_profile(
    user_id: int,
    db: Session = Depends(deps.get_db)
):
    """
    Public profile view.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/me/completeness")
def get_profile_completeness(
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.role == "student":
        if not current_user.student_profile:
            return {"score": 0, "role": "student"}
        # Use the new readiness_score if available, otherwise fallback
        score = current_user.student_profile.readiness_score
        if score is None:
             score = calculate_student_completeness(current_user.student_profile, len(current_user.skills))
        
        return {
            "score": score,
            "role": "student"
        }
    elif current_user.role == "mentor":
        if not current_user.mentor_profile:
            return {"score": 0, "role": "mentor"}
        return {
            "score": calculate_mentor_completeness(current_user.mentor_profile),
            "role": "mentor"
        }
    elif current_user.role == "admin":
        return {"score": 100, "role": "admin"}
    else:
        # For "user" role or others
        return {"score": 0, "role": current_user.role}
