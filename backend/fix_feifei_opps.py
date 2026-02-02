from app.db.database import SessionLocal
from app.db.models import Opportunity

def fix_opps():
    db = SessionLocal()
    try:
        # Titles seen in the screenshot
        titles = [
            "Machine Learning Research Intern",
            "Deep Learning Engineer Intern",
            "Backend Engineering Intern",
            "Frontend Developer Intern"
        ]
        
        target_mentor_id = 21 # Fei-Fei Li
        
        print(f"Searching for opportunities to assign to Mentor {target_mentor_id}...")
        
        count = 0
        for title in titles:
            # Find opportunities with these titles
            opps = db.query(Opportunity).filter(Opportunity.title == title).all()
            for opp in opps:
                print(f"Found '{opp.title}' (ID: {opp.id}), current Mentor ID: {opp.mentor_id}")
                if opp.mentor_id != target_mentor_id:
                    print(f" -> UPDATING to Mentor {target_mentor_id}")
                    opp.mentor_id = target_mentor_id
                    count += 1
        
        if count > 0:
            db.commit()
            print(f"Successfully updated {count} opportunities.")
        else:
            print("No opportunities needed updating.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_opps()
