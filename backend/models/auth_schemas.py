"""
Pydantic schemas for authentication endpoints
Request/response models for signup and login
"""

from pydantic import BaseModel, EmailStr

class SignupRequest(BaseModel):
    """Request model for user signup"""
    email: EmailStr
    password: str
    python_knowledge: bool
    has_nvidia_gpu: bool
    experience_level: str = "beginner"

class LoginRequest(BaseModel):
    """Request model for user login"""
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    """Response model for successful authentication"""
    access_token: str
    token_type: str = "bearer"
