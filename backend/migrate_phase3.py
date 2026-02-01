from app.db.database import engine
from app.db.models import Base
from sqlalchemy import text

def migrate():
    print("Creating new tables (ResearchTopic, MentorTopicTrend, etc.)...")
    Base.metadata.create_all(bind=engine)
    print("New tables created.")

    print("Checking for missing columns in 'publications'...")
    with engine.connect() as conn:
        # Check if citation_count exists
        try:
            conn.execute(text("ALTER TABLE publications ADD COLUMN citation_count INTEGER DEFAULT 0"))
            print("Added 'citation_count' column.")
        except Exception as e:
            print(f"Column 'citation_count' might already exist or error: {e}")

        # Check if doi exists
        try:
            conn.execute(text("ALTER TABLE publications ADD COLUMN doi VARCHAR"))
            print("Added 'doi' column.")
        except Exception as e:
            print(f"Column 'doi' might already exist or error: {e}")
        
        conn.commit()

if __name__ == "__main__":
    migrate()
