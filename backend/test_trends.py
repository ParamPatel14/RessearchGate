from app.db.database import SessionLocal
from app.db import models
from sqlalchemy.orm import joinedload

def test_trends():
    db = SessionLocal()
    try:
        # Fetch a mentor who should have trends (e.g., Andrew Ng)
        mentor = db.query(models.MentorProfile).join(models.User).filter(models.User.email == "andrew.ng@stanford.edu").options(
            joinedload(models.MentorProfile.topic_trends).joinedload(models.MentorTopicTrend.topic)
        ).first()

        if not mentor:
            print("Mentor Andrew Ng not found!")
            return

        print(f"Mentor: {mentor.user.name}")
        print(f"Topic Trends Count: {len(mentor.topic_trends)}")
        
        for trend in mentor.topic_trends:
            print(f" - Topic: {trend.topic.name}, Status: {trend.trend_status}, Count: {trend.total_count}")

    finally:
        db.close()

if __name__ == "__main__":
    test_trends()
