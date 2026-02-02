from app.db.database import SessionLocal
from app.db.models import User, Opportunity

def check():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == 'feifei.li@stanford.edu').first()
        if user:
            print(f"User Found: ID={user.id}, Name={user.name}")
            opps = db.query(Opportunity).filter(Opportunity.mentor_id == user.id).all()
            print(f"Opportunities Count: {len(opps)}")
            for opp in opps:
                print(f" - {opp.id}: {opp.title}")
        else:
            print("User feifei.li@stanford.edu NOT FOUND")
            
        # Also check if there are opportunities with "Fei-Fei" in the title or description that might belong to others
        print("\nChecking for potential mis-assigned opportunities:")
        mis_opps = db.query(Opportunity).filter(Opportunity.mentor_id != (user.id if user else -1)).all()
        for opp in mis_opps:
             if "Fei-Fei" in opp.title or "Stanford" in opp.title: # loose check
                 print(f" - [WARN] Opp {opp.id} '{opp.title}' assigned to Mentor {opp.mentor_id}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check()
