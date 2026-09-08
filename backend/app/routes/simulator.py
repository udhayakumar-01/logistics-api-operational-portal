from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

from app.database import get_db
from app.models.models import Shipment, ShipmentEvent, Warehouse, Carrier, ApiError
from app.schemas.schemas import EventIngestRequest, SimulatorFailureInjectionRequest
from app.services.event_processor import process_logistics_event
from app.services.rate_limiter import rate_limiter
from app.security.security import verify_api_key

router = APIRouter(prefix="/simulator", tags=["Failure Injection Simulator"])

@router.post("/inject-event")
def inject_simulator_event(
    req: SimulatorFailureInjectionRequest,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    now_dt = datetime.now(timezone.utc)
    
    # 1. Fetch initial shipment state
    shipment = db.query(Shipment).filter(Shipment.shipment_id == req.entity_id).first()
    before_state = shipment.status if shipment else "NOT_FOUND"
    before_seq = shipment.current_sequence if shipment else 0

    evt_id = f"SIM-EVT-{now_dt.strftime('%H%M%S')}"
    if req.is_duplicate:
        # Fetch existing event_id to duplicate
        last_evt = db.query(ShipmentEvent).filter(ShipmentEvent.entity_id == req.entity_id).first()
        if last_evt:
            evt_id = last_evt.event_id

    seq = req.sequence_number
    if req.is_out_of_order and shipment:
        seq = max(1, shipment.current_sequence - 1)

    t_str = now_dt.isoformat()
    if req.is_delayed:
        t_str = (now_dt - timedelta(minutes=10)).isoformat()

    event_payload = EventIngestRequest(
        event_id=evt_id,
        event_type=req.event_type,
        entity_id=req.entity_id,
        timestamp=t_str,
        source="FAILURE_INJECTION_PANEL",
        sequence_number=seq,
        payload={"injected_by": "FailureInjectionSimulator", "scenario": "Demonstration"}
    )

    processing_result = process_logistics_event(db, event_payload)

    # 2. Fetch after state
    db.refresh(shipment) if shipment else None
    after_state = shipment.status if shipment else "UNKNOWN"
    after_seq = shipment.current_sequence if shipment else 0

    return {
        "simulation_scenario": "DUPLICATE_EVENT" if req.is_duplicate else ("OUT_OF_ORDER_EVENT" if req.is_out_of_order else ("DELAYED_EVENT" if req.is_delayed else "NORMAL_EVENT")),
        "before_state": before_state,
        "before_sequence": before_seq,
        "injected_event": event_payload.dict(),
        "processing_response": processing_result.dict(),
        "after_state": after_state,
        "after_sequence": after_seq,
        "state_preserved": (before_state == after_state) if (req.is_duplicate or req.is_out_of_order) else True,
        "evidence_id": req.entity_id
    }

@router.post("/trigger-limit")
def trigger_rate_limit(
    api_key: str = Depends(verify_api_key)
):
    rate_limiter.trigger_simulator_breach(api_key)
    return {
        "status": "ARMED",
        "message": "Rate limit breach simulator armed. Your next API request will return HTTP 429 Too Many Requests.",
        "actionable_advice": "Execute any request in API Explorer to observe HTTP 429 with Retry-After header."
    }

@router.post("/reset-demo")
def reset_demo_data(
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_api_key)
):
    # Re-run seed logic dynamically
    from app.seed import seed_database_from_csv
    seed_database_from_csv(db)
    return {
        "status": "RESET_COMPLETE",
        "message": "Demo data successfully reloaded from synthetic CSV dataset.",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
