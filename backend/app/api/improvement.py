from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
from app.db.database import get_db
from app.db.models import User, Opportunity, ImprovementPlan, PlanItem, StudentProfile
from app.deps import get_current_user
from app.services import ai_service

router = APIRouter()

# Pydantic Models
class PlanItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    type: str
    status: str
    evidence_link: Optional[str] = None
    estimated_hours: Optional[str] = None
    deadline: Optional[datetime] = None
    priority: Optional[str] = "medium"

class PlanItemUpdate(BaseModel):
    status: Optional[str] = None
    evidence_link: Optional[str] = None

class PlanItemResponse(PlanItemBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ImprovementPlanResponse(BaseModel):
    id: int
    opportunity_id: int
    opportunity_title: str
    status: str
    created_at: datetime
    items: List[PlanItemResponse]

    class Config:
        from_attributes = True

# Helper Functions
def format_student_profile(profile: StudentProfile) -> str:
    """Helper to convert structured profile data into a text resume format."""
    if not profile:
        return "No profile information available."
    
    # Core Info
    text = f"Name: {profile.user.name}\n"
    text += f"Email: {profile.user.email}\n"
    text += f"Headline: {profile.headline or 'N/A'}\n"
    text += f"Bio: {profile.bio or 'N/A'}\n\n"
    
    # Skills
    text += "Skills:\n"
    if profile.primary_skills:
        text += f"- Primary: {profile.primary_skills}\n"
    if profile.tools_libraries:
        text += f"- Tools/Libraries: {profile.tools_libraries}\n"
    text += "\n"
    
    # Work Experience
    text += "Work Experience:\n"
    for exp in profile.work_experiences:
        text += f"- {exp.title} at {exp.company} ({exp.start_date} - {exp.end_date})\n"
        text += f"  Description: {exp.description}\n"
        text += f"  Skills Used: {exp.skills_used}\n"
    text += "\n"
    
    # Education
    text += "Education:\n"
    for edu in profile.educations:
        text += f"- {edu.degree} from {edu.institution} ({edu.start_year} - {edu.end_year})\n"
        text += f"  Grade: {edu.grade}\n"
    text += "\n"
    
    # Projects
    text += "Projects:\n"
    for proj in profile.projects:
        text += f"- {proj.title}: {proj.description}\n"
        text += f"  Tech Stack: {proj.tech_stack}\n"
        
    return text

def format_opportunity(opp: Opportunity) -> str:
    """Helper to convert opportunity data into text."""
    text = f"Title: {opp.title}\n"
    text += f"Type: {opp.type}\n"
    text += f"Description: {opp.description}\n"
    text += f"Requirements: {opp.requirements}\n"
    
    # Add skills with weights if available
    if opp.required_skills:
        text += "Required Skills:\n"
        for os in opp.required_skills:
            weight_desc = {1: "Nice to have", 3: "Important", 5: "Critical"}.get(os.weight, "Important")
            text += f"- {os.skill.name} ({weight_desc})\n"
            
    return text

# Endpoints

@router.post("/generate/{opportunity_id}", response_model=ImprovementPlanResponse)
async def generate_improvement_plan(
    opportunity_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can generate improvement plans")

    # Check if plan already exists
    existing_plan = db.query(ImprovementPlan).filter(
        ImprovementPlan.student_id == current_user.id,
        ImprovementPlan.opportunity_id == opportunity_id
    ).first()
    
    if existing_plan:
        return _format_plan_response(existing_plan)

    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # Fetch Student Profile
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Student profile not found. Please complete your profile first.")

    # Create Plan Record
    new_plan = ImprovementPlan(
        student_id=current_user.id,
        opportunity_id=opportunity_id,
        status="in_progress"
    )
    db.add(new_plan)
    db.flush() # Get ID

    # Generate Plan Items via AI
    resume_text = format_student_profile(profile)
    job_desc = format_opportunity(opportunity)
    
    # Calculate days remaining (default 30 if no deadline)
    days_remaining = 30
    if opportunity.deadline:
         delta = opportunity.deadline - datetime.utcnow()
         if delta.days > 0:
             days_remaining = delta.days
    
    ai_items = await ai_service.generate_improvement_plan(resume_text, job_desc, days_remaining)
    
    if not ai_items:
        # Fallback to simple skill gap if AI fails
        # (Simplified fallback omitted for brevity, but should handle error gracefully)
        pass

    for item_data in ai_items:
        # Calculate absolute deadline date
        deadline_date = None
        if "deadline_day_offset" in item_data:
             offset = int(item_data["deadline_day_offset"])
             deadline_date = datetime.utcnow() + timedelta(days=offset)

        item = PlanItem(
            plan_id=new_plan.id,
            title=item_data.get("title", "Task"),
            description=item_data.get("description", ""),
            type=item_data.get("type", "skill_gap"),
            status="pending",
            estimated_hours=item_data.get("estimated_hours"),
            deadline=deadline_date,
            priority=item_data.get("priority", "medium")
        )
        db.add(item)

    db.commit()
    db.refresh(new_plan)
    return _format_plan_response(new_plan)

@router.get("/", response_model=List[ImprovementPlanResponse])
def get_my_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plans = db.query(ImprovementPlan).filter(ImprovementPlan.student_id == current_user.id).all()
    return [_format_plan_response(p) for p in plans]

@router.get("/{plan_id}", response_model=ImprovementPlanResponse)
def get_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    plan = db.query(ImprovementPlan).filter(ImprovementPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    if plan.student_id != current_user.id and plan.opportunity.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this plan")
        
    return _format_plan_response(plan)

@router.put("/item/{item_id}", response_model=PlanItemResponse)
def update_plan_item(
    item_id: int,
    update: PlanItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(PlanItem).filter(PlanItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    if item.plan.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this item")
        
    if update.status:
        item.status = update.status
    if update.evidence_link is not None:
        item.evidence_link = update.evidence_link
        
    db.commit()
    db.refresh(item)
    return item

@router.get("/mentor/{opportunity_id}", response_model=List[ImprovementPlanResponse])
def get_plans_for_opportunity(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    opportunity = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    if opportunity.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view plans for this opportunity")
        
    plans = db.query(ImprovementPlan).filter(ImprovementPlan.opportunity_id == opportunity_id).all()
    return [_format_plan_response(p) for p in plans]

def _format_plan_response(plan):
    # Helper to format response since Pydantic's orm_mode might need help with nested relationships sometimes
    # or just to be safe with the opportunity title
    return {
        "id": plan.id,
        "opportunity_id": plan.opportunity_id,
        "opportunity_title": plan.opportunity.title,
        "status": plan.status,
        "created_at": plan.created_at,
        "items": plan.items
    }
