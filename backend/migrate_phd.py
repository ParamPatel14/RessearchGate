import sqlite3
import os

# Path to the database file
DB_PATH = "sql_app.db" 

if not os.path.exists(DB_PATH):
    print("Database not found, skipping migration")
    exit(0)

print(f"Migrating database at {DB_PATH}")
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

def add_column(table, column, type_def):
    try:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {type_def}")
        print(f"Added column {column} to {table}")
    except sqlite3.OperationalError as e:
        if "duplicate column" in str(e):
            print(f"Column {column} already exists in {table}")
        else:
            print(f"Error adding {column} to {table}: {e}")

# Add PhD Matcher columns to student_profiles
add_column("student_profiles", "is_phd_seeker", "BOOLEAN DEFAULT 0")
add_column("student_profiles", "research_interests", "TEXT")
add_column("student_profiles", "gpa", "VARCHAR")
add_column("student_profiles", "gre_score", "VARCHAR")
add_column("student_profiles", "toefl_score", "VARCHAR")

conn.commit()
conn.close()
