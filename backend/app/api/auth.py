from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth
from fastapi.responses import RedirectResponse
from app.db.database import get_db
from app.db.models import User
from app.core.security import hash_password, verify_password, create_access_token
from app.core.config import settings
from app.schemas import UserCreate, UserLogin, Token, UserResponse

router = APIRouter(prefix="/auth", tags=["Auth"])
oauth = OAuth()

oauth.register(
    name="google",
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    access_token_url="https://oauth2.googleapis.com/token",
    authorize_url="https://accounts.google.com/o/oauth2/auth",
    api_base_url="https://www.googleapis.com/oauth2/v1/",
    userinfo_endpoint="https://openidconnect.googleapis.com/v1/userinfo",
    jwks_uri="https://www.googleapis.com/oauth2/v3/certs",
    client_kwargs={
        "scope": "openid email profile",
        "timeout": 20.0,
    },
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

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = hash_password(user.password)
    new_user = User(
        email=user.email,
        password_hash=hashed_password,
        name=user.name,
        provider="local",
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_credentials.email).first()
    if not user or not user.password_hash or not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    role = user.role if user.role else "user"
    access_token = create_access_token(data={"sub": user.email, "role": role})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/google")
async def google_login(request: Request):
    return await oauth.google.authorize_redirect(
        request, "http://localhost:8000/auth/google/callback"
    )

@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as e:
        # This catches OAuth errors like mismatching state
        print(f"Google OAuth Token Error: {e}")
        raise HTTPException(status_code=400, detail=f"Google OAuth Error: {str(e)}")

    try:
        user_info = token.get("userinfo")
        if not user_info:
            user_info = await oauth.google.userinfo(token=token)
        
        # Log user_info for debugging (be careful with PII in production)
        print(f"Google User Info: {user_info}")

        email = user_info.get("email")
        if not email:
            raise ValueError("Email not found in Google user info")
        
        user = db.query(User).filter(User.email == email).first()
        
        # Check if user should be admin based on current settings
        should_be_admin = (email == settings.ADMIN_EMAIL)
        
        if not user:
            user = User(
                email=email,
                name=user_info.get("name"),
                provider="google",
                role="admin" if should_be_admin else "user"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Update role if it needs to change to admin
            if should_be_admin and user.role != "admin":
                user.role = "admin"
                db.commit()
                db.refresh(user)

        role = user.role
        jwt_token = create_access_token({"sub": email, "role": role})

        return RedirectResponse(f"http://localhost:5173/oauth?token={jwt_token}")
    
    except Exception as e:
        print(f"Google Callback Processing Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Server Error during Google Login: {str(e)}")

@router.get("/github")
async def github_login(request: Request):
    return await oauth.github.authorize_redirect(
        request, "http://localhost:8000/auth/github/callback"
    )

@router.get("/github/callback")
async def github_callback(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.github.authorize_access_token(request)
    except Exception as e:
        print(f"GitHub OAuth Token Error: {e}")
        raise HTTPException(status_code=400, detail=f"GitHub OAuth Error: {str(e)}")

    try:
        user_info = await oauth.github.get("user", token=token)
        user_info = user_info.json()
        
        # GitHub email might be private, so fetch it separately if needed
        email = user_info.get("email")
        if not email:
            # Fetch emails if not in public profile
            resp = await oauth.github.get("user/emails", token=token)
            emails = resp.json()
            for e in emails:
                if e["primary"] and e["verified"]:
                    email = e["email"]
                    break
        
        if not email:
             raise HTTPException(status_code=400, detail="Could not retrieve email from GitHub")

        user = db.query(User).filter(User.email == email).first()
        
        # Check if user should be admin based on current settings
        should_be_admin = (email == settings.ADMIN_EMAIL)

        if not user:
            user = User(
                email=email,
                name=user_info.get("name") or user_info.get("login"),
                provider="github",
                role="admin" if should_be_admin else "user"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Update role if it needs to change to admin
            if should_be_admin and user.role != "admin":
                user.role = "admin"
                db.commit()
                db.refresh(user)

        role = user.role
        jwt_token = create_access_token({"sub": email, "role": role})

        return RedirectResponse(f"http://localhost:5173/oauth?token={jwt_token}")

    except Exception as e:
        print(f"GitHub Callback Processing Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Server Error during GitHub Login: {str(e)}")
