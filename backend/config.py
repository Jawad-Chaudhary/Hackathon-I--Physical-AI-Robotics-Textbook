"""
Configuration management for backend application
Loads environment variables from .env file
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "")

# Qdrant Vector Store
QDRANT_URL = os.getenv("QDRANT_URL", "")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY", "")

# OpenAI API
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# JWT Secret Key
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")

# Google Gemini API (for chat, personalize, translate - faster)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
