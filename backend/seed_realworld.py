from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db import models
from datetime import datetime
import sys

def seed_realworld():
    db = SessionLocal()
    print("Starting Real World & Beehive Seeding...")

    # Find an organizer (using Deep Shah as he is an Industry Mentor)
    organizer = db.query(models.User).filter(models.User.email == "deep.shah@google.com").first()
    if not organizer:
        print("Error: Organizer 'deep.shah@google.com' not found. Please run seed_mentors.py first.")
        # Fallback to first available mentor or admin
        organizer = db.query(models.User).filter(models.User.role.in_(['mentor', 'admin'])).first()
        if not organizer:
            print("Error: No mentor or admin found to assign as organizer.")
            return
        print(f"Falling back to organizer: {organizer.email}")
    
    print(f"Using Organizer: {organizer.name} ({organizer.email})")

    # --- Industrial Visits ---
    visits_data = [
        {
            "title": "Google AI Research Center Tour",
            "company_name": "Google",
            "location": "Mountain View, CA",
            "description": "Exclusive tour of Google's AI Research Center, including a session with the DeepMind team. Learn about the latest advancements in LLMs and reinforcement learning directly from the researchers.",
            "visit_date": datetime(2026, 5, 15, 10, 0, 0),
            "max_students": 20
        },
        {
            "title": "Tesla Gigafactory Manufacturing Insight",
            "company_name": "Tesla",
            "location": "Austin, TX",
            "description": "Witness the future of manufacturing at the Tesla Gigafactory. Focus on robotics, automation, and sustainable energy solutions. Includes a walk-through of the Model Y assembly line.",
            "visit_date": datetime(2026, 6, 20, 9, 0, 0),
            "max_students": 30
        }
    ]

    print("\nSeeding Industrial Visits...")
    for data in visits_data:
        # Check for existing to avoid duplicates
        existing = db.query(models.IndustrialVisit).filter(models.IndustrialVisit.title == data["title"]).first()
        if existing:
            print(f"  - Skipped (Already exists): {data['title']}")
            continue

        visit = models.IndustrialVisit(
            organizer_id=organizer.id,
            **data
        )
        db.add(visit)
        print(f"  - Added: {data['title']}")

    # --- Beehive Events (Honey Bee Related) ---
    beehive_data = [
        {
            "title": "Urban Beekeeping Workshop",
            "description": "Learn the basics of urban apiary management. Topics include hive construction, swarm control, and honey harvesting in city environments. Hands-on session with protective gear provided.",
            "event_date": datetime(2026, 4, 12, 9, 0, 0),
            "duration_hours": 6.0,
            "max_seats": 15,
            "entry_fee": 1200.0,
            "is_active": True
        },
        {
            "title": "Sustainable Apiculture Seminar",
            "description": "A deep dive into the role of pollinators in our ecosystem. Guest speakers from the National Bee Board will discuss conservation strategies and the impact of climate change on bee populations.",
            "event_date": datetime(2026, 4, 26, 10, 0, 0),
            "duration_hours": 4.0,
            "max_seats": 40,
            "entry_fee": 500.0,
            "is_active": True
        }
    ]

    print("\nSeeding Beehive Events...")
    for data in beehive_data:
        # Check for existing
        existing = db.query(models.BeehiveEvent).filter(models.BeehiveEvent.title == data["title"]).first()
        if existing:
            print(f"  - Skipped (Already exists): {data['title']}")
            continue
            
        event = models.BeehiveEvent(
            organizer_id=organizer.id,
            **data
        )
        db.add(event)
        print(f"  - Added: {data['title']}")

    db.commit()
    db.close()
    print("\nReal World & Beehive Seeding Complete!")

if __name__ == "__main__":
    seed_realworld()
