"""
Authentication API endpoints
Handles user signup and login
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from services.auth_service import create_user, verify_password, create_access_token
from models.user import User
from models.auth_schemas import SignupRequest, LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """
    Create a new user account
    Captures hardware specs and coding level for personalization
    """
    # Check if user already exists
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Create user
    user = create_user(
        db,
        request.email,
        request.password,
        request.python_knowledge,
        request.has_nvidia_gpu,
        request.experience_level
    )

    # Generate token
    token = create_access_token({
        "sub": str(user.id),
        "email": user.email
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "python_knowledge": user.python_knowledge,
            "has_nvidia_gpu": user.has_nvidia_gpu,
            "experience_level": user.experience_level.value if user.experience_level else "beginner"
        }
    }

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT token with user info
    """
    user = db.query(User).filter(User.email == request.email).first()

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    # Generate token
    token = create_access_token({
        "sub": str(user.id),
        "email": user.email
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "python_knowledge": user.python_knowledge,
            "has_nvidia_gpu": user.has_nvidia_gpu,
            "experience_level": user.experience_level.value if user.experience_level else "beginner"
        }
    }
