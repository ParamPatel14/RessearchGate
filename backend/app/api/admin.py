from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import deps
from app.db import models
from app import schemas

router = APIRouter()

def check_admin(current_user: models.User):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )

@router.put("/verify/mentor/{user_id}", response_model=schemas.MentorProfileResponse)
def verify_mentor(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    check_admin(current_user)
    
    mentor_profile = db.query(models.MentorProfile).filter(models.MentorProfile.user_id == user_id).first()
    if not mentor_profile:
        raise HTTPException(status_code=404, detail="Mentor profile not found")
    
    mentor_profile.is_verified = True
    db.commit()
    db.refresh(mentor_profile)
    return mentor_profile

@router.get("/mentors/pending", response_model=List[schemas.MentorProfileResponse])
def get_pending_mentors(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    check_admin(current_user)
    
    mentors = db.query(models.MentorProfile).filter(models.MentorProfile.is_verified == False).all()
    return mentors

@router.get("/users/students", response_model=List[schemas.UserResponse])
def get_all_students(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    check_admin(current_user)
    students = db.query(models.User).filter(models.User.role == "student").all()
    return students

@router.get("/users/mentors", response_model=List[schemas.UserResponse])
def get_all_mentors(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    check_admin(current_user)
    mentors = db.query(models.User).filter(models.User.role == "mentor").all()
    return mentors

@router.post("/opportunities", response_model=schemas.OpportunityResponse)
def create_admin_opportunity(
    opportunity: schemas.OpportunityCreate,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    check_admin(current_user)
    # Admin creates opportunity using their own ID as creator (mentor_id)
    # This assumes Admin user is also a 'User' in the system.
    # We might need to handle skills creation separately as in opportunities.py
    
    db_opportunity = models.Opportunity(
        title=opportunity.title,
        description=opportunity.description,
        type=opportunity.type,
        requirements=opportunity.requirements,
        is_open=opportunity.is_open,
        funding_amount=opportunity.funding_amount,
        currency=opportunity.currency,
        grant_agency=opportunity.grant_agency,
        mentor_id=current_user.id
    )
    db.add(db_opportunity)
    db.commit()
    db.refresh(db_opportunity)
    
    # Add skills
    if opportunity.skills:
        for skill_item in opportunity.skills:
            op_skill = models.OpportunitySkill(
                opportunity_id=db_opportunity.id,
                skill_id=skill_item.skill_id,
                weight=skill_item.weight
            )
            db.add(op_skill)
        db.commit()
        db.refresh(db_opportunity)
        
    return db_opportunity

@router.get("/applications", response_model=List[schemas.ApplicationResponse])
def get_all_applications(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    check_admin(current_user)
    applications = db.query(models.Application).all()
    return applications

