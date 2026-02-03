from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
import json
from datetime import datetime
from app.db.database import get_db
from app.db.models import Application, Opportunity, User, Message, StudentProfile
from app.schemas import ApplicationCreate, ApplicationResponse, ApplicationUpdate
from app.deps import get_current_user
from app.services.matching import calculate_match_score
from app.services.twilio_service import send_whatsapp_message
from app.core.config import settings

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
    applications = db.query(Application)\
        .join(Opportunity)\
        .options(
            joinedload(Application.student).joinedload(User.student_profile).joinedload(StudentProfile.projects),
            joinedload(Application.student).joinedload(User.student_profile).joinedload(StudentProfile.educations),
            joinedload(Application.student).joinedload(User.student_profile).joinedload(StudentProfile.work_experiences),
            joinedload(Application.opportunity)
        )\
        .filter(Opportunity.mentor_id == current_user.id)\
        .order_by(Application.match_score.desc())\
        .all()
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

        # Send WhatsApp Notification
        # Use the specific test number as requested by user
        student_phone = "+918105350692"
        
        # In production, use real profile phone:
        # if application.student and application.student.student_profile and application.student.student_profile.phone_number:
        #     student_phone = application.student.student_profile.phone_number

        if student_phone:
            student_name = application.student.name
            opp_title = application.opportunity.title
            contact_number = settings.TWILIO_CONTACT_NUMBER
            
            whatsapp_body = (
                f"Hello {student_name}, congratulations! "
                f"You have been selected for the role '{opp_title}'. "
                f"Please contact {contact_number} for further information."
            )
            
            # Log the attempt
            print(f"Sending WhatsApp to {student_phone} from {settings.TWILIO_WHATSAPP_NUMBER}")
            send_whatsapp_message(student_phone, whatsapp_body)
        
    db.commit()
    db.refresh(application)
    return application
