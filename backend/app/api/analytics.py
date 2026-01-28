from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.db.models import User, Opportunity, Application, Certificate, PublicationProject
from app.deps import get_current_user

router = APIRouter()

@router.get("/dashboard")
def get_analytics_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Public or internal analytics?
    # Let's assume Admin/Mentor view for now.
    
    total_students = db.query(User).filter(User.role == "student").count()
    total_mentors = db.query(User).filter(User.role == "mentor").count()
    total_opportunities = db.query(Opportunity).count()
    total_applications = db.query(Application).count()
    active_projects = db.query(PublicationProject).filter(PublicationProject.status != "Published").count()
    published_projects = db.query(PublicationProject).filter(PublicationProject.status == "Published").count()
    certificates_issued = db.query(Certificate).count()
    
    # Funding Stats
    total_funding = db.query(func.sum(Opportunity.funding_amount)).scalar() or 0.0
    
    return {
        "users": {
            "students": total_students,
            "mentors": total_mentors
        },
        "engagement": {
            "opportunities": total_opportunities,
            "applications": total_applications,
            "certificates": certificates_issued
        },
        "research": {
            "active": active_projects,
            "published": published_projects
        },
        "funding": {
            "total_committed": total_funding,
            "currency": "USD"
        }
    }
