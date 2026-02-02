from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from app.api.auth import router as auth_router
import os
from app.routes.users import router as users_router
from app.api.profiles import router as profiles_router
from app.api.admin import router as admin_router
from app.api.opportunities import router as opportunities_router
from app.api.applications import router as applications_router
from app.api.skills import router as skills_router
from app.api.improvement import router as improvement_router
from app.api.assignments import router as assignments_router
from app.api.research import router as research_router
from app.api.communication import router as communication_router
from app.api.references import router as references_router
from app.api.certificates import router as certificates_router
from app.api.analytics import router as analytics_router
from app.api.resume import router as resume_router
from app.api.ai import router as ai_router
from app.api.matches import router as matches_router
from app.api.intelligence import router as intelligence_router
from app.core.config import settings
import logging


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Academic Research Matching Platform")

# Mount uploads directory for static files (resumes, etc.)
uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


# Add SessionMiddleware with explicit configuration for localhost
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    max_age=3600,
    https_only=False,  # Essential for localhost (http)
    same_site="lax"    # Allows cookies to be sent in redirects
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(profiles_router, prefix="/profiles", tags=["Profiles"])
app.include_router(admin_router, prefix="/admin", tags=["Admin"])
app.include_router(opportunities_router, prefix="/opportunities", tags=["Opportunities"])
app.include_router(applications_router, prefix="/applications", tags=["Applications"])
app.include_router(skills_router, prefix="/skills", tags=["Skills"])
app.include_router(improvement_router, prefix="/improvement", tags=["Improvement Plans"])
app.include_router(assignments_router, prefix="/assignments", tags=["Assignments"])
app.include_router(research_router, prefix="/research", tags=["Research"])
app.include_router(communication_router, prefix="/comm", tags=["Communication"])
app.include_router(references_router, prefix="/references", tags=["References"])
app.include_router(certificates_router, prefix="/certificates", tags=["Certificates"])
app.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
app.include_router(resume_router, prefix="/resume", tags=["Resume"])
app.include_router(ai_router, prefix="/ai", tags=["AI Features"])
app.include_router(matches_router, prefix="/matches", tags=["Matching Engine"])
app.include_router(intelligence_router, prefix="/intelligence", tags=["Research Intelligence"])

@app.get("/")
def root():
    return {"message": "Backend running"}
