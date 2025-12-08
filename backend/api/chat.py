"""
Chat API endpoint
RAG-based chatbot using Qdrant vector search and Google Gemini
Supports Better-Auth cookie authentication
"""

import os
from fastapi import APIRouter, Depends, HTTPException, Header, Request
from typing import Optional
from services.embeddings_service import search_similar
from services.auth_service import validate_token, validate_session_cookies
from models.chat_schemas import ChatRequest, ChatResponse
from config import GEMINI_API_KEY
import google.generativeai as genai

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

router = APIRouter(tags=["chat"])

@router.post("/chat", response_model=ChatResponse)
def chat_with_textbook(
    request_body: ChatRequest,
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """
    Chat with the textbook using RAG
    Searches for relevant sections and generates contextual answers
    Supports both Better-Auth cookies and legacy JWT tokens
    """
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

    # Search Qdrant for relevant sections
    search_query = request_body.message + " " + request_body.selected_context
    results = search_similar(search_query, limit=3)

    # Build context from results
    context_parts = [r.payload.get("text", "") for r in results if hasattr(r, 'payload')]
    context = "\n\n".join(context_parts)

    # Generate answer with Gemini
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')

        prompt = f"""You are a robotics tutor. Answer questions based on the provided textbook context.
Cite sections using format 'See Chapter X.Y: Title'.

Context:
{context}

Question: {request_body.message}

Selected text: {request_body.selected_context}

Provide a helpful, educational answer based on the context above."""

        response = model.generate_content(prompt)
        answer = response.text

        # Extract sources as simple strings for frontend
        sources = [
            f"See: {r.payload.get('section_title', r.payload.get('chapter_slug', 'Chapter'))}"
            for r in results if hasattr(r, 'payload') and r.payload
        ]

        return {"answer": answer, "sources": sources}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")
