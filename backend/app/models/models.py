from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class Seller(Base):
    __tablename__ = "sellers"

    seller_id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    tier = Column(String(20), default="Standard")
    api_key = Column(String(100), nullable=False, unique=True, index=True)
    status = Column(String(20), default="ACTIVE")
    created_at = Column(String(50))

class Warehouse(Base):
    __tablename__ = "warehouses"

    warehouse_id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    city = Column(String(50), nullable=False)
    capacity = Column(Integer, default=10000)
    current_occupancy = Column(Integer, default=5000)
    freshness_status = Column(String(20), default="FRESH", index=True)
    last_updated = Column(String(50))

class Carrier(Base):
    __tablename__ = "carriers"

    carrier_id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    contact_number = Column(String(50))
    active_vehicles = Column(Integer, default=50)
    freshness_status = Column(String(20), default="FRESH", index=True)
    last_updated = Column(String(50))

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sku = Column(String(50), index=True)
    warehouse_id = Column(String(50), ForeignKey("warehouses.warehouse_id"), index=True)
    quantity = Column(Integer, default=100)
    reorder_level = Column(Integer, default=20)
    freshness_status = Column(String(20), default="FRESH", index=True)
    last_updated = Column(String(50))

class Shipment(Base):
    __tablename__ = "shipments"

    shipment_id = Column(String(50), primary_key=True, index=True)
    seller_id = Column(String(50), ForeignKey("sellers.seller_id"), index=True)
    warehouse_id = Column(String(50), ForeignKey("warehouses.warehouse_id"), index=True)
    carrier_id = Column(String(50), ForeignKey("carriers.carrier_id"), index=True)
    origin = Column(String(100))
    destination = Column(String(100))
    status = Column(String(30), default="CREATED", index=True)
    current_sequence = Column(Integer, default=1)
    duplicate_event_count = Column(Integer, default=0)
    out_of_order_event_count = Column(Integer, default=0)
    delayed_event_count = Column(Integer, default=0)
    freshness_status = Column(String(20), default="FRESH", index=True)
    created_at = Column(String(50))
    last_updated = Column(String(50))

    events = relationship("ShipmentEvent", back_populates="shipment", cascade="all, delete-orphan")

class ShipmentEvent(Base):
    __tablename__ = "shipment_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(String(100), index=True)
    event_type = Column(String(50), nullable=False, index=True)
    entity_id = Column(String(50), ForeignKey("shipments.shipment_id"), index=True)
    timestamp = Column(String(50), nullable=False)
    received_at = Column(String(50), nullable=False)
    source = Column(String(50))
    sequence_number = Column(Integer, nullable=False)
    payload = Column(Text)
    status = Column(String(30), default="PROCESSED", index=True)
    decision = Column(String(50), default="STATE_MUTATED")
    reason = Column(Text)

    shipment = relationship("Shipment", back_populates="events")

class ApiRequest(Base):
    __tablename__ = "api_requests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    request_id = Column(String(100), unique=True, index=True)
    timestamp = Column(String(50))
    method = Column(String(10))
    endpoint = Column(String(200))
    status_code = Column(Integer)
    latency_ms = Column(Integer)
    seller_id = Column(String(50))
    error_code = Column(String(50))

class ApiError(Base):
    __tablename__ = "api_errors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    error_id = Column(String(100), unique=True, index=True)
    timestamp = Column(String(50))
    error_code = Column(String(50), index=True)
    endpoint = Column(String(200))
    method = Column(String(10))
    message = Column(Text)
    actionable_advice = Column(Text)
    seller_id = Column(String(50))

class RateLimitRule(Base):
    __tablename__ = "rate_limit_rules"

    tier = Column(String(20), primary_key=True)
    requests_per_minute = Column(Integer, default=100)
    burst_per_second = Column(Integer, default=20)
    concurrent_connections = Column(Integer, default=5)
