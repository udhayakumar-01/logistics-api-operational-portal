from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import ApiError
from app.security.security import verify_api_key

router = APIRouter(prefix="/errors", tags=["Errors"])

@router.get("")
def list_errors(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    errors = db.query(ApiError).order_by(ApiError.id.desc()).limit(limit).all()
    return [
        {
            "error_id": err.error_id,
            "timestamp": err.timestamp,
            "error_code": err.error_code,
            "endpoint": err.endpoint,
            "method": err.method,
            "message": err.message,
            "actionable_advice": err.actionable_advice,
            "seller_id": err.seller_id
        }
        for err in errors
    ]
