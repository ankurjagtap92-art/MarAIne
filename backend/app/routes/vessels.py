from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
from uuid import UUID

from ..database import get_db
from ..models import Vessel
from ..schemas import VesselCreate, VesselResponse, VesselUpdate, User
from ..services.auth import get_current_user

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
    # Validate required fields
    if not vessel_data.name or not vessel_data.vessel_type:
        raise HTTPException(status_code=400, detail="Name and vessel_type are required")

    db_vessel = Vessel(**vessel_data.dict(), user_id=current_user.id)

    try:
        db.add(db_vessel)
        db.commit()
        db.refresh(db_vessel)
        return db_vessel
    except IntegrityError as e:
        db.rollback()
        if "vessels_imo_number_key" in str(e.orig):
            raise HTTPException(
                status_code=400,
                detail=f"Vessel with IMO number '{vessel_data.imo_number}' already exists. Please use a different IMO."
            )
        else:
            raise HTTPException(status_code=400, detail="Database integrity error. Please check your input.")
    except Exception as e:
        db.rollback()
        print(f"❌ Vessel creation error: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again.")

# ✅ PUT /{vessel_id} – update existing vessel
@router.put("/{vessel_id}", response_model=VesselResponse)
def update_vessel(
    vessel_id: UUID,
    vessel_data: VesselUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Find the vessel and ensure ownership
    vessel = db.query(Vessel).filter(
        Vessel.id == vessel_id,
        Vessel.user_id == current_user.id
    ).first()
    if not vessel:
        raise HTTPException(status_code=404, detail="Vessel not found")

    # Update only the fields that are provided (PATCH-like, but we use PUT)
    # Since VesselUpdate has optional fields, we update only the ones that are not None
    update_data = vessel_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(vessel, key, value)

    try:
        db.commit()
        db.refresh(vessel)
        return vessel
    except IntegrityError as e:
        db.rollback()
        if "vessels_imo_number_key" in str(e.orig):
            raise HTTPException(
                status_code=400,
                detail=f"Vessel with IMO number '{vessel_data.imo_number}' already exists. Please use a different IMO."
            )
        else:
            raise HTTPException(status_code=400, detail="Database integrity error. Please check your input.")
    except Exception as e:
        db.rollback()
        print(f"❌ Vessel update error: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again.")

# ✅ DELETE /{vessel_id} – delete a vessel
@router.delete("/{vessel_id}", response_model=dict)
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

    try:
        db.delete(vessel)
        db.commit()
        return {"message": "Vessel deleted successfully"}
    except Exception as e:
        db.rollback()
        print(f"❌ Vessel delete error: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred. Please try again.")