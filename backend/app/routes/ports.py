from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Port
from ..schemas import PortResponse

router = APIRouter(prefix="/api/v1/ports", tags=["Ports"])

@router.get("/", response_model=List[PortResponse])
def list_ports(
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    ports = db.query(Port).order_by(Port.name).offset(offset).limit(limit).all()
    return ports