from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import json

from app.database import get_db
from app.models.models import Shipment, ShipmentEvent, Warehouse, Carrier, Seller
from app.schemas.schemas import ShipmentCreateRequest, ShipmentStatusUpdate
from app.security.security import verify_api_key

router = APIRouter(prefix="/shipments", tags=["Shipments"])

@router.post("", status_code=status.HTTP_201_CREATED)
def create_shipment(
    payload: ShipmentCreateRequest,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    # Validate warehouse exists
    wh = db.query(Warehouse).filter(Warehouse.warehouse_id == payload.warehouse_id).first()
    if not wh:
        raise HTTPException(
            status_code=400,
            detail={
                "error_code": "INVALID_PARAMETER",
                "message": f"Warehouse '{payload.warehouse_id}' does not exist or is inactive.",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "actionable_advice": "Verify valid warehouse IDs from GET /api/v1/warehouses."
            }
        )

    # Validate carrier exists
    carrier = db.query(Carrier).filter(Carrier.carrier_id == payload.carrier_id).first()
    if not carrier:
        raise HTTPException(
            status_code=400,
            detail={
                "error_code": "INVALID_PARAMETER",
                "message": f"Carrier '{payload.carrier_id}' does not exist.",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "actionable_advice": "Verify active carrier IDs from GET /api/v1/carriers."
            }
        )

    count = db.query(Shipment).count() + 5001
    shipment_id = f"SHP-{count:04d}"
    now_iso = datetime.now(timezone.utc).isoformat()

    shipment = Shipment(
        shipment_id=shipment_id,
        seller_id=payload.seller_id,
        warehouse_id=payload.warehouse_id,
        carrier_id=payload.carrier_id,
        origin=payload.origin or wh.city,
        destination=payload.destination,
        status="CREATED",
        current_sequence=1,
        created_at=now_iso,
        last_updated=now_iso,
        freshness_status="FRESH"
    )
    db.add(shipment)
    db.flush()

    # Initial creation event
    evt = ShipmentEvent(
        event_id=f"EVT-CREATE-{shipment_id}",
        event_type="SHIPMENT_CREATED",
        entity_id=shipment_id,
        timestamp=now_iso,
        received_at=now_iso,
        source="SELLER_API",
        sequence_number=1,
        payload=json.dumps({"items": [i.dict() for i in payload.items]}),
        status="PROCESSED",
        decision="STATE_MUTATED",
        reason="Initial shipment order creation"
    )
    db.add(evt)
    db.commit()
    db.refresh(shipment)

    return {
        "shipment_id": shipment.shipment_id,
        "status": shipment.status,
        "seller_id": shipment.seller_id,
        "warehouse_id": shipment.warehouse_id,
        "carrier_id": shipment.carrier_id,
        "origin": shipment.origin,
        "destination": shipment.destination,
        "current_sequence": shipment.current_sequence,
        "created_at": shipment.created_at
    }

@router.get("/{shipment_id}")
def get_shipment(
    shipment_id: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    shipment = db.query(Shipment).filter(Shipment.shipment_id == shipment_id).first()
    if not shipment:
        raise HTTPException(
            status_code=404,
            detail={
                "error_code": "RESOURCE_NOT_FOUND",
                "message": f"Shipment '{shipment_id}' was not found.",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "actionable_advice": "Check the shipment ID formatting (e.g., SHP-0001)."
            }
        )

    events_count = db.query(ShipmentEvent).filter(ShipmentEvent.entity_id == shipment_id).count()

    return {
        "shipment_id": shipment.shipment_id,
        "seller_id": shipment.seller_id,
        "warehouse_id": shipment.warehouse_id,
        "carrier_id": shipment.carrier_id,
        "origin": shipment.origin,
        "destination": shipment.destination,
        "status": shipment.status,
        "current_sequence": shipment.current_sequence,
        "event_count": events_count,
        "duplicate_event_count": shipment.duplicate_event_count,
        "out_of_order_event_count": shipment.out_of_order_event_count,
        "delayed_event_count": shipment.delayed_event_count,
        "freshness_status": shipment.freshness_status,
        "created_at": shipment.created_at,
        "last_updated": shipment.last_updated
    }

@router.patch("/{shipment_id}/status")
def update_shipment_status(
    shipment_id: str,
    payload: ShipmentStatusUpdate,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    shipment = db.query(Shipment).filter(Shipment.shipment_id == shipment_id).first()
    if not shipment:
        raise HTTPException(
            status_code=404,
            detail={
                "error_code": "RESOURCE_NOT_FOUND",
                "message": f"Shipment '{shipment_id}' not found.",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "actionable_advice": "Ensure valid shipment ID."
            }
        )

    valid_transitions = {
        "CREATED": ["PICKED_UP", "CANCELLED"],
        "PICKED_UP": ["IN_TRANSIT", "CANCELLED"],
        "IN_TRANSIT": ["OUT_FOR_DELIVERY", "CANCELLED"],
        "OUT_FOR_DELIVERY": ["DELIVERED", "CANCELLED"],
        "DELIVERED": [],
        "CANCELLED": []
    }

    allowed = valid_transitions.get(shipment.status, [])
    if payload.status not in allowed:
        raise HTTPException(
            status_code=400,
            detail={
                "error_code": "INVALID_STATE_TRANSITION",
                "message": f"Rejected: invalid state transition from '{shipment.status}' to '{payload.status}'.",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "actionable_advice": f"Allowed next statuses for '{shipment.status}': {allowed}"
            }
        )

    shipment.status = payload.status
    shipment.current_sequence += 1
    now_iso = datetime.now(timezone.utc).isoformat()
    shipment.last_updated = now_iso
    db.commit()

    return {
        "shipment_id": shipment.shipment_id,
        "new_status": shipment.status,
        "current_sequence": shipment.current_sequence,
        "updated_at": now_iso
    }
