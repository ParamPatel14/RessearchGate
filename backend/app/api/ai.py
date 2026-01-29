from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models
from app.deps import get_current_user
from app.services import ai_service
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class AIAnalysisRequest(BaseModel):
    opportunity_id: int

class MatchAnalysisResponse(BaseModel):
    score: int
    missing_skills: List[str]
    explanation: str

class CoverLetterResponse(BaseModel):
    cover_letter: str

def format_student_profile(profile: models.StudentProfile) -> str:
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

def format_opportunity(opp: models.Opportunity) -> str:
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

@router.post("/match-analysis", response_model=MatchAnalysisResponse)
async def analyze_match(
    request: AIAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Analyzes the match between the current user's profile and the specified opportunity.
    """
    if current_user.role != "student":
         raise HTTPException(status_code=403, detail="Only students can request match analysis")
         
    # Fetch Opportunity
    opportunity = db.query(models.Opportunity).filter(models.Opportunity.id == request.opportunity_id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    # Fetch Student Profile
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Student profile not found. Please complete your profile first.")
        
    resume_text = format_student_profile(profile)
    job_desc = format_opportunity(opportunity)
    
    result = await ai_service.analyze_match(resume_text, job_desc)
    
    return result

@router.post("/cover-letter", response_model=CoverLetterResponse)
async def generate_cover_letter(
    request: AIAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Generates a cover letter for the specified opportunity based on the user's profile.
    """
    if current_user.role != "student":
         raise HTTPException(status_code=403, detail="Only students can generate cover letters")
         
    # Fetch Opportunity
    opportunity = db.query(models.Opportunity).filter(models.Opportunity.id == request.opportunity_id).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")
        
    # Fetch Student Profile
    profile = db.query(models.StudentProfile).filter(models.StudentProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Student profile not found. Please complete your profile first.")
        
    resume_text = format_student_profile(profile)
    job_desc = format_opportunity(opportunity)
    
    cover_letter = await ai_service.generate_cover_letter(resume_text, job_desc)
    
    return {"cover_letter": cover_letter}
