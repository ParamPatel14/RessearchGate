from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db import models
from app import schemas
from app import deps

router = APIRouter()

# --- Real World Project Interest ---

@router.post("/interests", response_model=schemas.RealWorldProjectInterestResponse)
def create_interest(
    interest: schemas.RealWorldProjectInterestCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can express interest")
        
    db_interest = models.RealWorldProjectInterest(
        student_id=current_user.id,
        interest_area=interest.interest_area,
        preferred_industry=interest.preferred_industry,
        current_skills=interest.current_skills
    )
    db.add(db_interest)
    db.commit()
    db.refresh(db_interest)
    return db_interest

@router.get("/interests", response_model=List[schemas.RealWorldProjectInterestResponse])
def get_interests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.role == "student":
        return db.query(models.RealWorldProjectInterest).filter(models.RealWorldProjectInterest.student_id == current_user.id).all()
    # Admin/Mentor can see all
    if current_user.role in ["admin", "mentor"]:
        return db.query(models.RealWorldProjectInterest).all()
    return []

# --- Industrial Visits ---

@router.post("/visits", response_model=schemas.IndustrialVisitResponse)
def create_visit(
    visit: schemas.IndustrialVisitCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.role not in ["admin", "mentor"]:
        raise HTTPException(status_code=403, detail="Not authorized to create visits")
        
    db_visit = models.IndustrialVisit(
        organizer_id=current_user.id,
        **visit.dict()
    )
    db.add(db_visit)
    db.commit()
    db.refresh(db_visit)
    return db_visit

@router.get("/visits", response_model=List[schemas.IndustrialVisitResponse])
def get_visits(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    return db.query(models.IndustrialVisit).offset(skip).limit(limit).all()

@router.post("/visits/{visit_id}/enroll", response_model=schemas.IndustrialVisitEnrollmentResponse)
def enroll_visit(
    visit_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can enroll")
        
    visit = db.query(models.IndustrialVisit).filter(models.IndustrialVisit.id == visit_id).first()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
        
    # Check if already enrolled
    existing = db.query(models.IndustrialVisitEnrollment).filter(
        models.IndustrialVisitEnrollment.visit_id == visit_id,
        models.IndustrialVisitEnrollment.student_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled")

    # Check capacity
    count = db.query(models.IndustrialVisitEnrollment).filter(models.IndustrialVisitEnrollment.visit_id == visit_id).count()
    if count >= visit.max_students:
        raise HTTPException(status_code=400, detail="Visit is full")

    enrollment = models.IndustrialVisitEnrollment(
        visit_id=visit_id,
        student_id=current_user.id,
        status="pending" # Pending selection
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment

# --- Beehive Events ---

@router.post("/beehive", response_model=schemas.BeehiveEventResponse)
def create_beehive_event(
    event: schemas.BeehiveEventCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create Beehive events")
        
    db_event = models.BeehiveEvent(
        organizer_id=current_user.id,
        **event.dict()
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/beehive", response_model=List[schemas.BeehiveEventResponse])
def get_beehive_events(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    return db.query(models.BeehiveEvent).filter(models.BeehiveEvent.is_active == True).offset(skip).limit(limit).all()

@router.post("/beehive/{event_id}/enroll", response_model=schemas.BeehiveEnrollmentResponse)
def enroll_beehive(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    event = db.query(models.BeehiveEvent).filter(models.BeehiveEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    existing = db.query(models.BeehiveEnrollment).filter(
        models.BeehiveEnrollment.event_id == event_id,
        models.BeehiveEnrollment.student_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled")
        
    count = db.query(models.BeehiveEnrollment).filter(models.BeehiveEnrollment.event_id == event_id).count()
    if count >= event.max_seats:
        raise HTTPException(status_code=400, detail="Event is full")
        
    enrollment = models.BeehiveEnrollment(
        event_id=event_id,
        student_id=current_user.id,
        payment_status="pending", # Needs payment gateway integration logic later
        status="confirmed"
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment
