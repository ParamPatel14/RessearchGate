from sqlalchemy import text
from app.db.database import engine

def execute_sql(sql, description):
    with engine.connect() as conn:
        try:
            conn.execute(text(sql))
            conn.commit()
            print(f"Success: {description}")
        except Exception as e:
            print(f"Skipped/Error ({description}): {e}")

if __name__ == "__main__":
    print("Removing behance_url from student_profiles...")
    execute_sql("ALTER TABLE student_profiles DROP COLUMN behance_url", "Drop behance_url column")
    print("Done.")
