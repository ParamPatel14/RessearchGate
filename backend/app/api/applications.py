from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json
from datetime import datetime
from app.db.database import get_db
from app.db.models import Application, Opportunity, User, Message
from app.schemas import ApplicationCreate, ApplicationResponse, ApplicationUpdate
from app.deps import get_current_user
from app.services.matching import calculate_match_score

router = APIRouter()

@router.post("/", response_model=ApplicationResponse)
def create_application(
    application: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can apply for opportunities")
    
    # Check if opportunity exists and is open
    opportunity = db.query(Opportunity).filter(Opportunity.id == application.opportunity_id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    if not opportunity.is_open:
        raise HTTPException(status_code=400, detail="This opportunity is closed")
    
    # Check if already applied
    existing_application = db.query(Application).filter(
        Application.student_id == current_user.id,
        Application.opportunity_id == application.opportunity_id
    ).first()
    if existing_application:
        raise HTTPException(status_code=400, detail="You have already applied to this opportunity")

    # Calculate match score snapshot
    if application.match_score is not None:
        score = application.match_score
        details = json.loads(application.match_details) if application.match_details else {}
    else:
        score, details = calculate_match_score(current_user, opportunity)

    new_application = Application(
        student_id=current_user.id,
        opportunity_id=application.opportunity_id,
        cover_letter=application.cover_letter,
        status="pending",
        match_score=score,
        match_details=json.dumps(details)
    )
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    return new_application

@router.get("/me", response_model=List[ApplicationResponse])
def read_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students have personal applications")
    
    applications = db.query(Application).filter(Application.student_id == current_user.id).all()
    return applications

@router.get("/mentor", response_model=List[ApplicationResponse])
def read_mentor_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "mentor":
        raise HTTPException(status_code=403, detail="Only mentors can view applications for their opportunities")
    
    # Join Opportunity to filter by mentor_id and order by match_score descending (Ranked Applicants)
    applications = db.query(Application).join(Opportunity).filter(Opportunity.mentor_id == current_user.id).order_by(Application.match_score.desc()).all()
    return applications

@router.put("/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: int,
    status_update: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "mentor":
        raise HTTPException(status_code=403, detail="Only mentors can update application status")
    
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Verify the mentor owns the opportunity
    if not application.opportunity:
        raise HTTPException(status_code=404, detail="Opportunity associated with this application not found")

    if application.opportunity.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this application")
    
    old_status = application.status
    application.status = status_update.status
    
    # Send notification if accepted
    if status_update.status == "accepted" and old_status != "accepted":
        message_content = f"Congratulations! Your application for '{application.opportunity.title}' has been accepted."
        new_message = Message(
            sender_id=current_user.id,
            receiver_id=application.student_id,
            content=message_content,
            timestamp=datetime.utcnow()
        )
        db.add(new_message)
        
    db.commit()
    db.refresh(application)
    return application
