from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Text, Table
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

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
    
    # Relationships
    user = relationship("User", back_populates="student_profile")

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
    
    # Relationships
    user = relationship("User", back_populates="mentor_profile")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    
    # Relationships
    users = relationship("User", secondary=user_skills, back_populates="skills")
