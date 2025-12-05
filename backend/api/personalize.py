"""
Personalization API endpoint
Personalizes chapter content based on user profile
Supports Better-Auth cookie authentication
"""

from fastapi import APIRouter, Depends, HTTPException, Header, Request, Cookie
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from services.auth_service import validate_token, validate_session_cookies
from services.skill_runner import SkillRunner
from models.user import User
from models.skill_request import PersonalizeRequest, PersonalizeResponse
import traceback

router = APIRouter(prefix="/api", tags=["personalization"])

@router.post("/personalize", response_model=PersonalizeResponse)
def personalize_chapter(
    request_body: PersonalizeRequest,
    request: Request,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Personalize chapter content based on user's technical background
    Supports both Better-Auth cookies and legacy JWT tokens
    """
    try:
        payload = None
        
        # Try cookie-based auth first (Better-Auth)
        cookies = dict(request.cookies)
        if cookies:
            payload = validate_session_cookies(cookies)
        
        # Fall back to header-based auth
        if not payload and authorization:
            token = authorization.replace("Bearer ", "")
            payload = validate_token(token)
        
        if not payload:
            raise HTTPException(status_code=401, detail="Not authenticated")

        # Get user info from payload
        user_id = payload.get("sub")
        print(f"[PERSONALIZE] User ID: {user_id}")

        # If we have profile from Better-Auth, use it directly
        if payload.get("python_knowledge") is not None:
            profile = {
                "python_knowledge": payload.get("python_knowledge", False),
                "has_nvidia_gpu": payload.get("has_nvidia_gpu", False),
                "experience_level": payload.get("experience_level", "beginner")
            }
        else:
            # Fetch from database for legacy JWT
            user = db.query(User).filter(User.id == int(user_id)).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            print(f"[PERSONALIZE] User found: {user.email}")
            profile = {
                "python_knowledge": user.python_knowledge or False,
                "has_nvidia_gpu": user.has_nvidia_gpu or False,
                "experience_level": user.experience_level.value if user.experience_level else "beginner"
            }

        print(f"[PERSONALIZE] Profile: {profile}")
        print(f"[PERSONALIZE] Content length: {len(request_body.content)}")

        # Invoke personalizer skill
        personalized = SkillRunner.run_personalizer(request_body.content, profile)
        print(f"[PERSONALIZE] Success! Output length: {len(personalized)}")
        
        return {
            "personalized_content": personalized,
            "chapter_slug": request_body.chapter_slug
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[PERSONALIZE ERROR] {type(e).__name__}: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
