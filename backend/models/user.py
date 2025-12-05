"""
User model for database
Stores user profile information including hardware/software background
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from database import Base
import enum

class ExperienceLevel(enum.Enum):
    """User experience level enumeration"""
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"

class User(Base):
    """
    User model with profile information
    Captures hardware specs and coding level for personalization
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    python_knowledge = Column(Boolean, default=False)
    has_nvidia_gpu = Column(Boolean, default=False)
    experience_level = Column(Enum(ExperienceLevel), default=ExperienceLevel.beginner)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
