import sys
import os
from sqlalchemy import text

# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import engine
from app.db.models import Base

def migrate():
    print("Starting Phase 3 migration...")
    
    # 1. Create new tables (opportunity_skills)
    print("Creating new tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("New tables created (if they didn't exist).")
    except Exception as e:
        print(f"Error creating tables: {e}")
    
    # 2. Add columns to existing tables
    print("Adding columns to existing tables...")
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # Add readiness_score to student_profiles
            # Check if column exists first to avoid error, or catch specific error
            # For SQLite/Postgres compatibility, simple try-except on execution is easiest for this ad-hoc script
            
            try:
                conn.execute(text("ALTER TABLE student_profiles ADD COLUMN readiness_score FLOAT DEFAULT 0.0"))
                print("Added readiness_score to student_profiles")
            except Exception as e:
                print(f"Skipping readiness_score: {e}")

            try:
                conn.execute(text("ALTER TABLE applications ADD COLUMN match_score FLOAT DEFAULT 0.0"))
                print("Added match_score to applications")
            except Exception as e:
                print(f"Skipping match_score: {e}")

            try:
                conn.execute(text("ALTER TABLE applications ADD COLUMN match_details TEXT"))
                print("Added match_details to applications")
            except Exception as e:
                print(f"Skipping match_details: {e}")
            
            trans.commit()
            print("Column additions committed.")
        except Exception as e:
            trans.rollback()
            print(f"Migration failed during column addition: {e}")

    print("Phase 3 migration completed.")

if __name__ == "__main__":
    migrate()
