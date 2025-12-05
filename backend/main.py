"""
FastAPI Main Application
Physical AI Textbook Backend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import auth, chat, personalize, translate
from database import Base, engine
from services.embeddings_service import setup_collection

# Create database tables
if engine:
    Base.metadata.create_all(bind=engine)
    print("Database tables created")

# Initialize Qdrant collection
setup_collection()

# Create FastAPI app
app = FastAPI(
    title="Physical AI Textbook API",
    version="1.0.0",
    description="Backend API for Smart Textbook Platform with AI Agents"
)

# CORS Configuration (allow Docusaurus frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Docusaurus dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(personalize.router)
app.include_router(translate.router)

@app.get("/")
def root():
    """
    Root endpoint
    Returns API information
    """
    return {
        "message": "Physical AI Textbook API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "auth": "/auth/signup, /auth/login",
            "chat": "/chat",
            "personalize": "/api/personalize",
            "translate": "/api/translate"
        }
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "textbook-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
