from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth
from fastapi.responses import RedirectResponse
from app.db.session import SessionLocal
from app.db.models import User
from app.core.security import hash_password, verify_password, create_access_token
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])
oauth = OAuth()

oauth.register(
    name="google",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

oauth.register(
    name="github",
    client_id=settings.GITHUB_CLIENT_ID,
    client_secret=settings.GITHUB_CLIENT_SECRET,
    access_token_url="https://github.com/login/oauth/access_token",
    authorize_url="https://github.com/login/oauth/authorize",
    api_base_url="https://api.github.com/",
    client_kwargs={"scope": "user:email"},
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/login")
def login(email: str, password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401)

    role = "admin" if email == settings.ADMIN_EMAIL else "user"
    token = create_access_token({"sub": email, "role": role})
    return {"access_token": token}

@router.get("/google")
async def google_login(request):
    return await oauth.google.authorize_redirect(
        request, "http://localhost:8000/auth/google/callback"
    )

@router.get("/google/callback")
async def google_callback(request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    email = token["userinfo"]["email"]

    role = "admin" if email == settings.ADMIN_EMAIL else "user"
    jwt_token = create_access_token({"sub": email, "role": role})

    return RedirectResponse(f"http://localhost:5173/oauth?token={jwt_token}")

