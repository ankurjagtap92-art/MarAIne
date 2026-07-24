"""
MarAIne - SQLAlchemy Database Models
All 8 core tables for the maritime decision intelligence platform.

Architecture Notes:
- UUIDs as primary keys (security + distributed-system ready)
- JSONB for flexible data (weather summaries, route geometry)
- CHECK constraints enforce data integrity at database level
- Indexed on frequently queried columns
"""

import uuid
from datetime import datetime, date
from typing import Optional, List
from decimal import Decimal

from sqlalchemy import (
    String, Integer, Float, Boolean, Date, Text,
    DateTime, ForeignKey, CheckConstraint, UniqueConstraint,
    Index, Numeric
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from ..database import Base


# ============================================
# TABLE 1: users
# ============================================
class User(Base):
    """
    Platform users - ship captains, fleet managers, admins.

    Design Decisions:
    - UUID primary key: Not guessable, safe in URLs, distributed-system friendly
    - role as CHECK: Future-proof for fleet manager dashboard features
    - company_name as simple string: Not normalized for MVP speed,
      but easy to extract into separate table later
    - Partial index on active users only: Faster login queries
    """
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        comment="Unique user identifier"
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
        comment="User email address (used for login)"
    )
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Bcrypt hashed password"
    )
    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="User's full display name"
    )
    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="operator",
        comment="User role: operator, fleet_manager, or admin"
    )
    company_name: Mapped[Optional[str]] = mapped_column(
        String(200),
        nullable=True,
        comment="Company or organization name"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        comment="Account creation timestamp"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        comment="Last profile update timestamp"
    )
    last_login: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Most recent successful login"
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        comment="Soft delete flag - inactive users cannot log in"
    )

    # Relationships
    vessels: Mapped[List["Vessel"]] = relationship(
        "Vessel",
        back_populates="owner",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    route_analyses: Mapped[List["RouteAnalysis"]] = relationship(
        "RouteAnalysis",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "role IN ('operator', 'fleet_manager', 'admin')",
            name="ck_user_role_valid"
        ),
        # Partial index: only index active users for login queries
        Index(
            "idx_users_email_active",
            email,
            postgresql_where=(is_active == True)
        ),
        {"comment": "Platform users - captains, fleet managers, administrators"}
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}')>"


# ============================================
# TABLE 2: vessels
# ============================================
class Vessel(Base):
    """
    Maritime vessels registered in the platform.

    Critical Columns for AI Optimization:
    - service_speed_knots: Optimal cruising speed (typically 12-16 knots)
    - fuel_consumption_tons_per_day: At service speed
    - max_wave_height_meters: Safety threshold beyond which routing must avoid
    - max_wind_speed_knots: Wind safety envelope

    Why These Matter:
    Fuel vs Speed is NON-LINEAR. A Panamax at 14 knots burns ~30 tons/day.
    At 16 knots: ~45 tons/day (50% more fuel for 14% more speed).
    Our AI optimizes using these vessel-specific curves.
    """
    __tablename__ = "vessels"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Owner of this vessel"
    )
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Vessel display name"
    )
    imo_number: Mapped[Optional[str]] = mapped_column(
        String(7),
        unique=True,
        nullable=True,
        comment="International Maritime Organization unique identifier"
    )
    vessel_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Type: container_ship, bulk_carrier, tanker, etc."
    )

    # Physical specifications
    length_meters: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Overall length in meters"
    )
    beam_meters: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Width (beam) in meters"
    )
    draft_meters: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Maximum draft in meters (affects shallow water routing)"
    )
    gross_tonnage: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Gross tonnage (volume measure)"
    )
    deadweight_tonnage: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Deadweight tonnage (cargo capacity in tons)"
    )

    # Performance parameters (THE MOST IMPORTANT COLUMNS)
    service_speed_knots: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Optimal cruising speed in knots (typically 12-16)"
    )
    fuel_consumption_tons_per_day: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Fuel consumption at service speed in tons per day"
    )
    fuel_type: Mapped[str] = mapped_column(
        String(20),
        default="VLSFO",
        comment="Fuel type: VLSFO, HFO, MGO, LNG"
    )

    # Safety thresholds
    max_wave_height_meters: Mapped[Optional[float]] = mapped_column(
        Float,
        default=8.0,
        comment="Maximum safe wave height. Beyond this = danger zone."
    )
    max_wind_speed_knots: Mapped[Optional[float]] = mapped_column(
        Float,
        default=50.0,
        comment="Maximum safe wind speed in knots"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="vessels")
    route_analyses: Mapped[List["RouteAnalysis"]] = relationship(
        "RouteAnalysis",
        back_populates="vessel",
        cascade="all, delete-orphan"
    )

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "vessel_type IN ('container_ship', 'bulk_carrier', 'tanker', "
            "'lng_carrier', 'ro_ro', 'general_cargo', 'other')",
            name="ck_vessel_type_valid"
        ),
        CheckConstraint(
            "fuel_type IN ('VLSFO', 'HFO', 'MGO', 'LNG')",
            name="ck_fuel_type_valid"
        ),
        UniqueConstraint("user_id", "imo_number", name="uq_user_vessel_imo"),
        Index("idx_vessels_imo", imo_number),
        {"comment": "Maritime vessels with performance and safety parameters"}
    )

    def __repr__(self) -> str:
        return f"<Vessel(name='{self.name}', type='{self.vessel_type}', imo='{self.imo_number}')>"


# ============================================
# TABLE 3: ports
# ============================================
class Port(Base):
    """
    Global port database (pre-seeded with ~50 major ports).

    UN/LOCODE is the international standard 5-character port code.
    Example: "SGSIN" = Singapore, "INBOM" = Mumbai.

    The congestion_index (0-10) is a placeholder for future AIS integration
    where we'd calculate actual port wait times from live vessel positions.
    """
    __tablename__ = "ports"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        comment="Full port name"
    )
    country: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Country where port is located"
    )
    unlocode: Mapped[str] = mapped_column(
        String(5),
        unique=True,
        nullable=False,
        index=True,
        comment="UN/LOCODE standard 5-character port identifier"
    )
    latitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        comment="Latitude in decimal degrees"
    )
    longitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        comment="Longitude in decimal degrees"
    )
    timezone: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="IANA timezone string (e.g., 'Asia/Kolkata')"
    )

    # Terminal capabilities
    has_container_terminal: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Has container handling facilities"
    )
    has_bulk_terminal: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Has bulk cargo handling facilities"
    )
    has_lng_terminal: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="Has LNG handling facilities"
    )
    max_vessel_draft: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Maximum vessel draft in meters (depth limitation)"
    )
    congestion_index: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Current congestion rating 0-10 (10 = severely congested)"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "latitude BETWEEN -90 AND 90",
            name="ck_port_latitude_valid"
        ),
        CheckConstraint(
            "longitude BETWEEN -180 AND 180",
            name="ck_port_longitude_valid"
        ),
        CheckConstraint(
            "congestion_index IS NULL OR (congestion_index BETWEEN 0 AND 10)",
            name="ck_port_congestion_valid"
        ),
        {"comment": "Global port database with capabilities and congestion data"}
    )

    def __repr__(self) -> str:
        return f"<Port(name='{self.name}', unlocode='{self.unlocode}')>"


# ============================================
# TABLE 4: route_analyses
# ============================================
class RouteAnalysis(Base):
    """
    Parent record for every route optimization request.

    Stores user preferences (how they weight the optimization),
    constraints (departure date, max risk tolerance), and the
    AI-generated explanation of recommendations.

    One analysis can produce multiple route options (fastest, cheapest,
    safest, balanced).
    """
    __tablename__ = "route_analyses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    vessel_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("vessels.id"),
        nullable=False,
        index=True
    )
    origin_port_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("ports.id"),
        nullable=False,
        comment="Departure port"
    )
    destination_port_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("ports.id"),
        nullable=False,
        comment="Arrival port"
    )

    # User preferences
    priority: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="balanced",
        comment="Optimization priority: fastest, cheapest, safest, balanced"
    )
    departure_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
        comment="Planned departure date"
    )
    max_acceptable_risk: Mapped[Optional[float]] = mapped_column(
        Float,
        default=0.30,
        comment="Maximum acceptable risk score (0-1 scale)"
    )
    max_deviation_percent: Mapped[Optional[float]] = mapped_column(
        Float,
        default=20.0,
        comment="Maximum acceptable extra distance in percentage"
    )

    # Results
    total_options_generated: Mapped[Optional[int]] = mapped_column(
        Integer,
        default=0,
        comment="Number of route options produced"
    )
    recommended_option_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
        comment="References the recommended route_option"
    )

    # AI explanation
    ai_explanation: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Full AI-generated explanation of recommendations"
    )
    ai_model_used: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Which AI model generated the explanation"
    )

    # Performance
    analysis_duration_ms: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="How long the analysis took in milliseconds"
    )
    status: Mapped[str] = mapped_column(
        String(20),
        default="pending",
        comment="Analysis status: pending, processing, completed, failed"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="When analysis finished (success or failure)"
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="route_analyses")
    vessel: Mapped["Vessel"] = relationship("Vessel", back_populates="route_analyses")
    origin_port: Mapped["Port"] = relationship("Port", foreign_keys=[origin_port_id])
    destination_port: Mapped["Port"] = relationship("Port", foreign_keys=[destination_port_id])
    route_options: Mapped[List["RouteOption"]] = relationship(
        "RouteOption",
        back_populates="analysis",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "priority IN ('fastest', 'cheapest', 'safest', 'balanced')",
            name="ck_analysis_priority_valid"
        ),
        CheckConstraint(
            "status IN ('pending', 'processing', 'completed', 'failed')",
            name="ck_analysis_status_valid"
        ),
        CheckConstraint(
            "max_acceptable_risk IS NULL OR (max_acceptable_risk BETWEEN 0 AND 1)",
            name="ck_risk_range_valid"
        ),
        Index("idx_analyses_user_created", user_id, created_at.desc()),
        {"comment": "Route optimization analysis requests with AI explanations"}
    )

    def __repr__(self) -> str:
        return f"<RouteAnalysis(id={self.id}, status='{self.status}', priority='{self.priority}')>"


# ============================================
# TABLE 5: route_options
# ============================================
class RouteOption(Base):
    """
    Individual route alternative generated by the optimization engine.

    Each analysis produces 3-4 route options with different trade-offs:
    - Fastest: Minimize voyage time
    - Cheapest: Minimize fuel cost
    - Safest: Minimize risk exposure
    - Balanced: Weighted multi-objective optimization

    The route_geometry column stores the full path as GeoJSON
    for rendering on the interactive map.
    """
    __tablename__ = "route_options"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    analysis_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("route_analyses.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Classification
    route_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="Route classification: fastest, cheapest, safest, balanced"
    )
    is_recommended: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="True if this is the recommended route"
    )

    # Route metrics (THE NUMBERS THAT MATTER)
    total_distance_nm: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Total distance in nautical miles"
    )
    estimated_duration_hours: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Estimated voyage duration in hours"
    )
    avg_speed_knots: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Average speed over the route in knots"
    )

    # Fuel & Cost
    total_fuel_tons: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Total fuel consumption in metric tons"
    )
    fuel_cost_usd: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Total fuel cost in USD"
    )
    cost_per_day_usd: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Average daily fuel cost in USD"
    )

    # Risk Scores (0-100, lower = safer)
    weather_risk_score: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Weather-related risk score 0-100"
    )
    piracy_risk_score: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Piracy risk score 0-100"
    )
    congestion_risk_score: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Port congestion risk score 0-100"
    )
    overall_risk_score: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Weighted composite risk score 0-100"
    )

    # Environmental
    estimated_co2_tons: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Estimated CO2 emissions in metric tons"
    )

    # Route geometry & weather
    route_geometry: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Full route path as GeoJSON for map rendering"
    )
    weather_summary: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
        comment="Summary weather conditions along route: {avg_wave_height, max_wave_height, storm_zones: []}"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # Relationships
    analysis: Mapped["RouteAnalysis"] = relationship("RouteAnalysis", back_populates="route_options")
    waypoints: Mapped[List["Waypoint"]] = relationship(
        "Waypoint",
        back_populates="route_option",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="Waypoint.sequence_number"
    )

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "route_type IN ('fastest', 'cheapest', 'safest', 'balanced')",
            name="ck_route_type_valid"
        ),
        CheckConstraint(
            "weather_risk_score IS NULL OR (weather_risk_score BETWEEN 0 AND 100)",
            name="ck_weather_risk_valid"
        ),
        CheckConstraint(
            "overall_risk_score IS NULL OR (overall_risk_score BETWEEN 0 AND 100)",
            name="ck_overall_risk_valid"
        ),
        Index("idx_options_analysis_type", analysis_id, route_type),
        {"comment": "Route alternatives with cost, time, and risk metrics"}
    )

    def __repr__(self) -> str:
        return f"<RouteOption(type='{self.route_type}', distance={self.total_distance_nm}nm, recommended={self.is_recommended})>"


# ============================================
# TABLE 6: waypoints
# ============================================
class Waypoint(Base):
    """
    Individual turning points along a route.

    The 'reason' column is critical for AI explainability.
    When the AI says "Diverting south at waypoint 7 to avoid
    5m waves from a monsoon depression," it reads from this column.

    Each waypoint also stores the weather conditions at that
    point when the route was calculated, enabling the AI to
    explain WHY each diversion was necessary.
    """
    __tablename__ = "waypoints"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    route_option_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("route_options.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    sequence_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="Order in the route (1, 2, 3...)"
    )
    latitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        comment="Latitude in decimal degrees"
    )
    longitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        comment="Longitude in decimal degrees"
    )

    # Progress metrics
    distance_from_start_nm: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Cumulative distance from departure in nautical miles"
    )
    cumulative_fuel_tons: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Total fuel consumed up to this waypoint"
    )

    # Explainability
    reason: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Why this waypoint exists: current_optimization, storm_avoidance, waypoint_rounding, etc."
    )

    # Weather at waypoint (snapshot from when route was calculated)
    wave_height_m: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Wave height in meters at this point"
    )
    wind_speed_knots: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Wind speed in knots"
    )
    current_speed_knots: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Ocean current speed in knots"
    )
    current_direction_deg: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Ocean current direction in degrees (0-360)"
    )

    # Relationships
    route_option: Mapped["RouteOption"] = relationship("RouteOption", back_populates="waypoints")

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "sequence_number > 0",
            name="ck_waypoint_sequence_positive"
        ),
        CheckConstraint(
            "latitude BETWEEN -90 AND 90",
            name="ck_waypoint_lat_valid"
        ),
        CheckConstraint(
            "longitude BETWEEN -180 AND 180",
            name="ck_waypoint_lon_valid"
        ),
        UniqueConstraint("route_option_id", "sequence_number", name="uq_route_sequence"),
        Index("idx_waypoints_route_seq", route_option_id, sequence_number),
        {"comment": "Route turning points with weather snapshots and diversion reasons"}
    )

    def __repr__(self) -> str:
        return f"<Waypoint(seq={self.sequence_number}, lat={self.latitude}, lon={self.longitude}, reason='{self.reason}')>"


# ============================================
# TABLE 7: weather_cache
# ============================================
class WeatherCache(Base):
    """
    Cached weather data to reduce external API calls.

    Strategy:
    - Cache for 1 hour max for regular weather
    - Storm zone data refreshes every 30 minutes
    - Spatial resolution: 1-degree grid (~111km at equator) for ocean,
      finer for coastal areas

    Saves API costs and dramatically speeds up route calculations
    by avoiding redundant weather fetches for nearby points.
    """
    __tablename__ = "weather_cache"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # Location (rounded to grid for caching)
    latitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        comment="Latitude rounded to nearest 0.5 degrees for caching"
    )
    longitude: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        comment="Longitude rounded to nearest 0.5 degrees"
    )

    # Time dimensions
    timestamp_utc: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        comment="Forecast valid time in UTC"
    )
    forecast_hours_ahead: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        comment="0=current, 6, 12, 24, 48, 72 hours ahead"
    )

    # Marine weather data
    wave_height_m: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Significant wave height in meters"
    )
    wave_direction_deg: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Wave direction in degrees"
    )
    wave_period_sec: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Wave period in seconds"
    )
    wind_speed_knots: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Wind speed at 10m height in knots"
    )
    wind_direction_deg: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Wind direction in degrees"
    )
    wind_gust_knots: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Wind gust speed in knots"
    )
    current_speed_knots: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Ocean current speed in knots"
    )
    current_direction_deg: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Ocean current direction in degrees"
    )
    air_temperature_c: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Air temperature in Celsius"
    )
    visibility_km: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        comment="Visibility in kilometers"
    )

    # Storm/cyclone data
    is_storm_zone: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        comment="True if this location is in an active storm zone"
    )
    storm_category: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True,
        comment="Storm category: tropical_depression, tropical_storm, cyclone, etc."
    )

    # Metadata
    source_api: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Which weather API provided this data"
    )
    fetched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        comment="When this data was fetched from the API"
    )

    # Constraints
    __table_args__ = (
        UniqueConstraint(
            "latitude", "longitude", "timestamp_utc", "forecast_hours_ahead",
            name="uq_weather_point_time"
        ),
        Index(
            "idx_weather_location_time",
            latitude, longitude, timestamp_utc
        ),
        {"comment": "Cached marine weather data to minimize external API calls"}
    )

    def __repr__(self) -> str:
        return f"<WeatherCache(lat={self.latitude}, lon={self.longitude}, time={self.timestamp_utc})>"


# ============================================
# TABLE 8: cost_reference
# ============================================
class CostReference(Base):
    """
    Current bunker fuel prices for cost calculations.

    Fuel prices are volatile. This table tracks prices over time,
    always using the most recent entry for calculations.

    VLSFO (Very Low Sulfur Fuel Oil): $550-650/ton typical
    HFO (Heavy Fuel Oil): $400-500/ton (being phased out)
    MGO (Marine Gas Oil): $700-900/ton
    LNG (Liquefied Natural Gas): Variable by region
    """
    __tablename__ = "cost_reference"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    fuel_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        comment="Fuel type: VLSFO, HFO, MGO, LNG"
    )
    price_per_ton_usd: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        comment="Price per metric ton in USD"
    )
    source: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Data source (e.g., 'Bunkerworld', 'Ship & Bunker')"
    )
    effective_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        default=func.current_date(),
        comment="Date this price became effective"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "fuel_type IN ('VLSFO', 'HFO', 'MGO', 'LNG')",
            name="ck_cost_fuel_type_valid"
        ),
        CheckConstraint(
            "price_per_ton_usd > 0",
            name="ck_cost_price_positive"
        ),
        Index("idx_cost_type_date", fuel_type, effective_date.desc()),
        {"comment": "Bunker fuel price reference data for cost estimation"}
    )

    def __repr__(self) -> str:
        return f"<CostReference(fuel='{self.fuel_type}', price=${self.price_per_ton_usd}/ton, date={self.effective_date})>"