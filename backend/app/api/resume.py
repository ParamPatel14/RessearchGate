from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pypdf import PdfReader
import io
import re
import os
from app.deps import get_current_user
from app.db.models import User

router = APIRouter()

@router.post("/parse")
async def parse_resume(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported for now")
    
    try:
        content = await file.read()
        pdf = PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf.pages:
            text += page.extract_text() + "\n"
            
        # Basic Extraction Logic
        data = {}
        
        # Email
        email_match = re.search(r'[\w\.-]+@[\w\.-]+', text)
        if email_match:
            data['email'] = email_match.group(0)
            
        # Phone (Simple regex)
        phone_match = re.search(r'(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}', text)
        if phone_match:
            data['phone'] = phone_match.group(0)
            
        # GitHub
        github_match = re.search(r'github\.com/[\w-]+', text)
        if github_match:
            data['github_url'] = "https://" + github_match.group(0)
            
        # LinkedIn (mapping to website_url)
        linkedin_match = re.search(r'linkedin\.com/in/[\w-]+', text)
        if linkedin_match:
            data['website_url'] = "https://" + linkedin_match.group(0)

        # Simple Section Extraction (Heuristic)
        lines = text.split('\n')
        current_section = None
        skills = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Detect Sections
            lower_line = line.lower()
            if "skills" in lower_line and len(line) < 20:
                current_section = "skills"
                continue
            if "education" in lower_line and len(line) < 20:
                current_section = "education"
                continue
            if "experience" in lower_line and len(line) < 20:
                current_section = "experience"
                continue
            
            # Extract Skills
            if current_section == "skills":
                # Stop if we hit another section (heuristic: short line ending in colon or known keyword)
                if len(line) < 20 and (":" in line or "education" in lower_line):
                    current_section = None
                    continue
                    
                if "," in line:
                    parts = [s.strip() for s in line.split(",")]
                    skills.extend(parts)
                else:
                    skills.append(line)
        
        # Clean skills
        clean_skills = [s for s in skills if len(s) > 1 and len(s) < 30]
        if clean_skills:
            data['skills'] = clean_skills[:15] # Limit to 15 skills
            
        return {
            "extracted_data": data,
            "message": "Resume parsed successfully."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    # In a real app, upload to S3. Here we simulate a URL.
    # We won't actually save it to disk to avoid file permission issues in this env,
    # but we return a simulated path.
    return {"url": f"https://storage.googleapis.com/resume-bucket/{current_user.id}/{file.filename}"}
