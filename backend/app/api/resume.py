from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pypdf import PdfReader
import io
import re
from app.deps import get_current_user
from app.db.models import User

router = APIRouter()

def extract_links(text):
    links = {}
    # GitHub
    github = re.search(r'(github\.com/[\w-]+)', text, re.IGNORECASE)
    if github: links['github_url'] = "https://" + github.group(1)
    
    # LinkedIn
    linkedin = re.search(r'(linkedin\.com/in/[\w-]+)', text, re.IGNORECASE)
    if linkedin: links['linkedin_url'] = "https://" + linkedin.group(1)
    
    # Twitter/X
    twitter = re.search(r'(twitter\.com/[\w-]+|x\.com/[\w-]+)', text, re.IGNORECASE)
    if twitter: links['twitter_url'] = "https://" + twitter.group(1)
    
    # Portfolio/Website (generic)
    # This is harder to distinguish from other links, skipping for now unless explicit "Portfolio: www.xyz.com"
    
    return links

def segment_sections(text):
    lines = text.split('\n')
    sections = {}
    current_section = "header"
    buffer = []
    
    # Use STRICT headers to avoid "Technologies used" triggering a skills section.
    # Must be uppercase or short and distinct.
    keywords = {
        "experience": ["WORK EXPERIENCE", "EXPERIENCE", "EMPLOYMENT", "WORK HISTORY"],
        "education": ["EDUCATION", "ACADEMIC BACKGROUND", "QUALIFICATIONS"],
        "projects": ["PROJECTS", "PERSONAL PROJECTS", "ACADEMIC PROJECTS"],
        "skills": ["SKILLS", "TECHNICAL SKILLS", "COMPETENCIES"],
        "achievements": ["ACHIEVEMENTS", "AWARDS", "CERTIFICATIONS"]
    }
    
    for line in lines:
        clean_line = line.strip()
        # Check for exact match or simple header pattern
        # e.g. "EDUCATION" or "Education" standing alone or with underline
        is_header = False
        upper_line = clean_line.upper()
        
        # Heuristic: Headers are usually short (< 40 chars)
        if len(clean_line) < 40 and len(clean_line) > 2:
            for key, triggers in keywords.items():
                # Strict check: line must start with keyword or be equal to keyword
                # and usually doesn't contain ":" unless it's "Skills:"
                for trigger in triggers:
                    if upper_line == trigger or upper_line.startswith(trigger + " ") or upper_line == trigger + ":":
                        found_section = key
                        is_header = True
                        break
                if is_header:
                    break
        
        if is_header:
            if buffer:
                sections[current_section] = "\n".join(buffer)
            current_section = found_section
            buffer = []
        else:
            buffer.append(line)
            
    if buffer:
        sections[current_section] = "\n".join(buffer)
    return sections

def parse_experience(text):
    entries = []
    lines = text.split('\n')
    current_entry = None
    
    # Regex for years: 20xx
    # Regex for dates: Jan 2020, 01/2020, Present
    date_re = r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s?\d{4}|\d{2}/\d{4}|\d{4})'
    
    for i, raw in enumerate(lines):
        line = raw.strip()
        if not line:
            continue
            
        # Check for date in line
        has_date = re.search(date_re, line, re.IGNORECASE) or 'Present' in line or 'Current' in line
        
        # Looser check for header: Date + (Pipe OR Dash OR just distinct parts)
        # We assume if a line has a date and looks like a header (short-ish), it's a new entry
        if has_date and len(line) < 100:
            if current_entry:
                entries.append(current_entry)
            
            # Extract Company/Role
            # Strategy: Split by separators
            parts = re.split(r'[|\–\-]', line)
            parts = [p.strip() for p in parts if p.strip()]
            
            # Usually: "Company | Date" or "Role | Company | Date"
            # If we have 2 parts: Part 1 is Company/Role, Part 2 has Date
            company = parts[0] if parts else line
            
            # Extract start/end
            dates = re.findall(date_re, line, re.IGNORECASE)
            start = dates[0] if dates else ''
            end = dates[1] if len(dates) > 1 else ('Present' if 'Present' in line or 'Current' in line else '')
            
            current_entry = {
                "title": "", 
                "company": company, 
                "start_date": start, 
                "end_date": end, 
                "description": ""
            }
            
            # Look ahead for title if line 1 didn't look like a title
            # If line 1 was just "Company | Date", line 2 is Title
            if i + 1 < len(lines):
                nxt = lines[i + 1].strip()
                if nxt and not nxt.startswith('•') and not nxt.startswith('-') and len(nxt) < 50:
                    current_entry["title"] = nxt
        else:
            if current_entry:
                current_entry["description"] += (('\n' if current_entry["description"] else '') + line)
    
    if current_entry:
        entries.append(current_entry)
    elif not entries and text.strip():
        # Fallback: if no date lines found, treat whole block as one entry?
        # Or try to parse by block spacing. For now, strict date requirement is safer than garbage.
        pass
        
    return entries

def parse_education(text):
    entries = []
    lines = text.split('\n')
    current_entry = {}
    
    # Keywords: University, College, Institute, B.Tech, M.S., PhD
    edu_keywords = ["university", "college", "institute", "school", "bachelor", "master", "phd", "degree", "b.tech", "m.tech", "b.sc", "m.sc"]
    
    for line in lines:
        line = line.strip()
        if not line: continue
        
        lower_line = line.lower()
        if any(k in lower_line for k in edu_keywords) or re.search(r'20\d{2}', line):
            if current_entry and len(current_entry.get("institution", "")) > 0:
                entries.append(current_entry)
                current_entry = {}
            
            if not current_entry:
                current_entry = {"institution": line, "degree": "", "start_year": "", "end_year": "", "grade": ""}
            else:
                # Append to existing (maybe degree info)
                current_entry["degree"] += " " + line
                
            # Extract Year
            year_match = re.search(r'(20\d{2})', line)
            if year_match:
                if not current_entry.get("end_year"):
                    current_entry["end_year"] = year_match.group(1)
                elif not current_entry.get("start_year"):
                    current_entry["start_year"] = current_entry["end_year"]
                    current_entry["end_year"] = year_match.group(1)
        else:
            if current_entry:
                # Maybe grade?
                if "cgpa" in lower_line or "gpa" in lower_line or "%" in line:
                    current_entry["grade"] = line
    
    if current_entry:
        entries.append(current_entry)
    
    return entries

def parse_projects(text):
    entries = []
    lines = text.split('\n')
    current_entry = None
    url_re = r'(https?://[^\s]+)'
    for line in lines:
        s = line.strip()
        if not s:
            continue
        if re.match(r'^\d+\.\s', s) or (('|' in s) and ('Project' in s or 'System' in s or 'App' in s)):
            if current_entry:
                entries.append(current_entry)
            title = s
            title = re.split(r'\|', title)[0].strip()
            title = re.sub(r'^\d+\.\s*', '', title).strip()
            current_entry = {"title": title, "description": "", "tech_stack": "", "url": ""}
        elif s.lower().startswith('technologies used'):
            tech = s.split(':', 1)[1] if ':' in s else s
            tech = tech.replace('Technologies used', '').strip()
            if current_entry:
                current_entry["tech_stack"] = tech
        else:
            if current_entry:
                m = re.search(url_re, s)
                if m:
                    current_entry["url"] = m.group(1)
                current_entry["description"] += (('\n' if current_entry["description"] else '') + s)
    if current_entry:
        entries.append(current_entry)
    return entries

def parse_skills(text):
    # Split by commas or bullets
    skills_list = []
    # Replace common separators with comma
    text = text.replace("•", ",").replace("|", ",").replace("\n", ",")
    parts = text.split(",")
    for p in parts:
        s = p.strip()
        if s and len(s) < 30: # Reasonable length for a skill
            skills_list.append(s)
            
    # Heuristic split: Top 5 as primary
    return {
        "primary": ", ".join(skills_list[:5]),
        "tools": ", ".join(skills_list[5:])
    }

def parse_skills_global(text):
    # Fallback when there is no explicit "Skills" section
    # Aggregate all "Technologies used:" lines and any "Skills:" lines
    tech_lines = []
    for line in text.split('\n'):
        s = line.strip()
        low = s.lower()
        if low.startswith('technologies used') or low.startswith('skills:') or low.startswith('tech stack'):
            parts = s.split(':', 1)
            if len(parts) == 2:
                tech_lines.append(parts[1].strip())
    # Combine and split by commas
    combined = ", ".join(tech_lines)
    parts = [p.strip() for p in combined.split(',') if p.strip()]
    primary = ", ".join(parts[:5])
    tools = ", ".join(parts[5:])
    return {"primary": primary, "tools": tools}

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
            
        data = {}
        
        # 1. Identity & Contact
        email_match = re.search(r'[\w\.-]+@[\w\.-]+', text)
        if email_match: data['email'] = email_match.group(0)
        
        phone_match = re.search(r'(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}', text)
        if phone_match: data['phone_number'] = phone_match.group(0)
        
        # Headline (First non-empty line that isn't name/email/phone - simplified)
        lines = [l.strip() for l in text.split('\n') if l.strip()]
        if len(lines) > 1:
            # Assuming line 0 is name, line 1 might be headline
            data['headline'] = lines[1][:100] # Limit length
            
        # 2. Socials
        links = extract_links(text)
        data.update(links)
        
        # 3. Sections
        sections = segment_sections(text)
        
        if "experience" in sections:
            data["work_experiences"] = parse_experience(sections["experience"])
            
        if "education" in sections:
            data["educations"] = parse_education(sections["education"])
            
        if "projects" in sections:
            data["projects"] = parse_projects(sections["projects"])
            
        # Skills: prefer explicit section; else fallback to global scan
        skills_data = None
        if "skills" in sections:
            skills_data = parse_skills(sections["skills"])
        else:
            skills_data = parse_skills_global(text)
        if skills_data:
            data["primary_skills"] = skills_data.get("primary", "")
            data["tools_libraries"] = skills_data.get("tools", "")
            
        return {
            "extracted_data": data,
            "message": "Resume parsed successfully."
        }
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    # In a real app, upload to S3/Cloudinary.
    # Here we return a fake URL that implies it was stored.
    # We use a timestamp to make it look unique.
    import time
    timestamp = int(time.time())
    return {"url": f"https://storage.googleapis.com/resume-bucket/{current_user.id}/{timestamp}_{file.filename}"}
