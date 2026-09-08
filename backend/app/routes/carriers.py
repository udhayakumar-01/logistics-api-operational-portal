from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Carrier
from app.security.security import verify_api_key

router = APIRouter(prefix="/carriers", tags=["Carriers"])

@router.get("")
def list_carriers(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    carriers = db.query(Carrier).limit(limit).all()
    return [
        {
            "carrier_id": c.carrier_id,
            "name": c.name,
            "contact_number": c.contact_number,
            "active_vehicles": c.active_vehicles,
            "freshness_status": c.freshness_status,
            "last_updated": c.last_updated
        }
        for c in carriers
    ]
