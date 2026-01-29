from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.db import models
from app.db.models import Submission, PlanItem, PublicationProject
from datetime import datetime, timedelta, timezone

from sqlalchemy import text

def seed_internships():
    db = SessionLocal()
    try:
        # 0. Ensure schema is up to date (Migration hack)
        print("Checking schema...")
        try:
            db.execute(text("ALTER TABLE opportunities ADD COLUMN deadline TIMESTAMP"))
            db.execute(text("ALTER TABLE opportunities ADD COLUMN total_slots INTEGER DEFAULT 1"))
            db.commit()
            print("Added missing columns: deadline, total_slots")
        except Exception as e:
            db.rollback()
            print("Columns likely already exist or other error (ignoring):", e)

        # 1. Clear existing opportunities (Delete children first)
        print("Clearing existing opportunities...")
        db.query(models.OpportunitySkill).delete()
        db.query(models.Application).delete()
        db.query(models.Submission).delete() # Delete submissions before assignments
        db.query(models.Assignment).delete()
        db.query(models.PlanItem).delete() # Delete plan items before plans
        db.query(models.ImprovementPlan).delete()
        db.query(models.PublicationProject).delete() # Delete publication projects
        db.query(models.Certificate).delete() # Delete certificates
        db.query(models.Opportunity).delete()
        db.commit()

        # 2. Find an ADMIN user to assign these to (or create one)
        admin_user = db.query(models.User).filter(models.User.role == "admin").first()
        if not admin_user:
            print("No admin found. Creating a default admin...")
            admin_user = models.User(
                email="admin@example.com",
                name="Platform Admin",
                role="admin",
                password_hash="dummy_hash" # Won't be able to login with this, but valid for FK
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
        
        print(f"Assigning opportunities to admin: {admin_user.name} (ID: {admin_user.id})")

        # 3. Create Real-World Internships
        internships = [
            {
                "title": "Machine Learning Research Intern",
                "type": "internship",
                "description": "Join our AI Research Lab to work on cutting-edge computer vision models. You will be responsible for data preprocessing, model training using PyTorch, and evaluating model performance on large-scale datasets. This role is perfect for students looking to publish papers in top-tier conferences.",
                "requirements": "Strong proficiency in Python and PyTorch/TensorFlow. Experience with Computer Vision libraries (OpenCV). Understanding of CNNs, Transformers, and GANs. Ability to read and implement research papers.",
                "total_slots": 2,
                "deadline": datetime.now(timezone.utc) + timedelta(days=30),
                "is_open": True,
                "skills": ["Python", "PyTorch", "Machine Learning", "Computer Vision"]
            },
            {
                "title": "Deep Learning Engineer Intern",
                "type": "internship",
                "description": "Work on large language models (LLMs) and NLP tasks. You will assist in fine-tuning open-source models (Llama, Mistral) for specific domain applications. The role involves prompt engineering, RAG pipeline development, and optimizing inference latency.",
                "requirements": "Experience with NLP and Transformers (Hugging Face). Familiarity with vector databases (Pinecone, ChromaDB). Knowledge of LangChain or LlamaIndex. Strong Python skills.",
                "total_slots": 3,
                "deadline": datetime.now(timezone.utc) + timedelta(days=45),
                "is_open": True,
                "skills": ["Python", "NLP", "Deep Learning", "Transformers"]
            },
            {
                "title": "Backend Engineering Intern",
                "type": "internship",
                "description": "Help us build scalable APIs for our high-traffic platform. You will work with FastAPI and PostgreSQL to design database schemas, optimize queries, and implement secure authentication flows. You will also learn about microservices and Docker containerization.",
                "requirements": "Proficiency in Python (FastAPI/Django/Flask). Experience with SQL (PostgreSQL) and ORMs (SQLAlchemy). Understanding of RESTful APIs and authentication (JWT). Basic knowledge of Docker and Git.",
                "total_slots": 5,
                "deadline": datetime.now(timezone.utc) + timedelta(days=20),
                "is_open": True,
                "skills": ["Python", "FastAPI", "SQL", "Docker", "REST API"]
            },
            {
                "title": "Frontend Developer Intern",
                "type": "internship",
                "description": "Design and build beautiful, responsive user interfaces using React and Tailwind CSS. You will collaborate with designers to implement pixel-perfect screens and ensure a smooth user experience. Experience with state management (Redux/Context API) is a plus.",
                "requirements": "Strong skills in JavaScript (ES6+) and React. Experience with Tailwind CSS or other styling frameworks. Understanding of responsive design principles. Familiarity with Git and version control.",
                "total_slots": 4,
                "deadline": datetime.now(timezone.utc) + timedelta(days=25),
                "is_open": True,
                "skills": ["React", "JavaScript", "Tailwind CSS", "HTML/CSS"]
            }
        ]

        for data in internships:
            skill_names = data.pop("skills")
            opp = models.Opportunity(
                mentor_id=admin_user.id,
                **data
            )
            db.add(opp)
            db.commit()
            db.refresh(opp)
            
            # Add skills (simplified, assuming skills exist or creating them)
            for s_name in skill_names:
                skill = db.query(models.Skill).filter(models.Skill.name == s_name).first()
                if not skill:
                    skill = models.Skill(name=s_name)
                    db.add(skill)
                    db.commit()
                    db.refresh(skill)
                
                opp_skill = models.OpportunitySkill(opportunity_id=opp.id, skill_id=skill.id, weight=3)
                db.add(opp_skill)
            
            db.commit()
            print(f"Created: {opp.title}")

        print("Successfully seeded 4 real-world internships!")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_internships()
