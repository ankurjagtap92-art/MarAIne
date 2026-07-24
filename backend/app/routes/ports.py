from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Port
from ..schemas import PortResponse
from ..services.auth import get_current_user
from ..schemas import User

router = APIRouter(prefix="/api/v1/ports", tags=["Ports"])

@router.get("/", response_model=List[PortResponse])
def list_ports(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get paginated list of ports."""
    ports = db.query(Port).order_by(Port.name).offset(offset).limit(limit).all()
    return ports

@router.get("/search", response_model=List[PortResponse])
def search_ports(
    q: str = Query(..., min_length=2, max_length=100),
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    search_term = f"%{q}%"
    ports = db.query(Port).filter(
        (Port.name.ilike(search_term)) |
        (Port.country.ilike(search_term)) |
        (Port.unlocode.ilike(search_term))
    ).limit(limit).all()
    return ports

@router.get("/{unlocode}", response_model=PortResponse)
def get_port(
    unlocode: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    port = db.query(Port).filter(Port.unlocode == unlocode.upper()).first()
    if not port:
        raise HTTPException(status_code=404, detail="Port not found")
    return port