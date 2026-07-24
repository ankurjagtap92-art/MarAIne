"""
MarAIne - Database Connection & Session Management
Uses SQLAlchemy 2.0 style with async-ready architecture.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from .config import settings


# ============================================
# Engine: The connection to PostgreSQL
# ============================================
# echo=False: Don't log every SQL query (set True for debugging)
# pool_size=5: Max 5 connections (tuned for i3 + 8GB RAM)
# max_overflow=5: Allow 5 extra connections beyond pool_size
engine = create_engine(
    settings.database_url_for_env,
    echo=settings.DEBUG,         # SQL logging only in debug mode
    pool_size=5,                 # Conservative for your hardware
    max_overflow=5,              # Burst capacity without overwhelming RAM
    pool_pre_ping=True,          # Check connection is alive before using
    pool_recycle=3600,           # Recycle connections every hour
)


# ============================================
# Session Factory: Creates database sessions
# ============================================
# autocommit=False: We control transactions
# autoflush=False: We decide when to flush to DB
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# ============================================
# Base Class: All models inherit from this
# ============================================
class Base(DeclarativeBase):
    """
    SQLAlchemy 2.0 declarative base.
    Every model class inherits from this.
    Provides:
        - .metadata for Alembic auto-detection
        - Common table creation behavior
    """
    pass


# ============================================
# Dependency: Get DB session (FastAPI pattern)
# ============================================
def get_db():
    """
    FastAPI dependency that provides a database session.
    Usage in routes:
        @router.get("/something")
        def get_something(db: Session = Depends(get_db)):
            ...

    Yields a session and ensures it closes after request.
    This prevents connection leaks.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()