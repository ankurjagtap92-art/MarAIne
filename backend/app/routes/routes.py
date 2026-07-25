from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid
from uuid import UUID, uuid4
import json
from ..services.port_service import get_or_create_port
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

router = APIRouter(prefix="/api/v1/routes", tags=["Routes"])


@router.post("/analyze", response_model=RouteAnalysisResponse)
def analyze_route(
    request: RouteAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # 1. Validate vessel
        vessel = db.query(Vessel).filter(
            Vessel.id == request.vessel_id,
            Vessel.user_id == current_user.id
        ).first()
        if not vessel:
            raise HTTPException(status_code=404, detail="Vessel not found")

        # 2. Find or create ports (using the helper)
        origin_port = get_or_create_port(db, request.origin_port, request.origin_port[:5].upper())
        dest_port = get_or_create_port(db, request.destination_port, request.destination_port[:5].upper())

        # 3. Generate options (AI or mock)
        result = generate_route_options(
            vessel=vessel,
            origin=request.origin_port,
            destination=request.destination_port,
            priority=request.priority
        )
        options = result.get("options", [])
        ai_explanation = result.get("explanation", "AI-generated route options.")

        # 4. Create the RouteAnalysis record
        analysis = RouteAnalysis(
            id=uuid4(),
            user_id=current_user.id,
            vessel_id=request.vessel_id,
            origin_port_id=origin_port.id,
            destination_port_id=dest_port.id,
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

        # 5. Store route options and waypoints
        option_responses = []
        for opt in options:
            # Convert time to float
            time_value = opt.get("time", 0)
            if isinstance(time_value, str):
                try:
                    time_hours = float(time_value.split()[0])
                except:
                    time_hours = 24.0
            else:
                time_hours = float(time_value)

            route_option = RouteOption(
                id=uuid4(),
                analysis_id=analysis.id,
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

            # Waypoints
            for wpt in opt.get("waypoints", []):
                waypoint = Waypoint(
                    id=uuid4(),
                    route_option_id=route_option.id,
                    sequence_number=wpt.get("sequence", 1),
                    latitude=float(wpt.get("lat", 0.0)),
                    longitude=float(wpt.get("lon", 0.0)),
                    reason=wpt.get("reason", "Waypoint")
                )
                db.add(waypoint)

            # Build response object for this option
            option_responses.append(RouteOptionResponse(
                id=route_option.id,
                analysis_id=route_option.analysis_id,
                route_type=route_option.route_type,
                total_distance_nm=route_option.total_distance_nm,
                estimated_duration_hours=route_option.estimated_duration_hours,
                avg_speed_knots=route_option.avg_speed_knots,
                total_fuel_tons=route_option.total_fuel_tons,
                fuel_cost_usd=route_option.fuel_cost_usd,
                weather_risk_score=route_option.weather_risk_score,
                piracy_risk_score=route_option.piracy_risk_score,
                congestion_risk_score=route_option.congestion_risk_score,
                overall_risk_score=route_option.overall_risk_score,
                estimated_co2_tons=route_option.estimated_co2_tons,
                route_geometry=route_option.route_geometry,
                weather_summary=route_option.weather_summary,
                is_recommended=route_option.is_recommended,
                created_at=route_option.created_at
            ))

        db.commit()
        db.refresh(analysis)

        # 6. Build final response with port names and options
        response = RouteAnalysisResponse(
            id=analysis.id,
            vessel_id=analysis.vessel_id,
            origin_port=origin_port.name,
            destination_port=dest_port.name,
            priority=analysis.priority,
            departure_date=analysis.departure_date,
            max_acceptable_risk=analysis.max_acceptable_risk,
            max_deviation_percent=analysis.max_deviation_percent,
            total_options_generated=analysis.total_options_generated,
            recommended_option_id=analysis.recommended_option_id,
            ai_explanation=analysis.ai_explanation,
            ai_model_used=analysis.ai_model_used,
            status=analysis.status,
            created_at=analysis.created_at,
            completed_at=analysis.completed_at,
            options=option_responses
        )

        return response

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
    """
    Get all route analyses for the current user.
    Returns an empty list if none exist or if any error occurs.
    """
    try:
        routes = db.query(RouteAnalysis).filter(
            RouteAnalysis.user_id == current_user.id
        ).order_by(RouteAnalysis.created_at.desc()).all()

        result = []
        for route in routes:
            try:
                origin_port = db.query(Port).filter(Port.id == route.origin_port_id).first()
                dest_port = db.query(Port).filter(Port.id == route.destination_port_id).first()

                response = RouteAnalysisResponse(
                    id=route.id,
                    vessel_id=route.vessel_id,
                    origin_port=origin_port.name if origin_port else "Unknown",
                    destination_port=dest_port.name if dest_port else "Unknown",
                    priority=getattr(route, "priority", "balanced"),
                    departure_date=getattr(route, "departure_date", None),
                    max_acceptable_risk=getattr(route, "max_acceptable_risk", None),
                    max_deviation_percent=getattr(route, "max_deviation_percent", None),
                    total_options_generated=getattr(route, "total_options_generated", None),
                    recommended_option_id=getattr(route, "recommended_option_id", None),
                    ai_explanation=getattr(route, "ai_explanation", None),
                    ai_model_used=getattr(route, "ai_model_used", None),
                    status=getattr(route, "status", "unknown"),
                    created_at=route.created_at,
                    completed_at=getattr(route, "completed_at", None),
                    options=[]
                )
                result.append(response)
            except Exception as record_error:
                print(f"⚠️ Skipping route {route.id}: {record_error}")
                continue

        return result

    except Exception as e:
        print(f"❌ Error listing routes for user {current_user.id}: {e}")
        return []   # Always return empty list on error


@router.get("/{route_id}", response_model=RouteAnalysisResponse)
def get_route(
    route_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    route = db.query(RouteAnalysis).filter(
        RouteAnalysis.id == route_id,
        RouteAnalysis.user_id == current_user.id
    ).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    origin_port = db.query(Port).filter(Port.id == route.origin_port_id).first()
    dest_port = db.query(Port).filter(Port.id == route.destination_port_id).first()

    options = db.query(RouteOption).filter(
        RouteOption.analysis_id == route.id
    ).all()

    option_responses = []
    for opt in options:
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
    @router.get("/{route_id}", response_model=RouteAnalysisResponse)
def get_route(
    route_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    route = db.query(RouteAnalysis).filter(
        RouteAnalysis.id == route_id,
        RouteAnalysis.user_id == current_user.id
    ).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    origin_port = db.query(Port).filter(Port.id == route.origin_port_id).first()
    dest_port = db.query(Port).filter(Port.id == route.destination_port_id).first()

    options = db.query(RouteOption).filter(
        RouteOption.analysis_id == route.id
    ).all()

    option_responses = []
    for opt in options:
        # ✅ Fetch waypoints for this option
        waypoints = db.query(Waypoint).filter(
            Waypoint.route_option_id == opt.id
        ).order_by(Waypoint.sequence_number).all()

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
            created_at=opt.created_at,
            waypoints=waypoints   # <-- ADD THIS LINE
        ))

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
    return response