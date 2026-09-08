from fastapi import APIRouter, Response, Depends
from app.config import settings

router = APIRouter(tags=["Operational Limits"])

@router.get("/limits")
def get_limits(response: Response):
    response.headers["X-RateLimit-Limit"] = str(settings.STANDARD_RATE_LIMIT)
    response.headers["X-RateLimit-Remaining"] = str(settings.STANDARD_RATE_LIMIT - 5)
    response.headers["X-RateLimit-Reset"] = "1757325600"
    
    return {
        "tier": "Standard",
        "requests_per_minute": settings.STANDARD_RATE_LIMIT,
        "burst_requests_per_second": settings.BURST_RATE_LIMIT,
        "max_payload_bytes": settings.MAX_PAYLOAD_BYTES,
        "retry_strategy": "Exponential Backoff with Jitter",
        "tiers": [
            {"tier": "Standard", "rate": "100 req/min", "burst": "20 req/sec", "concurrency": 5},
            {"tier": "Premium", "rate": "500 req/min", "burst": "50 req/sec", "concurrency": 25},
            {"tier": "Enterprise", "rate": "2000 req/min", "burst": "200 req/sec", "concurrency": 100}
        ]
    }
