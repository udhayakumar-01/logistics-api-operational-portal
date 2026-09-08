from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Warehouse
from app.security.security import verify_api_key

router = APIRouter(prefix="/warehouses", tags=["Warehouses"])

@router.get("")
def list_warehouses(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    warehouses = db.query(Warehouse).limit(limit).all()
    return [
        {
            "warehouse_id": w.warehouse_id,
            "name": w.name,
            "city": w.city,
            "capacity": w.capacity,
            "current_occupancy": w.current_occupancy,
            "occupancy_rate_pct": round((w.current_occupancy / w.capacity) * 100, 1) if w.capacity else 0,
            "freshness_status": w.freshness_status,
            "last_updated": w.last_updated
        }
        for w in warehouses
    ]
