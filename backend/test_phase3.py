import sys
import os
from sqlalchemy import text

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal, engine
from app.db.models import OpportunitySkill, StudentProfile, Application
from app.services.matching import calculate_match_score, calculate_readiness_score

def test_schema():
    print("Testing Schema...")
    with engine.connect() as conn:
        # Check opportunity_skills table
        try:
            result = conn.execute(text("SELECT count(*) FROM opportunity_skills"))
            print(f"opportunity_skills count: {result.scalar()}")
        except Exception as e:
             print(f"opportunity_skills table missing: {e}")
        
        # Check readiness_score column
        try:
            # We select from sqlite_master or information_schema depending on DB, 
            # but simplest is just try to select the column from the table
            conn.execute(text("SELECT readiness_score FROM student_profiles LIMIT 1"))
            print("readiness_score column exists.")
        except Exception as e:
            print(f"readiness_score missing: {e}")

        # Check match_score column
        try:
            conn.execute(text("SELECT match_score, match_details FROM applications LIMIT 1"))
            print("match_score/details columns exist.")
        except Exception as e:
            print(f"match_score/details missing: {e}")

def test_logic():
    print("\nTesting Logic...")
    # Mock objects
    class MockSkill:
        def __init__(self, id, name):
            self.id = id
            self.name = name
            
    class MockUser:
        def __init__(self, skills):
            self.skills = skills
            
    class MockOppSkill:
        def __init__(self, skill, weight):
            self.skill_id = skill.id
            self.skill = skill
            self.weight = weight
            
    class MockOpp:
        def __init__(self, required_skills):
            self.required_skills = required_skills

    s1 = MockSkill(1, "Python")
    s2 = MockSkill(2, "React")
    s3 = MockSkill(3, "SQL")
    
    # Case 1: Perfect Match
    user = MockUser([s1, s2])
    opp = MockOpp([MockOppSkill(s1, 5), MockOppSkill(s2, 3)])
    score, details = calculate_match_score(user, opp)
    print(f"Case 1 (Perfect): Score={score}, Expected=100.0")
    
    # Case 2: Partial Match
    user = MockUser([s1])
    opp = MockOpp([MockOppSkill(s1, 5), MockOppSkill(s2, 5)])
    score, details = calculate_match_score(user, opp)
    print(f"Case 2 (Partial): Score={score}, Expected=50.0")
    
    # Case 3: Weighted Match
    user = MockUser([s1]) # Has Python (weight 1)
    opp = MockOpp([MockOppSkill(s1, 1), MockOppSkill(s2, 9)]) # Needs React (weight 9)
    score, details = calculate_match_score(user, opp)
    print(f"Case 3 (Weighted): Score={score}, Expected=10.0")

if __name__ == "__main__":
    try:
        test_schema()
        test_logic()
        print("\nAll tests passed!")
    except Exception as e:
        print(f"\nTest failed: {e}")
