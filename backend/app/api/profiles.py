from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app import deps
from app.db import models
from app import schemas

router = APIRouter()

def calculate_student_completeness(profile: models.StudentProfile, skill_count: int) -> int:
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
    if not profile:
        profile = models.StudentProfile(user_id=current_user.id, **profile_in.dict(exclude_unset=True))
        db.add(profile)
    else:
        for field, value in profile_in.dict(exclude_unset=True).items():
            setattr(profile, field, value)
    
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

@router.post("/me/skills", response_model=List[schemas.SkillResponse])
def add_skills(
    skills: List[str],
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Add skills to the current user's profile. Creates new skills if they don't exist.
    """
    for skill_name in skills:
        skill_name = skill_name.lower().strip()
        skill = db.query(models.Skill).filter(models.Skill.name == skill_name).first()
        if not skill:
            skill = models.Skill(name=skill_name)
            db.add(skill)
            db.commit()
            db.refresh(skill)
        
        if skill not in current_user.skills:
            current_user.skills.append(skill)
    
    db.commit()
    db.refresh(current_user)
    return current_user.skills

@router.get("/me/completeness")
def get_profile_completeness(
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.role == "student":
        if not current_user.student_profile:
            return {"score": 0, "role": "student"}
        return {
            "score": calculate_student_completeness(current_user.student_profile, len(current_user.skills)),
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
