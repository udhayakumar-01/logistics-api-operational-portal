from fastapi import Request, HTTPException, Security, status
from fastapi.security import APIKeyHeader
from datetime import datetime, timezone
from app.config import settings

API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)

# Valid demo API keys
VALID_API_KEYS = {
    "demo-api-key-seller-001": "SELLER-001",
    "demo-api-key-partner-admin": "ADMIN-001",
    "demo-api-key-carrier-001": "CARRIER-001",
    "demo-api-key-warehouse-001": "WH-001"
}

def verify_api_key(api_key: str = Security(API_KEY_HEADER)):
    # Exempt endpoints like /api/v1/health from mandatory auth if needed, but enforce elsewhere
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error_code": "MISSING_API_KEY",
                "message": "X-API-Key header is missing from your request.",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "actionable_advice": "Include header `X-API-Key: demo-api-key-seller-001` or `demo-api-key-partner-admin`."
            }
        )
    
    if api_key not in VALID_API_KEYS and not api_key.startswith("key-seller-"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error_code": "INVALID_API_KEY",
                "message": "The provided X-API-Key is invalid or revoked.",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "actionable_advice": "Check your API key in the Partner Portal or use `demo-api-key-seller-001`."
            }
        )
    return api_key

async def check_payload_size(request: Request):
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > settings.MAX_PAYLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail={
                "error_code": "PAYLOAD_TOO_LARGE",
                "message": f"Request body size exceeds maximum limit of {settings.MAX_PAYLOAD_BYTES} bytes.",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "actionable_advice": "Reduce request payload size or compress item arrays."
            }
        )
