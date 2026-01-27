import sys
import os

# Add the current directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import engine
from app.db.models import Base

def migrate():
    print("Creating tables for Phase 2...")
    # This will create any tables that are defined in Base.metadata but don't exist in the DB
    Base.metadata.create_all(bind=engine)
    print("Phase 2 tables created successfully.")

if __name__ == "__main__":
    migrate()
