from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import json

from app.database import get_db
from app.models.models import Shipment, ShipmentEvent
from app.security.security import verify_api_key

router = APIRouter(prefix="/evidence", tags=["Evidence & Trace"])

@router.get("/{entity_id}")
def get_entity_evidence(
    entity_id: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    shipment = db.query(Shipment).filter(Shipment.shipment_id == entity_id).first()
    if not shipment:
        raise HTTPException(
            status_code=404,
            detail={
                "error_code": "RESOURCE_NOT_FOUND",
                "message": f"Shipment '{entity_id}' not found for evidence retrieval.",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "actionable_advice": "Check entity ID."
            }
        )

    events = db.query(ShipmentEvent).filter(ShipmentEvent.entity_id == entity_id).order_by(ShipmentEvent.id.asc()).all()

    formatted_events = []
    for e in events:
        try:
            p = json.loads(e.payload) if e.payload else {}
        except Exception:
            p = e.payload
        formatted_events.append({
            "event_id": e.event_id,
            "event_type": e.event_type,
            "timestamp": e.timestamp,
            "received_at": e.received_at,
            "sequence_number": e.sequence_number,
            "source": e.source,
            "status": e.status,
            "decision": e.decision,
            "reason": e.reason,
            "payload": p
        })

    return {
        "entity_id": shipment.shipment_id,
        "current_state": shipment.status,
        "current_sequence": shipment.current_sequence,
        "total_event_count": len(formatted_events),
        "duplicate_count": shipment.duplicate_event_count,
        "out_of_order_count": shipment.out_of_order_event_count,
        "delayed_count": shipment.delayed_event_count,
        "freshness_status": shipment.freshness_status,
        "last_updated": shipment.last_updated,
        "evidence_audit_trail": formatted_events
    }
