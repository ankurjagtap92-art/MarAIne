from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from datetime import datetime
import uuid

from ..database import get_db
from ..models import RouteAnalysis, RouteOption
from ..services.auth import get_current_user
from ..schemas import User

router = APIRouter(prefix="/api/v1/voyage", tags=["Voyage"])

@router.get("/{route_id}/plan")
def get_voyage_plan(
    route_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the voyage plan for a selected route."""
    # Verify the route belongs to the user
    route = db.query(RouteAnalysis).filter(
        RouteAnalysis.id == route_id,
        RouteAnalysis.user_id == current_user.id
    ).first()
    
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    # Get the recommended option (or the one the user selected)
    selected_option = None
    if route.recommended_option_id:
        selected_option = db.query(RouteOption).filter(
            RouteOption.id == route.recommended_option_id
        ).first()
    
    # Build the voyage plan response
    return {
        "route_id": str(route.id),
        "origin_port": route.origin_port_id,  # Your friend will add port names
        "destination_port": route.destination_port_id,
        "selected_option": {
            "id": str(selected_option.id) if selected_option else None,
            "route_type": selected_option.route_type if selected_option else None,
            "total_distance_nm": selected_option.total_distance_nm if selected_option else None,
            "estimated_duration_hours": selected_option.estimated_duration_hours if selected_option else None,
            "total_fuel_tons": selected_option.total_fuel_tons if selected_option else None,
            "fuel_cost_usd": selected_option.fuel_cost_usd if selected_option else None,
        } if selected_option else None,
        "status": "planning",
        "created_at": route.created_at.isoformat(),
    }