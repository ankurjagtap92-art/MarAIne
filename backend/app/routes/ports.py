"""
MarAIne - Port Routes
Port search, listing, and detail endpoints.

Base URL: /api/v1/ports
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..database import get_db
from ..models import Port
from ..schemas import PortResponse  # ✅ FIXED
from ..services.auth import get_current_user


router = APIRouter(
    prefix="/api/v1/ports",
    tags=["Ports"]
)


@router.get(
    "/",
    response_model=list[PortResponse],
    summary="List all ports",
    description="Returns a list of all ports in the database."
)
def list_ports(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get paginated list of ports.
    Requires authentication.
    """
    ports = db.query(Port).order_by(Port.name).offset(offset).limit(limit).all()
    return ports


@router.get(
    "/search",
    response_model=list[PortResponse],
    summary="Search ports",
    description="Search ports by name, country, or UN/LOCODE."
)
def search_ports(
    q: str = Query(..., min_length=2, max_length=100, description="Search query"),
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Search ports by name, country, or UN/LOCODE.
    Requires authentication.
    """
    search_term = f"%{q}%"
    ports = (
        db.query(Port)
        .filter(
            or_(
                Port.name.ilike(search_term),
                Port.country.ilike(search_term),
                Port.unlocode.ilike(search_term)
            )
        )
        .limit(limit)
        .all()
    )
    return ports


@router.get(
    "/{unlocode}",
    response_model=PortResponse,
    summary="Get port by UN/LOCODE",
    description="Get detailed information about a specific port using its UN/LOCODE."
)
def get_port(
    unlocode: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get a specific port by its UN/LOCODE (e.g., INBOM for Mumbai).
    Requires authentication.
    """
    port = db.query(Port).filter(Port.unlocode == unlocode.upper()).first()
    if not port:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Port with UN/LOCODE '{unlocode.upper()}' not found."
        )
    return port