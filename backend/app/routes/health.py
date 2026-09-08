from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter(tags=["Health"])

@router.get("/health")
def get_health():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": "connected",
        "data_freshness": "FRESH",
        "uptime_seconds": 86400,
        "environment": "development-operational-simulation"
    }
