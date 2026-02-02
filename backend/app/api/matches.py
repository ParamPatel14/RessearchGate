from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, Any
from app.db.database import get_db
from app.db import models
from app.deps import get_current_user
from app.services.matching_engine import MatchingEngine
from pydantic import BaseModel

from app.core.cache import SimpleCache

router = APIRouter()
cache = SimpleCache()

class TrendInfo(BaseModel):
    topic: str
    status: str
    count: int

class MatchResult(BaseModel):
    mentor_id: int
    mentor_name: str
    mentor_type: Optional[str]
    institution: Optional[str]
    position: Optional[str]
    match_score: int
    semantic_score: int
    alignment_score: int
    explanation: str
    research_areas: Optional[str]
    accepting_students: Optional[str]
    trends: List[TrendInfo] = []

@router.get("/mentors", response_model=List[MatchResult])
async def get_mentor_matches(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get intelligent matches for the current student against all mentors.
    Uses the 3-Lens Matching Engine: Domain Filter -> Semantic Match -> Profile Alignment.
    """
    if current_user.role != "student":
        raise HTTPException(status_code=403, detail="Only students can view mentor matches")
        
    student_profile = current_user.student_profile
    if not student_profile:
        raise HTTPException(status_code=400, detail="Student profile not found")
        
    # Check cache first
    cache_key = f"smart_matches_{current_user.email}"
    cached_matches = cache.get(cache_key)
    if cached_matches:
        return cached_matches[:limit]

    # Fetch all mentors
    mentors = db.query(models.MentorProfile).join(models.User).filter(models.User.is_active == True).all()
    
    # Run Matching Engine
    matches = await MatchingEngine.match_student_with_mentors(student_profile, mentors)
    
    # Cache the result for 24 hours (86400 seconds)
    # We cache the Pydantic models (or dicts)
    cache.set(cache_key, matches, ttl_seconds=86400)
    
    return matches[:limit]
