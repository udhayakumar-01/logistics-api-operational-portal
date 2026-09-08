from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import json

from app.database import get_db
from app.models.models import ShipmentEvent
from app.schemas.schemas import EventIngestRequest, EventProcessingResponse
from app.services.event_processor import process_logistics_event
from app.security.security import verify_api_key

router = APIRouter(prefix="/events", tags=["Events & Idempotency"])

@router.post("", response_model=EventProcessingResponse)
def ingest_event(
    payload: EventIngestRequest,
    response: Response,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    result = process_logistics_event(db, payload)
    if result.decision == "IGNORED":
        # 202 Accepted for ignored duplicates or out-of-order events
        response.status_code = status.HTTP_202_ACCEPTED
    elif result.decision == "REJECTED":
        response.status_code = status.HTTP_400_BAD_REQUEST
    else:
        response.status_code = status.HTTP_200_OK

    return result

@router.get("/{event_id}")
def get_event(
    event_id: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    evt = db.query(ShipmentEvent).filter(ShipmentEvent.event_id == event_id).first()
    if not evt:
        raise HTTPException(
            status_code=404,
            detail={
                "error_code": "RESOURCE_NOT_FOUND",
                "message": f"Event '{event_id}' not found.",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "actionable_advice": "Check event ID format (e.g., EVT-000001)."
            }
        )

    try:
        parsed_payload = json.loads(evt.payload) if evt.payload else {}
    except Exception:
        parsed_payload = evt.payload

    return {
        "event_id": evt.event_id,
        "event_type": evt.event_type,
        "entity_id": evt.entity_id,
        "timestamp": evt.timestamp,
        "received_at": evt.received_at,
        "source": evt.source,
        "sequence_number": evt.sequence_number,
        "payload": parsed_payload,
        "status": evt.status,
        "decision": evt.decision,
        "reason": evt.reason
    }
