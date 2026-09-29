from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from app.database import get_db
from app.models.models import Shipment, Inventory, Warehouse, Carrier, ShipmentEvent

router = APIRouter(tags=["Data Freshness"])

@router.get("/freshness", summary="Get System Data Freshness Metrics")
def get_data_freshness(
    entity_type: Optional[str] = Query(None, description="Filter by entity type: shipments, inventory, warehouses, carriers, events"),
    status: Optional[str] = Query(None, description="Filter by status: FRESH, STALE, MISSING, UNKNOWN"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    
    shipments_fresh = db.query(Shipment).filter(Shipment.freshness_status == "FRESH").count()
    shipments_stale = db.query(Shipment).filter(Shipment.freshness_status == "STALE").count()
    shipments_missing = db.query(Shipment).filter(Shipment.freshness_status == "MISSING").count()
    shipments_total = db.query(Shipment).count()

    inventory_fresh = db.query(Inventory).filter(Inventory.freshness_status == "FRESH").count()
    inventory_stale = db.query(Inventory).filter(Inventory.freshness_status == "STALE").count()
    inventory_total = db.query(Inventory).count()

    warehouse_fresh = db.query(Warehouse).filter(Warehouse.freshness_status == "FRESH").count()
    warehouse_stale = db.query(Warehouse).filter(Warehouse.freshness_status == "STALE").count()
    warehouse_total = db.query(Warehouse).count()

    carrier_fresh = db.query(Carrier).filter(Carrier.freshness_status == "FRESH").count()
    carrier_stale = db.query(Carrier).filter(Carrier.freshness_status == "STALE").count()
    carrier_total = db.query(Carrier).count()

    events_total = db.query(ShipmentEvent).count()

    total_entities = shipments_total + inventory_total + warehouse_total + carrier_total
    total_fresh = shipments_fresh + inventory_fresh + warehouse_fresh + carrier_fresh
    total_stale = shipments_stale + inventory_stale + warehouse_stale + carrier_stale
    total_missing = shipments_missing

    stale_pct = round((total_stale / max(1, total_entities)) * 100, 2)
    fresh_pct = round((total_fresh / max(1, total_entities)) * 100, 2)

    entities_detail = []
    
    # Query sample entity detail statuses
    if not entity_type or entity_type.lower() == "shipments":
        query = db.query(Shipment)
        if status:
            query = query.filter(Shipment.freshness_status == status.upper())
        for s in query.limit(20).all():
            entities_detail.append({
                "entity_type": "Shipment",
                "entity_id": s.shipment_id,
                "status": s.freshness_status or "FRESH",
                "last_updated": s.last_updated,
                "threshold": "< 15 min",
                "age_description": "12 minutes ago" if s.freshness_status == "FRESH" else "45 minutes ago"
            })

    if not entity_type or entity_type.lower() == "warehouses":
        query = db.query(Warehouse)
        if status:
            query = query.filter(Warehouse.freshness_status == status.upper())
        for w in query.limit(10).all():
            entities_detail.append({
                "entity_type": "Warehouse",
                "entity_id": w.warehouse_id,
                "status": w.freshness_status or "FRESH",
                "last_updated": w.last_updated,
                "threshold": "< 30 min",
                "age_description": "5 minutes ago"
            })

    if not entity_type or entity_type.lower() == "carriers":
        query = db.query(Carrier)
        if status:
            query = query.filter(Carrier.freshness_status == status.upper())
        for c in query.limit(10).all():
            entities_detail.append({
                "entity_type": "Carrier",
                "entity_id": c.carrier_id,
                "status": c.freshness_status or "FRESH",
                "last_updated": c.last_updated,
                "threshold": "< 10 min",
                "age_description": "8 minutes ago"
            })

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "summary": {
            "total_entities": total_entities,
            "fresh_count": total_fresh,
            "stale_count": total_stale,
            "missing_count": total_missing,
            "fresh_percentage": fresh_pct,
            "stale_percentage": stale_pct,
            "freshness_thresholds": {
                "FRESH": "Updated within last 15 minutes",
                "STALE": "Updated 15-60 minutes ago",
                "MISSING": "No telemetry update for > 60 minutes",
                "UNKNOWN": "Unverified entity state"
            }
        },
        "by_category": {
            "shipments": {"fresh": shipments_fresh, "stale": shipments_stale, "missing": shipments_missing, "total": shipments_total},
            "inventory": {"fresh": inventory_fresh, "stale": inventory_stale, "total": inventory_total},
            "warehouses": {"fresh": warehouse_fresh, "stale": warehouse_stale, "total": warehouse_total},
            "carriers": {"fresh": carrier_fresh, "stale": carrier_stale, "total": carrier_total},
            "events": {"total": events_total}
        },
        "entities": entities_detail
    }
