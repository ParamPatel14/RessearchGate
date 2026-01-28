from sqlalchemy import text
from app.db.database import engine

def add_column(table, column, type_def):
    with engine.connect() as conn:
        try:
            conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {type_def}"))
            conn.commit()
            print(f"Added {column} to {table}")
        except Exception as e:
            print(f"Could not add {column} to {table}: {e}")

if __name__ == "__main__":
    # Grant details for Opportunities
    add_column("opportunities", "funding_amount", "FLOAT")
    add_column("opportunities", "currency", "VARCHAR DEFAULT 'USD'")
    add_column("opportunities", "grant_agency", "VARCHAR")
    
    # Conditional funding
    add_column("applications", "funding_status", "VARCHAR DEFAULT 'pending'") # pending, approved, released
    
    # Analytics logs (if we want a simple table) or just use existing data.
    # We will stick to existing data for analytics for now.
