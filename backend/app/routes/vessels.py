from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Vessel
from ..schemas import VesselCreate, VesselResponse, User
from ..services.auth import get_current_user
from uuid import UUID

router = APIRouter(prefix="/api/v1/vessels", tags=["vessels"])

# ✅ GET / – list all vessels
@router.get("", response_model=List[VesselResponse])
def list_vessels(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vessels = db.query(Vessel).filter(
        Vessel.user_id == current_user.id
    ).order_by(Vessel.created_at.desc()).all()
    return vessels

# ✅ GET /{vessel_id} – get single vessel (for edit)
@router.get("/{vessel_id}", response_model=VesselResponse)
def get_vessel(
    vessel_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vessel = db.query(Vessel).filter(
        Vessel.id == vessel_id,
        Vessel.user_id == current_user.id
    ).first()
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found")
    return vessel

# ✅ POST / – create new vessel
@router.post("", response_model=VesselResponse)
def create_vessel(
    vessel_data: VesselCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_vessel = Vessel(**vessel_data.dict(), user_id=current_user.id)
    db.add(db_vessel)
    db.commit()
    db.refresh(db_vessel)
    return db_vessel

# ✅ PUT /{vessel_id} – update vessel
@router.put("/{vessel_id}", response_model=VesselResponse)
def update_vessel(
    vessel_id: UUID,
    vessel_data: VesselCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vessel = db.query(Vessel).filter(
        Vessel.id == vessel_id,
        Vessel.user_id == current_user.id
    ).first()
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found")
    for key, value in vessel_data.dict().items():
        setattr(vessel, key, value)
    db.commit()
    db.refresh(vessel)
    return vessel

# ✅ DELETE /{vessel_id} – delete vessel
@router.delete("/{vessel_id}")
def delete_vessel(
    vessel_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    vessel = db.query(Vessel).filter(
        Vessel.id == vessel_id,
        Vessel.user_id == current_user.id
    ).first()
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found")
    db.delete(vessel)
    db.commit()
    return {"message": "Vessel deleted successfully"}