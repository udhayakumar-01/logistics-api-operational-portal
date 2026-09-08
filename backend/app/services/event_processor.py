import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.models import Shipment, ShipmentEvent
from app.schemas.schemas import EventIngestRequest, EventProcessingResponse

VALID_TRANSITIONS = {
    "CREATED": ["PICKED_UP", "ARRIVED_WAREHOUSE", "CANCELLED"],
    "PICKED_UP": ["IN_TRANSIT", "ARRIVED_WAREHOUSE", "CANCELLED"],
    "ARRIVED_WAREHOUSE": ["IN_TRANSIT", "CANCELLED"],
    "IN_TRANSIT": ["OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
    "OUT_FOR_DELIVERY": ["DELIVERED", "CANCELLED"],
    "DELIVERED": [],
    "CANCELLED": []
}

EVENT_TYPE_TO_STATUS = {
    "SHIPMENT_CREATED": "CREATED",
    "PICKED_UP": "PICKED_UP",
    "ARRIVED_WAREHOUSE": "IN_TRANSIT",
    "IN_TRANSIT": "IN_TRANSIT",
    "OUT_FOR_DELIVERY": "OUT_FOR_DELIVERY",
    "DELIVERED": "DELIVERED",
    "CANCELLED": "CANCELLED"
}

def process_logistics_event(db: Session, event_data: EventIngestRequest) -> EventProcessingResponse:
    now_iso = datetime.now(timezone.utc).isoformat()
    received_at = now_iso
    
    # 1. Fetch target shipment
    shipment = db.query(Shipment).filter(Shipment.shipment_id == event_data.entity_id).first()
    if not shipment:
        # Create auto shipment if missing in demo context
        shipment = Shipment(
            shipment_id=event_data.entity_id,
            seller_id="SELLER-001",
            warehouse_id="WH-001",
            carrier_id="CAR-001",
            origin="Bengaluru",
            destination="Chennai",
            status="CREATED",
            current_sequence=1,
            created_at=now_iso,
            last_updated=now_iso
        )
        db.add(shipment)
        db.flush()

    # 2. Check Idempotency (Duplicate event_id)
    existing_evt = db.query(ShipmentEvent).filter(ShipmentEvent.event_id == event_data.event_id).first()
    if existing_evt:
        shipment.duplicate_event_count += 1
        dup_event_record = ShipmentEvent(
            event_id=f"{event_data.event_id}_DUP_{shipment.duplicate_event_count}",
            event_type=event_data.event_type,
            entity_id=event_data.entity_id,
            timestamp=event_data.timestamp,
            received_at=received_at,
            source=f"{event_data.source}_RETRY",
            sequence_number=event_data.sequence_number,
            payload=json.dumps(event_data.payload or {}),
            status="ACCEPTED_NO_MUTATION",
            decision="IGNORED",
            reason=f"Duplicate event_id ({event_data.event_id}) detected."
        )
        db.add(dup_event_record)
        db.commit()
        
        return EventProcessingResponse(
            event_id=event_data.event_id,
            status="ACCEPTED_NO_MUTATION",
            decision="IGNORED",
            reason="Duplicate event_id detected. State mutation safely skipped.",
            current_state=shipment.status,
            is_duplicate=True,
            is_out_of_order=False,
            is_delayed=False
        )

    # 3. Check Out-of-Order (sequence_number <= current_sequence)
    is_out_of_order = event_data.sequence_number <= shipment.current_sequence
    if is_out_of_order:
        shipment.out_of_order_event_count += 1
        ooo_record = ShipmentEvent(
            event_id=event_data.event_id,
            event_type=event_data.event_type,
            entity_id=event_data.entity_id,
            timestamp=event_data.timestamp,
            received_at=received_at,
            source=event_data.source,
            sequence_number=event_data.sequence_number,
            payload=json.dumps(event_data.payload or {}),
            status="ACCEPTED_NO_MUTATION",
            decision="IGNORED",
            reason=f"Sequence number ({event_data.sequence_number}) is older/equal to current state sequence ({shipment.current_sequence})."
        )
        db.add(ooo_record)
        db.commit()
        
        return EventProcessingResponse(
            event_id=event_data.event_id,
            status="ACCEPTED_NO_MUTATION",
            decision="IGNORED",
            reason=f"Sequence number ({event_data.sequence_number}) is older/equal to current state sequence ({shipment.current_sequence}).",
            current_state=shipment.status,
            is_duplicate=False,
            is_out_of_order=True,
            is_delayed=False
        )

    # 4. Check Delay (received_at - timestamp > 60s)
    is_delayed = False
    try:
        t_sent = datetime.fromisoformat(event_data.timestamp.replace("Z", "+00:00"))
        t_recv = datetime.fromisoformat(received_at.replace("Z", "+00:00"))
        if (t_recv - t_sent).total_seconds() > 60:
            is_delayed = True
    except Exception:
        pass

    if is_delayed:
        shipment.delayed_event_count += 1

    # 5. Check State Machine Validity
    target_status = EVENT_TYPE_TO_STATUS.get(event_data.event_type, shipment.status)
    valid_moves = VALID_TRANSITIONS.get(shipment.status, [])
    
    if target_status not in valid_moves and target_status != shipment.status:
        # Invalid state transition rejected
        inv_record = ShipmentEvent(
            event_id=event_data.event_id,
            event_type=event_data.event_type,
            entity_id=event_data.entity_id,
            timestamp=event_data.timestamp,
            received_at=received_at,
            source=event_data.source,
            sequence_number=event_data.sequence_number,
            payload=json.dumps(event_data.payload or {}),
            status="REJECTED",
            decision="REJECTED_INVALID_TRANSITION",
            reason=f"Invalid state transition from {shipment.status} to {target_status}."
        )
        db.add(inv_record)
        db.commit()
        
        return EventProcessingResponse(
            event_id=event_data.event_id,
            status="REJECTED",
            decision="REJECTED",
            reason=f"Invalid state transition from {shipment.status} to {target_status}.",
            current_state=shipment.status,
            is_duplicate=False,
            is_out_of_order=False,
            is_delayed=is_delayed
        )

    # 6. Valid State Mutation
    shipment.status = target_status
    shipment.current_sequence = event_data.sequence_number
    shipment.last_updated = received_at
    
    event_status = "PROCESSED_DELAYED" if is_delayed else "PROCESSED"
    evt_record = ShipmentEvent(
        event_id=event_data.event_id,
        event_type=event_data.event_type,
        entity_id=event_data.entity_id,
        timestamp=event_data.timestamp,
        received_at=received_at,
        source=event_data.source,
        sequence_number=event_data.sequence_number,
        payload=json.dumps(event_data.payload or {}),
        status=event_status,
        decision="STATE_MUTATED",
        reason=f"Valid state transition to {target_status}."
    )
    db.add(evt_record)
    db.commit()

    return EventProcessingResponse(
        event_id=event_data.event_id,
        status=event_status,
        decision="STATE_MUTATED",
        reason=f"State updated to {target_status}.",
        current_state=shipment.status,
        is_duplicate=False,
        is_out_of_order=False,
        is_delayed=is_delayed
    )
