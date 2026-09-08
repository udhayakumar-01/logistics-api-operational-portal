from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.database import get_db
from app.models.models import Inventory
from app.security.security import verify_api_key

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("/{sku}")
def get_inventory(
    sku: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    items = db.query(Inventory).filter(Inventory.sku == sku).all()
    if not items:
        raise HTTPException(
            status_code=404,
            detail={
                "error_code": "RESOURCE_NOT_FOUND",
                "message": f"SKU '{sku}' was not found in inventory catalog.",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "actionable_advice": "Check SKU format (e.g., SKU-1001 to SKU-2000)."
            }
        )
    
    total_qty = sum(item.quantity for item in items)
    return {
        "sku": sku,
        "total_quantity": total_qty,
        "warehouse_breakdown": [
            {
                "warehouse_id": item.warehouse_id,
                "quantity": item.quantity,
                "reorder_level": item.reorder_level,
                "freshness_status": item.freshness_status,
                "last_updated": item.last_updated
            }
            for item in items
        ]
    }
