from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.db.models import Opportunity, User
from app.schemas import OpportunityCreate, OpportunityResponse, OpportunityUpdate
from app.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=OpportunityResponse)
def create_opportunity(
    opportunity: OpportunityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "mentor":
        raise HTTPException(status_code=403, detail="Only mentors can post opportunities")
    
    new_opportunity = Opportunity(
        mentor_id=current_user.id,
        title=opportunity.title,
        description=opportunity.description,
        type=opportunity.type,
        requirements=opportunity.requirements,
        is_open=opportunity.is_open
    )
    db.add(new_opportunity)
    db.commit()
    db.refresh(new_opportunity)
    return new_opportunity

@router.get("/", response_model=List[OpportunityResponse])
def read_opportunities(
    skip: int = 0,
    limit: int = 100,
    type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Opportunity)
    if type:
        query = query.filter(Opportunity.type == type)
    opportunities = query.offset(skip).limit(limit).all()
    return opportunities

@router.get("/{opportunity_id}", response_model=OpportunityResponse)
def read_opportunity(opportunity_id: int, db: Session = Depends(get_db)):
    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opportunity

@router.put("/{opportunity_id}", response_model=OpportunityResponse)
def update_opportunity(
    opportunity_id: int,
    opportunity_update: OpportunityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    if opportunity.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this opportunity")
    
    for key, value in opportunity_update.dict(exclude_unset=True).items():
        setattr(opportunity, key, value)
    
    db.commit()
    db.refresh(opportunity)
    return opportunity
