from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any

class ItemSpec(BaseModel):
    sku: str
    quantity: int = Field(..., gt=0, description="Quantity must be greater than 0")

class ShipmentCreateRequest(BaseModel):
    seller_id: str
    warehouse_id: str
    carrier_id: str
    origin: Optional[str] = "Bengaluru, KA, India"
    destination: str
    items: List[ItemSpec]

class ShipmentStatusUpdate(BaseModel):
    status: str = Field(..., description="Status must be one of: CREATED, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, CANCELLED")

class EventIngestRequest(BaseModel):
    event_id: str
    event_type: str
    entity_id: str
    timestamp: str
    source: str
    sequence_number: int
    payload: Optional[Dict[str, Any]] = None

class EventProcessingResponse(BaseModel):
    event_id: str
    status: str
    decision: str
    reason: str
    current_state: str
    is_duplicate: bool
    is_out_of_order: bool
    is_delayed: bool

class ErrorResponse(BaseModel):
    error_code: str
    message: str
    timestamp: str
    actionable_advice: str
    documentation_url: Optional[str] = "http://localhost:8000/docs"

class SimulatorFailureInjectionRequest(BaseModel):
    event_type: str = "PICKED_UP"
    entity_id: str = "SHP-0001"
    sequence_number: int = 2
    is_duplicate: bool = False
    is_out_of_order: bool = False
    is_delayed: bool = False
