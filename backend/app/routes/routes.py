from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid
from uuid import UUID, uuid4
import json

from ..database import get_db
from ..models import RouteAnalysis, RouteOption, Waypoint, Vessel, Port
from ..schemas import (
    RouteAnalysisRequest,
    RouteAnalysisResponse,
    RouteOptionResponse,
    User
)
from ..services.auth import get_current_user
from ..services.route_engine import generate_route_options

router = APIRouter(prefix="/api/v1/routes", tags=["routes"])


@router.post("/analyze", response_model=RouteAnalysisResponse)
def analyze_route(
    request: RouteAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze a route using AI and store the results in the database.
    """
    try:
        # 1. Validate vessel exists and belongs to user
        if not isinstance(request.vessel_id, UUID):
            try:
                vessel_uuid = UUID(str(request.vessel_id))
            except:
                raise HTTPException(status_code=400, detail="Invalid vessel ID format")
        else:
            vessel_uuid = request.vessel_id

        vessel = db.query(Vessel).filter(
            Vessel.id == vessel_uuid,
            Vessel.user_id == current_user.id
        ).first()
        if not vessel:
            raise HTTPException(status_code=404, detail="Vessel not found")

        # ✅ 1.5: Find or create ports (or use dummy ports for now)
        # For MVP, we'll use dummy port IDs. In production, you'd have a ports table.
        # Let's create dummy ports if they don't exist.
        origin_port = db.query(Port).filter(Port.name == request.origin_port).first()
        if not origin_port:
            # Create a dummy port
            origin_port = Port(
                id=uuid4(),
                name=request.origin_port,
                country="Unknown",
                unlocode=request.origin_port[:5].upper(),
                latitude=0.0,
                longitude=0.0
            )
            db.add(origin_port)
            db.flush()

        dest_port = db.query(Port).filter(Port.name == request.destination_port).first()
        if not dest_port:
            dest_port = Port(
                id=uuid4(),
                name=request.destination_port,
                country="Unknown",
                unlocode=request.destination_port[:5].upper(),
                latitude=0.0,
                longitude=0.0
            )
            db.add(dest_port)
            db.flush()

        # 2. Generate route options (AI or mock)
        result = generate_route_options(
            vessel=vessel,
            origin=request.origin_port,
            destination=request.destination_port,
            priority=request.priority
        )
        options = result.get("options", [])
        ai_explanation = result.get(
            "explanation",
            "AI-generated route options based on your vessel profile, weather, and optimization priority."
        )

        # 3. Create analysis record with CORRECT field names
        analysis_id = uuid4()
        analysis = RouteAnalysis(
            id=analysis_id,
            user_id=current_user.id,
            vessel_id=vessel_uuid,
            origin_port_id=origin_port.id,       # ✅ FIXED: use origin_port_id
            destination_port_id=dest_port.id,    # ✅ FIXED: use destination_port_id
            priority=request.priority,
            departure_date=request.departure_date,
            max_acceptable_risk=request.max_acceptable_risk,
            max_deviation_percent=request.max_deviation_percent,
            status="completed",
            created_at=datetime.utcnow(),
            ai_explanation=ai_explanation,
            ai_model_used="gemini-2.0-flash"
        )
        db.add(analysis)
        db.flush()

        # 4. Store each RouteOption and its Waypoints
        for opt in options:
            time_value = opt.get("time", 0)
            if isinstance(time_value, str):
                try:
                    time_hours = float(time_value.split()[0])
                except (ValueError, IndexError):
                    time_hours = 24.0
            else:
                time_hours = float(time_value)

            route_option_id = uuid4()
            route_option = RouteOption(
                id=route_option_id,
                analysis_id=analysis_id,
                route_type=opt.get("route_type", "balanced"),
                total_distance_nm=float(opt.get("distance", 0)),
                estimated_duration_hours=time_hours,
                total_fuel_tons=float(opt.get("fuel", 0)),
                fuel_cost_usd=float(opt.get("cost", 0)),
                weather_risk_score=opt.get("risk", 20),
                route_geometry=opt.get("geometry"),
                weather_summary=opt.get("weather_summary")
            )
            db.add(route_option)
            db.flush()

            for wpt in opt.get("waypoints", []):
                waypoint = Waypoint(
                    id=uuid4(),
                    route_option_id=route_option_id,
                    sequence_number=wpt.get("sequence", 1),
                    latitude=float(wpt.get("lat", 0.0)),
                    longitude=float(wpt.get("lon", 0.0)),
                    reason=wpt.get("reason", "Waypoint")
                )
                db.add(waypoint)

        db.commit()
        db.refresh(analysis)

        return analysis

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Route analysis error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal error: {str(e)}"
        )

@router.get("", response_model=List[RouteAnalysisResponse])
def list_routes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all route analyses for the current user."""
    # Query RouteAnalysis and join with Port to get origin/destination names
    routes = db.query(RouteAnalysis).filter(
        RouteAnalysis.user_id == current_user.id
    ).order_by(RouteAnalysis.created_at.desc()).all()

    # Build response with port names
    result = []
    for route in routes:
        # Get port names from the relationships
        origin_port = db.query(Port).filter(Port.id == route.origin_port_id).first()
        dest_port = db.query(Port).filter(Port.id == route.destination_port_id).first()

        # Convert to response schema
        response = RouteAnalysisResponse(
            id=route.id,
            vessel_id=route.vessel_id,
            origin_port=origin_port.name if origin_port else "Unknown",
            destination_port=dest_port.name if dest_port else "Unknown",
            priority=route.priority,
            departure_date=route.departure_date,
            max_acceptable_risk=route.max_acceptable_risk,
            max_deviation_percent=route.max_deviation_percent,
            total_options_generated=route.total_options_generated,
            recommended_option_id=route.recommended_option_id,
            ai_explanation=route.ai_explanation,
            ai_model_used=route.ai_model_used,
            status=route.status,
            created_at=route.created_at,
            completed_at=route.completed_at,
            options=[]  # or load options if needed
        )
        result.append(response)

    return result


@router.get("/{route_id}", response_model=RouteAnalysisResponse)
def get_route(
    route_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific route analysis by ID with all its options."""
    route = db.query(RouteAnalysis).filter(
        RouteAnalysis.id == route_id,
        RouteAnalysis.user_id == current_user.id
    ).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    # Get port names
    origin_port = db.query(Port).filter(Port.id == route.origin_port_id).first()
    dest_port = db.query(Port).filter(Port.id == route.destination_port_id).first()

    # ✅ Fetch all route options for this analysis
    options = db.query(RouteOption).filter(
        RouteOption.analysis_id == route.id
    ).all()

    # Convert options to response schema
    option_responses = []
    for opt in options:
        # You can optionally fetch waypoints if needed, but skip for brevity
        option_responses.append(RouteOptionResponse(
            id=opt.id,
            analysis_id=opt.analysis_id,
            route_type=opt.route_type,
            total_distance_nm=opt.total_distance_nm,
            estimated_duration_hours=opt.estimated_duration_hours,
            avg_speed_knots=opt.avg_speed_knots,
            total_fuel_tons=opt.total_fuel_tons,
            fuel_cost_usd=opt.fuel_cost_usd,
            weather_risk_score=opt.weather_risk_score,
            piracy_risk_score=opt.piracy_risk_score,
            congestion_risk_score=opt.congestion_risk_score,
            overall_risk_score=opt.overall_risk_score,
            estimated_co2_tons=opt.estimated_co2_tons,
            route_geometry=opt.route_geometry,
            weather_summary=opt.weather_summary,
            is_recommended=opt.is_recommended,
            created_at=opt.created_at
        ))

    # Build full response
    response = RouteAnalysisResponse(
        id=route.id,
        vessel_id=route.vessel_id,
        origin_port=origin_port.name if origin_port else "Unknown",
        destination_port=dest_port.name if dest_port else "Unknown",
        priority=route.priority,
        departure_date=route.departure_date,
        max_acceptable_risk=route.max_acceptable_risk,
        max_deviation_percent=route.max_deviation_percent,
        total_options_generated=route.total_options_generated,
        recommended_option_id=route.recommended_option_id,
        ai_explanation=route.ai_explanation,
        ai_model_used=route.ai_model_used,
        status=route.status,
        created_at=route.created_at,
        completed_at=route.completed_at,
        options=option_responses
    )
    return response