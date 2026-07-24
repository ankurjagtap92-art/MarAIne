from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import RouteAnalysis, Vessel
from ..services.auth import get_current_user
from ..schemas import User

router = APIRouter(prefix="/api/v1/activities", tags=["activities"])

@router.get("/recent")
def get_recent_activities(
    limit: int = 5,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recent activity feed for the dashboard"""
    activities = []

    # Get recent route analyses
    routes = db.query(RouteAnalysis).filter(
        RouteAnalysis.user_id == current_user.id
    ).order_by(RouteAnalysis.created_at.desc()).limit(limit).all()

    for r in routes:
        activities.append({
            "id": r.id,
            "type": "route_analyzed",
            "description": f"Route analyzed: {r.origin_port} → {r.destination_port}",
            "created_at": r.created_at.isoformat()
        })

    # Get recent vessel additions
    vessels = db.query(Vessel).filter(
        Vessel.user_id == current_user.id
    ).order_by(Vessel.created_at.desc()).limit(limit).all()

    for v in vessels:
        activities.append({
            "id": v.id,
            "type": "vessel_added",
            "description": f"Added vessel: {v.name}",
            "created_at": v.created_at.isoformat()
        })

    # Sort by created_at descending and slice
    activities.sort(key=lambda x: x["created_at"], reverse=True)
    return activities[:limit]