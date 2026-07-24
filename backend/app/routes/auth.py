"""
MarAIne - Authentication Routes
Login, registration, token refresh, and user profile endpoints.

Base URL: /api/v1/auth
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..config import settings  # ✅ ADDED
from ..database import get_db
from ..models import User
from ..schemas import (
    UserCreate, UserLogin, UserResponse, TokenResponse  # ✅ FIXED
)
from ..services.auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
)


router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"]
)


# ============================================
# POST /api/v1/auth/register
# ============================================

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
    description="Create a new account with email, password, and profile details."
)
def register(
    request: UserCreate,  # ✅ FIXED
    db: Session = Depends(get_db)
):
    """
    Register a new user.

    Validations:
    - Email must be unique
    - Password must meet strength requirements (enforced by Pydantic)
    - Role must be valid

    Returns the created user (without password hash).
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists."
        )

    # Create user
    user = User(
        email=request.email,
        password_hash=hash_password(request.password),
        full_name=request.full_name,
        role=request.role,
        company_name=request.company_name,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


# ============================================
# POST /api/v1/auth/login
# ============================================

@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and get access tokens",
    description="Authenticate with email and password. Returns JWT access and refresh tokens."
)
def login(
    request: UserLogin,  # ✅ FIXED
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return JWT tokens.

    Token expiry:
    - Access token: Configurable (default 24 hours)
    - Refresh token: 7 days
    """
    # Find user by email
    user = db.query(User).filter(User.email == request.email).first()

    # Verify credentials
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact support."
        )

    # Update last login
    from datetime import datetime, timezone
    user.last_login = datetime.now(timezone.utc)
    db.commit()

    # Generate tokens
    access_token = create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role
    )
    refresh_token = create_refresh_token(user_id=user.id)

    # Get expiry from settings
    expires_in = timedelta(minutes=settings.JWT_EXPIRATION_MINUTES).total_seconds()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=int(expires_in),
        user=UserResponse.model_validate(user)
    )


# ============================================
# POST /api/v1/auth/refresh
# ============================================

@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh access token",
    description="Exchange a refresh token for a new access token."
)
def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """
    Get a new access token using a refresh token.
    Does not require re-entering password.
    """
    # Decode and validate refresh token
    payload = decode_token(refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token."
        )

    # Verify it's actually a refresh token
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type. Expected refresh token."
        )

    # Get user from token
    from uuid import UUID
    user_id = UUID(payload["sub"])
    user = db.query(User).filter(
        User.id == user_id,
        User.is_active == True
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or deactivated."
        )

    # Generate new tokens
    new_access_token = create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role
    )
    new_refresh_token = create_refresh_token(user_id=user.id)

    expires_in = timedelta(minutes=settings.JWT_EXPIRATION_MINUTES).total_seconds()

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=int(expires_in),
        user=UserResponse.model_validate(user)
    )


# ============================================
# GET /api/v1/auth/me
# ============================================

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
    description="Returns the profile of the currently authenticated user."
)
def get_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Get authenticated user's profile.
    Requires valid JWT token in Authorization header.
    """
    return current_user