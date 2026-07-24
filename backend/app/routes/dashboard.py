from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import RouteAnalysis, Vessel, RouteOption
from ..services.auth import get_current_user
from ..schemas import User

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get key metrics for the dashboard"""
    total_routes = db.query(RouteAnalysis).filter(
        RouteAnalysis.user_id == current_user.id
    ).count()

    active_vessels = db.query(Vessel).filter(
        Vessel.user_id == current_user.id
    ).count()

    # ✅ Compute average risk score from route options (if any)
    risk_score = 0
    fuel_saved = 0.0

    # If there are routes, calculate average risk from options
    if total_routes > 0:
        # Get all route options for the user (join via RouteAnalysis)
        options = db.query(RouteOption).join(
            RouteAnalysis, RouteOption.analysis_id == RouteAnalysis.id
        ).filter(
            RouteAnalysis.user_id == current_user.id
        ).all()

        if options:
            # Average weather risk score (or overall_risk_score)
            risk_vals = [o.weather_risk_score for o in options if o.weather_risk_score is not None]
            if risk_vals:
                risk_score = int(sum(risk_vals) / len(risk_vals))

            # Fuel saved could be computed as difference between baseline and actual
            # For MVP, we'll set it to 0 and improve later
            fuel_saved = 0.0

    return {
        "totalRoutes": total_routes,
        "fuelSaved": fuel_saved,
        "riskScore": risk_score,
        "activeVessels": active_vessels
    }