"""
Database configuration and connection management
SQLAlchemy setup for Neon Postgres
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import DATABASE_URL

# Create SQLAlchemy engine with connection pool settings for cloud databases
# Use psycopg (version 3) driver by replacing postgresql:// with postgresql+psycopg://
if DATABASE_URL:
    db_url = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://") if "postgresql://" in DATABASE_URL else DATABASE_URL
    engine = create_engine(
        db_url,
        pool_pre_ping=True,  # Test connections before using them
        pool_recycle=300,    # Recycle connections after 5 minutes
        pool_size=5,         # Keep 5 connections in pool
        max_overflow=10,     # Allow 10 additional connections
    )
else:
    engine = None

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) if engine else None

# Create Base class for models
Base = declarative_base()

# Dependency for FastAPI routes
def get_db():
    """
    Database session dependency for FastAPI routes
    Yields a database session and closes it after use
    """
    if not SessionLocal:
        raise RuntimeError("Database not configured. Set DATABASE_URL in .env")

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
