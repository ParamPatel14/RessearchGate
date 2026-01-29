import google.generativeai as genai
from app.core.config import settings
import json
import logging
from datetime import datetime, timedelta

# Configure logging
logger = logging.getLogger(__name__)

# Configure Gemini
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

# Use Gemini 1.5 Flash (or Pro) - 2.5 is likely a typo/future placeholder
MODEL_NAME = "gemini-1.5-flash" 

def get_model():
    if not settings.GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY is not set in the environment variables.")
    return genai.GenerativeModel(MODEL_NAME)

async def analyze_match(resume_text: str, job_description: str) -> dict:
    """
    Analyzes the match between a resume and a job description.
    Returns a dictionary with score, missing_skills, and explanation.
    """
    try:
        model = get_model()
        
        prompt = f"""
        You are an expert ATS and Recruiter. Compare the following Resume against the Job Description.
        
        Job Description:
        {job_description}
        
        Resume:
        {resume_text}
        
        Provide a detailed analysis in JSON format with the following keys:
        - "score": A number between 0 and 100 representing the match percentage.
        - "missing_skills": A list of key skills or qualifications mentioned in the JD but missing in the Resume.
        - "explanation": A concise explanation (max 3 sentences) of why the score is what it is, highlighting the main gaps or strengths.
        
        Output ONLY the JSON.
        """
        
        response = model.generate_content(prompt)
        
        # Clean up response text to ensure it's valid JSON
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text)
        
    except Exception as e:
        logger.error(f"Error in analyze_match: {str(e)}")
        # Return a fallback error response
        if "GEMINI_API_KEY is not set" in str(e):
             return {
                "score": 0,
                "missing_skills": ["API Key Missing"],
                "explanation": "Please add GEMINI_API_KEY to your .env file to enable AI features."
            }
        
        return {
            "score": 0,
            "missing_skills": ["Error analyzing match"],
            "explanation": "Could not analyze match due to an internal error."
        }

async def generate_cover_letter(resume_text: str, job_description: str) -> str:
    """
    Generates a custom cover letter based on the resume and job description.
    """
    try:
        model = get_model()
        
        prompt = f"""
        You are a professional career coach. Write a compelling, personalized cover letter for the candidate based on their Resume and the Job Description below.
        
        Job Description:
        {job_description}
        
        Resume:
        {resume_text}
        
        The cover letter should:
        1. Be professional and engaging.
        2. Highlight relevant experiences from the resume that match the JD.
        3. Address the specific company and role.
        4. Not use placeholders like "[Your Name]" if the name is available in the resume. If not, use generic placeholders.
        
        Output ONLY the cover letter text.
        """
        
        response = model.generate_content(prompt)
        return response.text.strip()
        
    except Exception as e:
        logger.error(f"Error in generate_cover_letter: {str(e)}")
        if "GEMINI_API_KEY is not set" in str(e):
             return "Please add GEMINI_API_KEY to your .env file to enable AI features."
        return "Error generating cover letter. Please try again later."

async def generate_improvement_plan(resume_text: str, job_description: str, days_remaining: int) -> list:
    """
    Generates a personalized improvement plan to bridge skill gaps.
    """
    try:
        model = get_model()
        
        prompt = f"""
        You are a senior mentor and technical lead. Analyze the student's resume and the target opportunity.
        Create a detailed, step-by-step improvement plan to help the student get hired.
        The plan must be completed in {days_remaining} days.
        
        Job Description:
        {job_description}
        
        Resume:
        {resume_text}
        
        Task:
        1. Identify critical skill gaps.
        2. Create a learning roadmap with specific, actionable tasks.
        3. Assign estimated hours and a deadline offset (in days from now) for each task.
        4. Focus on REAL WORLD application (e.g., "Build a React component" instead of "Learn React").
        
        Output a JSON ARRAY of objects with these keys:
        - "title": Actionable title (e.g., "Master Redux Toolkit").
        - "description": Why this is needed and what to do (Real world context).
        - "type": One of ["skill_gap", "mini_project", "reading_list", "sop"].
        - "estimated_hours": String (e.g., "4-6 hours").
        - "deadline_day_offset": Integer (1 to {days_remaining}).
        - "priority": "high", "medium", or "low".
        
        Sort by logical order of learning.
        Output ONLY the JSON array.
        """
        
        response = model.generate_content(prompt)
        
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text)
        
    except Exception as e:
        logger.error(f"Error in generate_improvement_plan: {str(e)}")
        return []
