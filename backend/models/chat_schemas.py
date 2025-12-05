"""
Pydantic schemas for chat endpoint
Request/response models for RAG chatbot
"""

from pydantic import BaseModel
from typing import List, Dict

class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    message: str  # Frontend sends 'message'
    selected_context: str = ""

class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    answer: str
    sources: List[str]
