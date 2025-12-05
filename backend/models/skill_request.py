"""
Pydantic schemas for skill endpoints
Request/response models for personalize and translate
"""

from pydantic import BaseModel

class PersonalizeRequest(BaseModel):
    """Request model for personalization endpoint"""
    chapter_slug: str
    content: str

class PersonalizeResponse(BaseModel):
    """Response model for personalization endpoint"""
    personalized_content: str
    chapter_slug: str

class TranslateRequest(BaseModel):
    """Request model for translation endpoint"""
    chapter_slug: str
    content: str

class TranslateResponse(BaseModel):
    """Response model for translation endpoint"""
    translated_content: str
    chapter_slug: str
