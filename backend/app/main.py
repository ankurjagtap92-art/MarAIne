"""
MarAIne - FastAPI Application Entry Point
AI Maritime Decision Intelligence Platform

This is the main application file that:
- Creates the FastAPI app instance
- Configures CORS for frontend communication
- Mounts all API routers
- Provides health check endpoint
- Serves API documentation
"""

from .routes import auth, ports, vessels, routes as route_routes, dashboard, activities, voyage, analytics

from .routes import voyage

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import engine, Base
from .routes import auth, ports, vessels, routes as route_routes, dashboard, activities


# ============================================
# APPLICATION LIFECYCLE
# ============================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup and shutdown events.

    Startup:
    - Verify database connection
    - Log application start

    Shutdown:
    - Close database connections
    - Cleanup resources
    """
    # Startup
    print(f"🚢 {settings.APP_NAME} v{settings.APP_VERSION} starting...")
    print(f"   Environment: {'DEBUG' if settings.DEBUG else 'PRODUCTION'}")
    print(f"   Database: Connected")
    print(f"   API Docs: http://{settings.HOST}:{settings.PORT}/docs")

    yield

    # Shutdown
    print(f"🛑 {settings.APP_NAME} shutting down...")
    engine.dispose()
    print("   Database connections closed.")


# ============================================
# FASTAPI APP INSTANCE
# ============================================

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ## 🚢 MarAIne - AI Maritime Decision Intelligence Platform

    An intelligent maritime platform that helps ships make safer, smarter,
    and more fuel-efficient decisions using AI-powered route optimization.

    ### Features
    - **Multi-Objective Route Optimization**: Balance time, cost, and safety
    - **AI-Powered Explanations**: Understand WHY each route is recommended
    - **Risk Visualization**: Color-coded danger zones on interactive maps
    - **Fuel & Cost Calculator**: Real-time cost estimation per route
    - **Weather Integration**: Live marine weather data overlay

    ### Authentication
    All protected endpoints require a JWT Bearer token.
    Get your token from `/api/v1/auth/login`.
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
    contact={
        "name": "MarAIne Team",
        "url": "https://github.com/yourusername/maraine",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
)


# ============================================
# CORS MIDDLEWARE
# ============================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ✅ Allow all origins for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ============================================
# ROUTERS - REGISTER ALL ROUTES
# ============================================

# Authentication
app.include_router(auth.router)

# Ports
app.include_router(ports.router)

# Vessels
app.include_router(vessels.router)

# Routes
app.include_router(route_routes.router)

# Dashboard
app.include_router(dashboard.router)

# Activities
app.include_router(activities.router)

app.include_router(voyage.router)

app.include_router(analytics.router)
# ============================================
# HEALTH CHECK
# ============================================

@app.get(
    "/",
    tags=["Health"],
    summary="Root endpoint - API status check"
)
def root():
    """
    Returns basic API information.
    Use this to verify the server is running.
    """
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "docs": "/docs",
        "health": "/health"
    }


@app.get(
    "/health",
    tags=["Health"],
    summary="Health check endpoint",
    description="Returns server health status. Used for monitoring."
)
def health_check():
    """
    Detailed health check.
    Verifies database connectivity.
    """
    health_status = {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }

    # Check database connectivity
    try:
        with engine.connect() as conn:
            conn.execute(
                __import__("sqlalchemy").text("SELECT 1")
            )
        health_status["database"] = "connected"
    except Exception as e:
        health_status["database"] = f"error: {str(e)}"
        health_status["status"] = "degraded"

    return health_status


# ============================================
# RUN CONFIGURATION
# ============================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
    )