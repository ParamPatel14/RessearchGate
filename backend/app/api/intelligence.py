from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Any, Optional
from pydantic import BaseModel
from app.db.database import get_db
from app.db.models import User, SavedResearchGap
from app.deps import get_current_user
from app.services.research_service import ResearchService
from app.core.cache import SimpleCache

router = APIRouter()
cache = SimpleCache()

@router.post("/mentors/{mentor_id}/ingest")
async def ingest_publications(
    mentor_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Auth check: Admin or the Mentor themselves
    if current_user.role != "admin" and (current_user.mentor_profile is None or current_user.mentor_profile.id != mentor_id):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Run in background as it calls AI
    background_tasks.add_task(ResearchService.ingest_publications, db, mentor_id)
    return {"message": "Ingestion started in background"}

@router.post("/mentors/{mentor_id}/analyze")
async def analyze_research(
    mentor_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Auth check
    if current_user.role != "admin" and (current_user.mentor_profile is None or current_user.mentor_profile.id != mentor_id):
        raise HTTPException(status_code=403, detail="Not authorized")
        
    background_tasks.add_task(ResearchService.analyze_trends, db, mentor_id)
    return {"message": "Analysis started in background"}

@router.get("/mentors/{mentor_id}/analytics")
def get_analytics(
    mentor_id: int,
    db: Session = Depends(get_db)
):
    # Publicly accessible (or at least for logged in users)
    return ResearchService.get_mentor_analytics(db, mentor_id)

@router.get("/mentors/{mentor_id}/gaps")
async def get_research_gaps(
    mentor_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns AI-generated research gaps for a student-mentor pair.
    """
    # Auth check: User must be the student or the mentor or admin
    is_student = current_user.student_profile and current_user.student_profile.id == student_id
    is_mentor = current_user.mentor_profile and current_user.mentor_profile.id == mentor_id
    if not (is_student or is_mentor or current_user.role == "admin"):
        raise HTTPException(status_code=403, detail="Not authorized to view these gaps")
        
    try:
        # Check cache first
        cache_key = f"research_gaps_{student_id}_{mentor_id}"
        cached_gaps = cache.get(cache_key)
        if cached_gaps:
            return cached_gaps

        gaps = await ResearchService.generate_gaps_for_pair(db, mentor_id, student_id)
        
        # Cache for 24 hours
        cache.set(cache_key, gaps, ttl_seconds=86400)
        
        return gaps
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Saved Gaps Endpoints

class SavedGapCreate(BaseModel):
    mentor_id: int
    title: str
    description: str
    type: str
    why_gap: str
    reason_student: str
    reason_mentor: str
    feasibility_score: int
    confidence_score: int
    related_papers: Optional[str] = "[]"

@router.post("/saved-gaps")
def save_research_gap(
    gap: SavedGapCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can save research gaps")
        
    saved_gap = SavedResearchGap(
        student_id=current_user.id,
        mentor_id=gap.mentor_id,
        title=gap.title,
        description=gap.description,
        type=gap.type,
        why_gap=gap.why_gap,
        reason_student=gap.reason_student,
        reason_mentor=gap.reason_mentor,
        feasibility_score=gap.feasibility_score,
        confidence_score=gap.confidence_score,
        related_papers=gap.related_papers
    )
    db.add(saved_gap)
    db.commit()
    db.refresh(saved_gap)
    return saved_gap

@router.get("/saved-gaps")
def get_saved_gaps(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can view saved gaps")
        
    return db.query(SavedResearchGap).filter(SavedResearchGap.student_id == current_user.id).order_by(SavedResearchGap.created_at.desc()).all()

@router.delete("/saved-gaps/{gap_id}")
def delete_saved_gap(
    gap_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    gap = db.query(SavedResearchGap).filter(SavedResearchGap.id == gap_id).first()
    if not gap:
        raise HTTPException(status_code=404, detail="Saved gap not found")
        
    if gap.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this gap")
        
    db.delete(gap)
    db.commit()
    return {"message": "Gap deleted successfully"}
