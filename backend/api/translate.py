"""
Translation API endpoint
Translates chapter content to Urdu
Supports Better-Auth cookie authentication
"""

from fastapi import APIRouter, Depends, HTTPException, Header, Request
from typing import Optional
from services.auth_service import validate_token, validate_session_cookies
from services.skill_runner import SkillRunner
from models.skill_request import TranslateRequest, TranslateResponse
import traceback

router = APIRouter(prefix="/api", tags=["translation"])

@router.post("/translate", response_model=TranslateResponse)
def translate_chapter(
    request_body: TranslateRequest,
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """
    Translate chapter content to Urdu
    Preserves LaTeX equations and code blocks
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

        print(f"[TRANSLATE] User ID: {payload.get('sub')}")
        print(f"[TRANSLATE] Content length: {len(request_body.content)}")

        # Invoke translator skill
        translated = SkillRunner.run_translator(request_body.content)
        print(f"[TRANSLATE] Success! Output length: {len(translated)}")
        
        return {
            "translated_content": translated,
            "chapter_slug": request_body.chapter_slug
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"[TRANSLATE ERROR] {type(e).__name__}: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
