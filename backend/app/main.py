"""
MarAIne - FastAPI Application Entry Point
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import Response

from .config import settings
from .database import engine, Base
from .routes import (
    auth,
    ports,
    vessels,
    routes as route_routes,
    dashboard,
    activities,
    voyage,
    analytics,
)


# ============================================
# APPLICATION LIFECYCLE
# ============================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"🚢 {settings.APP_NAME} v{settings.APP_VERSION} starting...")
    print(f"   Environment: {'DEBUG' if settings.DEBUG else 'PRODUCTION'}")

    try:
        Base.metadata.create_all(bind=engine)
        print("   ✅ Database tables verified/created")
    except Exception as e:
        print(f"   ⚠️ Table creation error: {e}")

    print(f"   API Docs: http://{settings.HOST}:{settings.PORT}/docs")
    yield

    print(f"🛑 {settings.APP_NAME} shutting down...")
    engine.dispose()
    print("   Database connections closed.")


# ============================================
# FASTAPI APP INSTANCE
# ============================================

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="## 🚢 MarAIne - AI Maritime Decision Intelligence Platform",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)


# ============================================
# CORS MIDDLEWARE
# ============================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# ============================================
# OPTIONS HANDLER (CORS Preflight)
# ============================================

@app.options("/{path:path}")
async def preflight_handler(request: Request, path: str):
    response = Response()
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


# ============================================
# ROUTERS - REGISTER ONCE
# ============================================

app.include_router(auth.router)
app.include_router(ports.router)       # ✅ ONLY ONCE
app.include_router(vessels.router)
app.include_router(route_routes.router)
app.include_router(dashboard.router)
app.include_router(activities.router)
app.include_router(voyage.router)
app.include_router(analytics.router)


# ============================================
# HEALTH CHECK
# ============================================

@app.get("/", tags=["Health"])
def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health", tags=["Health"])
def health_check():
    health_status = {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }
    try:
        with engine.connect() as conn:
            conn.execute(__import__("sqlalchemy").text("SELECT 1"))
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