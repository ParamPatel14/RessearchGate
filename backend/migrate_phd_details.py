from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found")
    exit(1)

print(f"Connecting to database...")
engine = create_engine(DATABASE_URL)

def add_column(table, column, type_def):
    with engine.connect() as conn:
        try:
            conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {type_def}"))
            print(f"Added column {column} to {table}")
        except Exception as e:
            print(f"Error adding {column} (might exist): {e}")
        conn.commit()

# Add Detailed PhD Info columns to mentor_profiles
add_column("mentor_profiles", "lab_size", "INTEGER")
add_column("mentor_profiles", "time_commitment", "VARCHAR")
add_column("mentor_profiles", "application_requirements", "TEXT")

# Add Advanced PhD Metrics
add_column("mentor_profiles", "research_methodology", "VARCHAR")
add_column("mentor_profiles", "mentorship_style", "VARCHAR")
add_column("mentor_profiles", "alumni_placement", "TEXT")

print("Migration completed.")