from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class TextRequest(BaseModel):
    text: str
    target_language: str = "en" # academic_en

@router.post("/refine")
def refine_academic_text(req: TextRequest):
    # Mock Implementation of an Academic Language Helper
    # In production, this would call OpenAI/Grammarly API
    
    refined = req.text
    suggestions = []
    
    if len(req.text) < 10:
        suggestions.append("Consider expanding your statement for clarity.")
    
    if "good" in req.text.lower():
        refined = refined.replace("good", "exemplary")
        suggestions.append("Replaced 'good' with 'exemplary' for academic tone.")
        
    return {
        "original": req.text,
        "refined": refined,
        "suggestions": suggestions
    }

@router.post("/translate")
def translate_text(req: TextRequest):
    # Mock Translation
    return {
        "original": req.text,
        "translated": f"[Translated to {req.target_language}]: {req.text}"
    }
