from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, timedelta
from ..database import get_db
from ..models import RouteAnalysis, RouteOption, Vessel
from ..services.auth import get_current_user
from ..schemas import User

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])

@router.get("/fuel")
def get_fuel_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get fuel savings data over time."""
    # Get all route analyses for the user, ordered by created_at
    routes = db.query(RouteAnalysis).filter(
        RouteAnalysis.user_id == current_user.id
    ).order_by(RouteAnalysis.created_at).all()

    # For each route, compute fuel saved (compare fastest vs cheapest?)
    # For simplicity, we'll use the total fuel from each route's options
    result = []
    for route in routes:
        options = db.query(RouteOption).filter(
            RouteOption.analysis_id == route.id
        ).all()
        # Calculate average fuel or use the 'balanced' option
        # We'll use the cheapest option as baseline and compute savings
        if len(options) >= 2:
            # Assume cheapest is baseline, fastest is higher fuel
            cheapest = min(options, key=lambda o: o.fuel_cost_usd or 0)
            fastest = max(options, key=lambda o: o.fuel_cost_usd or 0)
            avg_fuel = sum(o.total_fuel_tons or 0 for o in options) / len(options)
            fuel_saved = (cheapest.total_fuel_tons or 0) - (avg_fuel or 0)
        else:
            fuel_saved = 0

        result.append({
            "date": route.created_at.isoformat(),
            "fuel_saved_tons": fuel_saved,
            "route_count": 1
        })

    return result

@router.get("/risk")
def get_risk_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get risk scores per route."""
    routes = db.query(RouteAnalysis).filter(
        RouteAnalysis.user_id == current_user.id
    ).order_by(RouteAnalysis.created_at.desc()).all()

    result = []
    for route in routes:
        options = db.query(RouteOption).filter(
            RouteOption.analysis_id == route.id
        ).all()
        if options:
            avg_risk = sum(o.weather_risk_score or 0 for o in options) / len(options)
        else:
            avg_risk = 0

        result.append({
            "route_id": str(route.id),
            "origin": route.origin_port,
            "destination": route.destination_port,
            "created_at": route.created_at.isoformat(),
            "avg_risk_score": avg_risk
        })

    return result

@router.get("/vessels")
def get_vessel_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get vessel performance metrics."""
    vessels = db.query(Vessel).filter(
        Vessel.user_id == current_user.id
    ).all()

    result = []
    for vessel in vessels:
        routes = db.query(RouteAnalysis).filter(
            RouteAnalysis.vessel_id == vessel.id
        ).all()
        total_fuel = 0
        total_distance = 0
        for route in routes:
            options = db.query(RouteOption).filter(
                RouteOption.analysis_id == route.id
            ).all()
            if options:
                total_fuel += sum(o.total_fuel_tons or 0 for o in options) / len(options)
                total_distance += sum(o.total_distance_nm or 0 for o in options) / len(options)

        result.append({
            "vessel_id": str(vessel.id),
            "vessel_name": vessel.name,
            "vessel_type": vessel.vessel_type,
            "total_routes": len(routes),
            "avg_fuel_consumption": total_fuel / (len(routes) if routes else 1),
            "avg_distance": total_distance / (len(routes) if routes else 1),
        })

    return result