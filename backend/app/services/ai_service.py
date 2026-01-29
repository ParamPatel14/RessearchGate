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
MODEL_NAME = "gemini-2.5-flash" 

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

async def generate_improvement_plan(resume_text: str, job_description: str, days_remaining: int) -> list:
    """
    Generates a detailed, step-by-step improvement plan based on the resume and job description.
    Returns a list of plan items with estimated hours and deadlines.
    """
    try:
        model = get_model()
        
        prompt = f"""
        You are a supportive mentor helping a student prepare for an internship. 
        Analyze the student's resume and the target opportunity.
        Create a manageable, motivating improvement plan to be completed in {days_remaining} days.

        Job Description:
        {job_description}
        
        Resume:
        {resume_text}
        
        CRITICAL INSTRUCTIONS:
        1. Keep it DOABLE: The total workload for the entire plan should be between 20-30 hours maximum.
        2. Audience: This is for an Intern/Junior role. Avoid complex senior-level architectural tasks.
        3. Focus: Identify only the top 3-5 most critical skill gaps. Do not overwhelm the student.
        4. Tone: Encouraging and practical.
        5. Tasks: specific, small, and "quick wins" (e.g., "Build a simple API endpoint" rather than "Architect a distributed system").
        
        Output a JSON ARRAY of objects with the following keys:
        - "title": Short, actionable title (e.g., "Create a simple React Form").
        - "description": specific instructions on what to do.
        - "type": One of ["skill_gap", "mini_project", "reading_list", "sop"].
        - "estimated_hours": String (keep individual tasks short, e.g. "2-4 hours").
        - "deadline_day_offset": Integer (days from now, distributed evenly over {days_remaining} days).
        - "priority": One of ["high", "medium", "low"].
        
        Output ONLY the JSON ARRAY.
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
        logger.error(f"Error in generate_improvement_plan: {str(e)}")
        return []

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
