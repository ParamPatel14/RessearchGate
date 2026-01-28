from app.db.database import engine, Base
from app.db.models import Certificate

print("Creating Phase 7 tables...")
Base.metadata.create_all(bind=engine)
print("Phase 7 Tables created.")
