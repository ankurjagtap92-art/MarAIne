"""
Pydantic schemas for request/response validation
"""

from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, UUID4
from uuid import UUID, uuid4

# ============================================
# USER SCHEMAS
# ============================================

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: Optional[str] = "operator"
    company_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ============================================
# VESSEL SCHEMAS
# ============================================

class VesselBase(BaseModel):
    name: str
    imo_number: Optional[str] = None
    vessel_type: str
    length_meters: Optional[float] = None
    beam_meters: Optional[float] = None
    draft_meters: Optional[float] = None
    gross_tonnage: Optional[int] = None
    deadweight_tonnage: Optional[int] = None
    service_speed_knots: Optional[float] = None
    fuel_consumption_tons_per_day: Optional[float] = None
    fuel_type: Optional[str] = "VLSFO"
    max_wave_height_meters: Optional[float] = 8.0
    max_wind_speed_knots: Optional[float] = 50.0

class VesselCreate(VesselBase):
    pass

class VesselUpdate(BaseModel):
    name: Optional[str] = None
    imo_number: Optional[str] = None
    vessel_type: Optional[str] = None
    service_speed_knots: Optional[float] = None
    fuel_consumption_tons_per_day: Optional[float] = None
    max_wave_height_meters: Optional[float] = None
    # Add any other fields you have

class VesselResponse(VesselBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# ============================================
# PORT SCHEMAS
# ============================================

class PortBase(BaseModel):
    name: str
    country: str
    unlocode: str
    latitude: float
    longitude: float
    timezone: Optional[str] = None
    has_container_terminal: bool = False
    has_bulk_terminal: bool = False
    has_lng_terminal: bool = False
    max_vessel_draft: Optional[float] = None
    congestion_index: Optional[float] = None

class PortCreate(PortBase):
    pass

class PortResponse(PortBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class PortSearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 10

# ============================================
# ROUTE ANALYSIS SCHEMAS
# ============================================

class RouteAnalysisRequest(BaseModel):
    vessel_id: UUID
    origin_port: str
    destination_port: str
    priority: str = "balanced"
    departure_date: Optional[date] = None
    max_acceptable_risk: Optional[float] = 0.3
    max_deviation_percent: Optional[float] = 20.0

class RouteOptionBase(BaseModel):
    route_type: str
    total_distance_nm: Optional[float] = None
    estimated_duration_hours: Optional[float] = None
    avg_speed_knots: Optional[float] = None
    total_fuel_tons: Optional[float] = None
    fuel_cost_usd: Optional[float] = None
    weather_risk_score: Optional[float] = None
    piracy_risk_score: Optional[float] = None
    congestion_risk_score: Optional[float] = None
    overall_risk_score: Optional[float] = None
    estimated_co2_tons: Optional[float] = None
    route_geometry: Optional[Dict[str, Any]] = None
    weather_summary: Optional[Dict[str, Any]] = None

class RouteOptionCreate(RouteOptionBase):
    pass

class RouteOptionResponse(RouteOptionBase):
    id: UUID
    analysis_id: UUID
    is_recommended: bool
    created_at: datetime

    class Config:
        from_attributes = True

class WaypointBase(BaseModel):
    sequence_number: int
    latitude: float
    longitude: float
    distance_from_start_nm: Optional[float] = None
    cumulative_fuel_tons: Optional[float] = None
    reason: Optional[str] = None
    wave_height_m: Optional[float] = None
    wind_speed_knots: Optional[float] = None
    current_speed_knots: Optional[float] = None
    current_direction_deg: Optional[float] = None

class WaypointCreate(WaypointBase):
    pass

class WaypointResponse(WaypointBase):
    id: UUID
    route_option_id: UUID

    class Config:
        from_attributes = True

# ============================================
# ROUTE ANALYSIS RESPONSE - SINGLE DEFINITION
# ============================================

class RouteAnalysisResponse(BaseModel):
    id: UUID
    vessel_id: UUID
    origin_port: str
    destination_port: str
    priority: str
    departure_date: Optional[date] = None
    max_acceptable_risk: Optional[float] = None
    max_deviation_percent: Optional[float] = None
    total_options_generated: Optional[int] = None
    recommended_option_id: Optional[UUID] = None
    ai_explanation: Optional[str] = None
    ai_model_used: Optional[str] = None
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    options: List[RouteOptionResponse] = []

    class Config:
        from_attributes = True

# ============================================
# WEATHER CACHE SCHEMAS
# ============================================

class WeatherCacheBase(BaseModel):
    latitude: float
    longitude: float
    timestamp_utc: datetime
    forecast_hours_ahead: int
    wave_height_m: Optional[float] = None
    wave_direction_deg: Optional[float] = None
    wave_period_sec: Optional[float] = None
    wind_speed_knots: Optional[float] = None
    wind_direction_deg: Optional[float] = None
    wind_gust_knots: Optional[float] = None
    current_speed_knots: Optional[float] = None
    current_direction_deg: Optional[float] = None
    air_temperature_c: Optional[float] = None
    visibility_km: Optional[float] = None
    is_storm_zone: bool = False
    storm_category: Optional[str] = None
    source_api: Optional[str] = None

class WeatherCacheCreate(WeatherCacheBase):
    pass

class WeatherCacheResponse(WeatherCacheBase):
    id: UUID
    fetched_at: datetime

    class Config:
        from_attributes = True

# ============================================
# COST REFERENCE SCHEMAS
# ============================================

class CostReferenceBase(BaseModel):
    fuel_type: str
    price_per_ton_usd: float
    source: Optional[str] = None
    effective_date: date

class CostReferenceCreate(CostReferenceBase):
    pass

class CostReferenceResponse(CostReferenceBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# ============================================
# ADDITIONAL RESPONSE WRAPPERS
# ============================================

class MessageResponse(BaseModel):
    message: str

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    limit: int
    pages: int

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

# ✅ ADD THIS LINE
User = UserResponse

