from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional, List
from enum import Enum
from datetime import datetime

class RoleEnum(str, Enum):
    student = "student"
    mentor = "mentor"
    admin = "admin"

# --- Shared ---
class SkillBase(BaseModel):
    name: str

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: int
    class Config:
        from_attributes = True

class OpportunitySkillBase(BaseModel):
    skill_id: int
    weight: int = 1 # 1-5 scale

class OpportunitySkillResponse(OpportunitySkillBase):
    skill_name: Optional[str] = None # For convenience
    class Config:
        from_attributes = True

# --- Student Profile Schemas ---
class StudentProfileBase(BaseModel):
    university: Optional[str] = None
    degree: Optional[str] = None
    major: Optional[str] = None
    graduation_year: Optional[int] = None
    bio: Optional[str] = None
    github_url: Optional[str] = None
    scholar_url: Optional[str] = None
    website_url: Optional[str] = None
    intro_video_url: Optional[str] = None
    phone_number: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    gender: Optional[str] = None
    languages: Optional[str] = None
    current_status: Optional[str] = None
    start_year: Optional[int] = None
    interests: Optional[str] = None
    resume_url: Optional[str] = None
    
    # Enhanced Fields
    headline: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    primary_skills: Optional[str] = None
    tools_libraries: Optional[str] = None

    # PhD Matcher Fields
    is_phd_seeker: Optional[bool] = False
    research_interests: Optional[str] = None
    gpa: Optional[str] = None
    gre_score: Optional[str] = None
    toefl_score: Optional[str] = None

# Nested Schemas
class WorkExperienceBase(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    skills_used: Optional[str] = None

class WorkExperienceCreate(WorkExperienceBase):
    pass

class WorkExperienceResponse(WorkExperienceBase):
    id: int
    student_profile_id: int
    class Config:
        from_attributes = True

class EducationBase(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    start_year: Optional[str] = None
    end_year: Optional[str] = None
    grade: Optional[str] = None

class EducationCreate(EducationBase):
    pass

class EducationResponse(EducationBase):
    id: int
    student_profile_id: int
    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    title: Optional[str] = None
    tech_stack: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    student_profile_id: int
    class Config:
        from_attributes = True

class PublicationBase(BaseModel):
    title: Optional[str] = None
    journal_conference: Optional[str] = None
    publication_date: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None

class PublicationCreate(PublicationBase):
    pass

class PublicationResponse(PublicationBase):
    id: int
    student_profile_id: Optional[int] = None
    mentor_profile_id: Optional[int] = None
    class Config:
        from_attributes = True

class StudentProfileCreate(StudentProfileBase):
    work_experiences: Optional[List[WorkExperienceCreate]] = []
    educations: Optional[List[EducationCreate]] = []
    projects: Optional[List[ProjectCreate]] = []
    publications: Optional[List[PublicationCreate]] = []

class StudentProfileUpdate(StudentProfileBase):
    work_experiences: Optional[List[WorkExperienceCreate]] = []
    educations: Optional[List[EducationCreate]] = []
    projects: Optional[List[ProjectCreate]] = []
    publications: Optional[List[PublicationCreate]] = []
    name: Optional[str] = None

class StudentProfileResponse(StudentProfileBase):
    id: int
    user_id: int
    work_experiences: List[WorkExperienceResponse] = []
    educations: List[EducationResponse] = []
    projects: List[ProjectResponse] = []
    publications: List[PublicationResponse] = []
    readiness_score: float = 0.0
    class Config:
        from_attributes = True

# --- Phase 3: Research Intelligence Schemas ---
class ResearchTopicBase(BaseModel):
    name: str

class ResearchTopicResponse(ResearchTopicBase):
    id: int
    class Config:
        from_attributes = True

class MentorTopicTrendBase(BaseModel):
    trend_status: str
    total_count: int
    last_active_year: Optional[int] = None

class MentorTopicTrendResponse(MentorTopicTrendBase):
    id: int
    topic_id: int
    topic: Optional[ResearchTopicResponse] = None
    class Config:
        from_attributes = True

# --- Phase 4: Research Gap Schemas ---
class ResearchGapResponse(BaseModel):
    title: str
    description: str
    type: str # 'method_domain_gap', 'under_explored_topic', etc.
    why_gap: str
    reason_student: str # Why it fits student
    reason_mentor: str # Why it fits mentor
    feasibility_score: int # 0-100
    confidence_score: int # 0-100
    related_papers: List[str] = [] # List of titles/citations

# --- Mentor Profile Schemas ---
class MentorProfileBase(BaseModel):
    lab_name: Optional[str] = None
    university: Optional[str] = None
    position: Optional[str] = None
    research_areas: Optional[str] = None
    bio: Optional[str] = None
    website_url: Optional[str] = None
    
    mentor_type: Optional[str] = "academic_supervisor"
    company: Optional[str] = None
    
    # PhD Supervisor Fields
    accepting_phd_students: Optional[str] = None # Yes, No, Maybe
    funding_available: Optional[str] = None # Yes, Depends, No
    preferred_backgrounds: Optional[str] = None
    min_expectations: Optional[str] = None
    max_student_requests: Optional[int] = 5
    
    lab_size: Optional[int] = None
    time_commitment: Optional[str] = None
    application_requirements: Optional[str] = None

    research_methodology: Optional[str] = None
    mentorship_style: Optional[str] = None
    alumni_placement: Optional[str] = None

class MentorProfileCreate(MentorProfileBase):
    publications: Optional[List[PublicationCreate]] = []

class MentorProfileUpdate(MentorProfileBase):
    publications: Optional[List[PublicationCreate]] = []

class MentorProfileResponse(MentorProfileBase):
    id: int
    user_id: int
    is_verified: bool
    publications: List[PublicationResponse] = []
    topic_trends: List[MentorTopicTrendResponse] = []
    class Config:
        from_attributes = True

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    name: Optional[str] = None
    role: RoleEnum # Enforce role selection at signup

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    name: Optional[str] = None
    role: str
    provider: str
    is_active: bool
    
    # Optional nested profiles
    student_profile: Optional[StudentProfileResponse] = None
    mentor_profile: Optional[MentorProfileResponse] = None
    skills: List[SkillResponse] = []

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Opportunity Schemas ---
class OpportunityBase(BaseModel):
    title: str
    description: str
    type: str # internship, research_assistant, phd_guidance, collaboration
    requirements: Optional[str] = None
    is_open: Optional[bool] = True
    deadline: Optional[datetime] = None
    total_slots: Optional[int] = 1
    curriculum: Optional[str] = None
    # Phase 7: Grants
    funding_amount: Optional[float] = None
    currency: Optional[str] = "USD"
    grant_agency: Optional[str] = None

class OpportunityCreate(OpportunityBase):
    skills: Optional[List[OpportunitySkillBase]] = []

class OpportunityUpdate(OpportunityBase):
    skills: Optional[List[OpportunitySkillBase]] = None

class OpportunityResponse(OpportunityBase):
    id: int
    mentor_id: int
    created_at: datetime
    required_skills: List[OpportunitySkillResponse] = []
    
    class Config:
        from_attributes = True

# --- Application Schemas ---
class ApplicationBase(BaseModel):
    cover_letter: Optional[str] = None

class ApplicationCreate(ApplicationBase):
    opportunity_id: int
    match_score: Optional[float] = None
    match_details: Optional[str] = None

class ApplicationUpdate(BaseModel):
    status: str # pending, reviewing, accepted, rejected

class ApplicationResponse(ApplicationBase):
    id: int
    student_id: int
    opportunity_id: Optional[int] = None
    status: str
    created_at: datetime
    match_score: float = 0.0
    match_details: Optional[str] = None
    funding_status: str
    
    student: Optional[UserResponse] = None
    opportunity: Optional[OpportunityResponse] = None

    class Config:
        from_attributes = True
