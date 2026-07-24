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
    try:
        # Ensure all required fields are present
        if not vessel_data.name or not vessel_data.vessel_type:
            raise HTTPException(status_code=400, detail="Name and vessel_type are required")

        db_vessel = Vessel(**vessel_data.dict(), user_id=current_user.id)
        db.add(db_vessel)
        db.commit()
        db.refresh(db_vessel)
        return db_vessel
    except Exception as e:
        db.rollback()
        print(f"❌ Vessel creation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))