import sqlite3
import os

# Path to the database file - adjusting based on typical fastapi structure
# Usually in the root or app folder. Let's try to find it.
DB_PATH = "sql_app.db" 

if not os.path.exists(DB_PATH):
    # Try looking in backend/
    if os.path.exists("backend/sql_app.db"):
        DB_PATH = "backend/sql_app.db"
    elif os.path.exists("app/sql_app.db"):
        DB_PATH = "app/sql_app.db"
    else:
        print("Database not found, skipping migration (might be created on first run)")
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
            print(f"Error adding {column}: {e}")

add_column("plan_items", "deadline", "TIMESTAMP")
add_column("plan_items", "estimated_hours", "VARCHAR")
add_column("plan_items", "priority", "VARCHAR DEFAULT 'medium'")

conn.commit()
conn.close()
