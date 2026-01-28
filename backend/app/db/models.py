from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Text, Table, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

# Association table for User <-> Skills (Many-to-Many)
user_skills = Table(
    'user_skills', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('skill_id', Integer, ForeignKey('skills.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    password_hash = Column(String)
    provider = Column(String, default="local")
    role = Column(String) # student, mentor, admin
    is_active = Column(Boolean, default=True)

    # Relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False)
    mentor_profile = relationship("MentorProfile", back_populates="user", uselist=False)
    skills = relationship("Skill", secondary=user_skills, back_populates="users")
    opportunities = relationship("Opportunity", back_populates="mentor")
    applications = relationship("Application", back_populates="student")
    improvement_plans = relationship("ImprovementPlan", back_populates="student")

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    university = Column(String)
    degree = Column(String) # e.g., B.Tech, MS, PhD
    major = Column(String) # e.g., Computer Science
    graduation_year = Column(Integer)
    bio = Column(Text)
    github_url = Column(String)
    scholar_url = Column(String)
    website_url = Column(String)
    intro_video_url = Column(String)
    phone_number = Column(String)
    city = Column(String)
    country = Column(String)
    gender = Column(String)
    languages = Column(Text)
    
    # New Profile Fields
    current_status = Column(String) # college_student, working_professional, etc.
    start_year = Column(Integer)
    interests = Column(Text) # Comma separated list of interests
    resume_url = Column(String)
    
    # Enhanced Fields for Matching Engine
    headline = Column(String)
    linkedin_url = Column(String)
    twitter_url = Column(String)
    
    # Skills
    primary_skills = Column(Text) # JSON or Comma separated list of top 5 skills
    tools_libraries = Column(Text) # JSON or Comma separated list of tools
    
    readiness_score = Column(Float, default=0.0) # Global readiness score
    
    # Relationships
    user = relationship("User", back_populates="student_profile")
    work_experiences = relationship("WorkExperience", back_populates="student_profile", cascade="all, delete-orphan")
    educations = relationship("Education", back_populates="student_profile", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="student_profile", cascade="all, delete-orphan")

class WorkExperience(Base):
    __tablename__ = "work_experiences"
    
    id = Column(Integer, primary_key=True, index=True)
    student_profile_id = Column(Integer, ForeignKey("student_profiles.id"))
    
    title = Column(String)
    company = Column(String)
    start_date = Column(String) # YYYY-MM or YYYY
    end_date = Column(String) # YYYY-MM, YYYY or "Present"
    description = Column(Text)
    skills_used = Column(Text) # Comma separated
    
    student_profile = relationship("StudentProfile", back_populates="work_experiences")

class Education(Base):
    __tablename__ = "educations"
    
    id = Column(Integer, primary_key=True, index=True)
    student_profile_id = Column(Integer, ForeignKey("student_profiles.id"))
    
    institution = Column(String)
    degree = Column(String)
    start_year = Column(String)
    end_year = Column(String)
    grade = Column(String) # CGPA/Percentage
    
    student_profile = relationship("StudentProfile", back_populates="educations")

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    student_profile_id = Column(Integer, ForeignKey("student_profiles.id"))
    
    title = Column(String)
    tech_stack = Column(Text) # Comma separated
    url = Column(String)
    description = Column(Text)
    
    student_profile = relationship("StudentProfile", back_populates="projects")

class MentorProfile(Base):
    __tablename__ = "mentor_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    lab_name = Column(String)
    university = Column(String)
    position = Column(String) # e.g., Professor, Research Scientist
    research_areas = Column(String) # Comma separated for now, or use tags
    is_verified = Column(Boolean, default=False)
    bio = Column(Text)
    website_url = Column(String)
    
    # Reputation
    reputation_score = Column(Float, default=0.0)
    outcome_count = Column(Integer, default=0)

    # Relationships
    user = relationship("User", back_populates="mentor_profile")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    
    # Relationships
    users = relationship("User", secondary=user_skills, back_populates="skills")
    opportunity_links = relationship("OpportunitySkill", back_populates="skill")

class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, index=True)
    description = Column(Text)
    type = Column(String) # internship, research_assistant, phd_guidance, collaboration
    requirements = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_open = Column(Boolean, default=True)

    # Relationships
    mentor = relationship("User", back_populates="opportunities")
    applications = relationship("Application", back_populates="opportunity")
    required_skills = relationship("OpportunitySkill", back_populates="opportunity", cascade="all, delete-orphan")
    improvement_plans = relationship("ImprovementPlan", back_populates="opportunity")
    assignments = relationship("Assignment", back_populates="opportunity")

    # Phase 7: Grants
    funding_amount = Column(Float, nullable=True)
    currency = Column(String, default="USD")
    grant_agency = Column(String, nullable=True)

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, unique=True, index=True) # Public verification code
    student_id = Column(Integer, ForeignKey("users.id"))
    mentor_id = Column(Integer, ForeignKey("users.id"))
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"))
    issue_date = Column(DateTime, default=datetime.utcnow)
    pdf_url = Column(String)
    
    student = relationship("User", foreign_keys=[student_id])
    mentor = relationship("User", foreign_keys=[mentor_id])
    opportunity = relationship("Opportunity")

class OpportunitySkill(Base):
    __tablename__ = "opportunity_skills"
    
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), primary_key=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), primary_key=True)
    weight = Column(Integer, default=1) # 1: Nice to have, 3: Important, 5: Critical

    opportunity = relationship("Opportunity", back_populates="required_skills")
    skill = relationship("Skill", back_populates="opportunity_links")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"))
    status = Column(String, default="pending") # pending, reviewing, accepted, rejected
    cover_letter = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    match_score = Column(Float, default=0.0) # Snapshot of match score at time of application
    match_details = Column(Text) # JSON string explaining the score (strengths, gaps)
    
    # Phase 7: Funding
    funding_status = Column(String, default="pending") # pending, approved, released

    # Relationships
    student = relationship("User", back_populates="applications")
    opportunity = relationship("Opportunity", back_populates="applications")

class ImprovementPlan(Base):
    __tablename__ = "improvement_plans"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="in_progress") # in_progress, completed, abandoned
    
    # Relationships
    student = relationship("User", back_populates="improvement_plans")
    opportunity = relationship("Opportunity", back_populates="improvement_plans")
    items = relationship("PlanItem", back_populates="plan", cascade="all, delete-orphan")

class PlanItem(Base):
    __tablename__ = "plan_items"

    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("improvement_plans.id"))
    title = Column(String)
    description = Column(Text)
    type = Column(String) # skill_gap, mini_project, reading_list, sop
    status = Column(String, default="pending") # pending, in_progress, completed
    evidence_link = Column(String) # URL to proof (e.g. GitHub, Google Doc)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    plan = relationship("ImprovementPlan", back_populates="items")

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"))
    title = Column(String)
    description = Column(Text)
    type = Column(String) # code, pdf, analysis
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    opportunity = relationship("Opportunity", back_populates="assignments")
    submissions = relationship("Submission", back_populates="assignment")

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text) # Text content or description
    file_url = Column(String) # URL to uploaded file
    submitted_at = Column(DateTime, default=datetime.utcnow)
    
    # Grading
    grade = Column(Float, nullable=True) # Score
    feedback = Column(Text, nullable=True) # Mentor comments
    rubric_scores = Column(Text, nullable=True) # JSON string for rubric breakdown
    audio_feedback_url = Column(String, nullable=True)

    # Relationships
    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User")

class PublicationProject(Base):
    __tablename__ = "publication_projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    student_id = Column(Integer, ForeignKey("users.id"))
    mentor_id = Column(Integer, ForeignKey("users.id"))
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=True)
    status = Column(String, default="Ideation") # Ideation, Literature Review, Experimentation, Drafting, Submission, Published
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    student = relationship("User", foreign_keys=[student_id])
    mentor = relationship("User", foreign_keys=[mentor_id])
    opportunity = relationship("Opportunity")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    read = Column(Boolean, default=False)
    
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    organizer_id = Column(Integer, ForeignKey("users.id"))
    attendee_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    status = Column(String, default="scheduled") # scheduled, completed, cancelled
    link = Column(String) # Video call link
    
    organizer = relationship("User", foreign_keys=[organizer_id])
    attendee = relationship("User", foreign_keys=[attendee_id])

class Reference(Base):
    __tablename__ = "references"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text)
    is_silent = Column(Boolean, default=True) # Visible only to other mentors/admins? Or aggregated?
    # Actually, user requirement says "Silent reference system" & "Reference visibility rules (private by design)"
    # So maybe students can NEVER see them, but they boost the profile?
    created_at = Column(DateTime, default=datetime.utcnow)
    
    mentor = relationship("User", foreign_keys=[mentor_id])
    student = relationship("User", foreign_keys=[student_id])

class ProjectFile(Base):
    __tablename__ = "project_files"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("publication_projects.id"))
    uploader_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    url = Column(String)
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("PublicationProject")
    uploader = relationship("User")
