from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

# Load env from backend/.env
load_dotenv("backend/.env")

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

add_column("plan_items", "deadline", "TIMESTAMP")
add_column("plan_items", "estimated_hours", "VARCHAR")
add_column("plan_items", "priority", "VARCHAR DEFAULT 'medium'")

print("Migration completed.")
