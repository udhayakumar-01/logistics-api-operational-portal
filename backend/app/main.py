from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
import time
import os

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.seed import seed_database_from_csv
from app.services.rate_limiter import rate_limiter
from app.routes import (
    shipments, carriers, warehouses, inventory, events, health, limits, errors, evidence, simulator, dashboard, experiments, validation, risks, freshness
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Operational API documentation portal for Logistics Marketplace APIs.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve Frontend Dashboard at root /
FRONTEND_INDEX = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "index.html")

@app.get("/", response_class=HTMLResponse)
def read_root():
    if os.path.exists(FRONTEND_INDEX):
        with open(FRONTEND_INDEX, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse(content="<h1>Logistics API Operational Portal</h1><p>Visit <a href='/docs'>/docs</a> for OpenAPI explorer.</p>")

# Rate Limiting Middleware
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    # Exempt static docs, root portal, openapi, health, and simulator controls from strict rate limits
    if request.url.path in ["/", "/docs", "/redoc", "/openapi.json", "/api/v1/health", "/api/v1/simulator/trigger-limit", "/api/v1/simulator/reset-demo"] or request.method == "OPTIONS":
        return await call_next(request)

    api_key = request.headers.get("X-API-Key") or request.client.host or "anonymous"
    
    # Check rate limit (100 req/min for Standard tier default)
    is_limited, limit, remaining, reset_time = rate_limiter.is_rate_limited(api_key, limit=settings.STANDARD_RATE_LIMIT)

    if is_limited:
        retry_after = max(1, reset_time - int(time.time()))
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            headers={
                "Retry-After": str(retry_after),
                "X-RateLimit-Limit": str(limit),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(reset_time)
            },
            content={
                "error_code": "RATE_LIMIT_EXCEEDED",
                "message": f"Rate limit exceeded ({limit} requests per minute). Remaining quota: 0.",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "actionable_advice": f"Wait for {retry_after} seconds before retrying. Implement exponential backoff.",
                "documentation_url": "http://localhost:8000/docs#/Operational%20Limits/get_limits_api_v1_limits_get"
            }
        )

    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = str(limit)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    response.headers["X-RateLimit-Reset"] = str(reset_time)
    return response

# Custom HTTP Exception Handler to enforce structured safe errors
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    if isinstance(exc.detail, dict) and "error_code" in exc.detail:
        return JSONResponse(status_code=exc.status_code, content=exc.detail)
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_code": "API_ERROR",
            "message": str(exc.detail),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "actionable_advice": "Inspect operational documentation and schema specs."
        }
    )

# Include Routers
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(limits.router, prefix=settings.API_V1_STR)
app.include_router(shipments.router, prefix=settings.API_V1_STR)
app.include_router(carriers.router, prefix=settings.API_V1_STR)
app.include_router(warehouses.router, prefix=settings.API_V1_STR)
app.include_router(inventory.router, prefix=settings.API_V1_STR)
app.include_router(events.router, prefix=settings.API_V1_STR)
app.include_router(evidence.router, prefix=settings.API_V1_STR)
app.include_router(errors.router, prefix=settings.API_V1_STR)
app.include_router(simulator.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(experiments.router, prefix=settings.API_V1_STR)
app.include_router(validation.router, prefix=settings.API_V1_STR)
app.include_router(risks.router, prefix=settings.API_V1_STR)
app.include_router(freshness.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        from app.models.models import Shipment
        if db.query(Shipment).count() == 0:
            seed_database_from_csv(db)
    finally:
        db.close()
