from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.db.models import Opportunity, User, OpportunitySkill
from app.schemas import OpportunityCreate, OpportunityResponse, OpportunityUpdate
from app.deps import get_current_user
from app.services.matching import calculate_match_score

router = APIRouter()

@router.post("/", response_model=OpportunityResponse)
def create_opportunity(
    opportunity: OpportunityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "mentor":
        raise HTTPException(status_code=403, detail="Only mentors can post opportunities")
    
    # Extract skills data
    skills_data = opportunity.skills
    
    opportunity_data = opportunity.model_dump(exclude={"skills"})
    new_opportunity = Opportunity(
        mentor_id=current_user.id,
        **opportunity_data
    )
    db.add(new_opportunity)
    db.commit()
    db.refresh(new_opportunity)
    
    # Add skills
    if skills_data:
        for skill_item in skills_data:
            opp_skill = OpportunitySkill(
                opportunity_id=new_opportunity.id,
                skill_id=skill_item.skill_id,
                weight=skill_item.weight
            )
            db.add(opp_skill)
        db.commit()
        db.refresh(new_opportunity)
        
    return new_opportunity

@router.get("/", response_model=List[OpportunityResponse])
def read_opportunities(
    skip: int = 0,
    limit: int = 100,
    type: Optional[str] = None,
    mentor_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Opportunity)
    if type:
        query = query.filter(Opportunity.type == type)
    if mentor_id:
        query = query.filter(Opportunity.mentor_id == mentor_id)
    opportunities = query.offset(skip).limit(limit).all()
    return opportunities

@router.get("/{opportunity_id}", response_model=OpportunityResponse)
def read_opportunity(opportunity_id: int, db: Session = Depends(get_db)):
    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opportunity

@router.get("/{opportunity_id}/match-preview")
def get_match_preview(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can view match previews")
        
    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    score, details = calculate_match_score(current_user, opportunity)
    
    return {
        "match_score": score,
        "details": details
    }

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
