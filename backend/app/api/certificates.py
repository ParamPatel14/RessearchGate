from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid
from app.db.database import get_db
from app.db.models import User, Certificate, Opportunity
from app.deps import get_current_user

router = APIRouter()

class CertificateCreate(BaseModel):
    student_id: int
    opportunity_id: int

class CertificateResponse(BaseModel):
    id: int
    uuid: str
    student_id: int
    mentor_id: int
    opportunity_id: int
    issue_date: datetime
    pdf_url: str
    
    class Config:
        from_attributes = True

@router.post("/generate", response_model=CertificateResponse)
def generate_certificate(
    data: CertificateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "mentor":
        raise HTTPException(status_code=403, detail="Only mentors can issue certificates")
    
    opportunity = db.query(Opportunity).filter(Opportunity.id == data.opportunity_id).first()
    if not opportunity or opportunity.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized for this opportunity")
    
    # Check if student completed work (For now, we trust mentor's manual trigger)
    
    # Generate Unique Code
    cert_uuid = str(uuid.uuid4())
    
    # Mock PDF Generation (In real app, use reportlab or weasyprint)
    # Storing a mock URL for now
    pdf_url = f"/static/certificates/{cert_uuid}.pdf"
    
    new_cert = Certificate(
        uuid=cert_uuid,
        student_id=data.student_id,
        mentor_id=current_user.id,
        opportunity_id=data.opportunity_id,
        pdf_url=pdf_url
    )
    
    db.add(new_cert)
    db.commit()
    db.refresh(new_cert)
    
    return new_cert

@router.get("/{uuid}", response_model=CertificateResponse)
def verify_certificate(
    uuid: str,
    db: Session = Depends(get_db)
):
    cert = db.query(Certificate).filter(Certificate.uuid == uuid).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return cert

@router.get("/my/certificates", response_model=List[CertificateResponse])
def get_my_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "student":
        return db.query(Certificate).filter(Certificate.student_id == current_user.id).all()
    elif current_user.role == "mentor":
        return db.query(Certificate).filter(Certificate.mentor_id == current_user.id).all()
    return []
