import csv
import json
import os
import random
from datetime import datetime, timedelta, timezone

# Target directory
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
os.makedirs(DATA_DIR, exist_ok=True)

# Fixed seed for reproducibility
RANDOM_SEED = 42
random.seed(RANDOM_SEED)

# Reference constants
CITIES = ["Bengaluru", "Mumbai", "Delhi", "Chennai", "Hyderabad", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat"]
STATUSES = ["CREATED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]
EVENT_TYPES = ["SHIPMENT_CREATED", "PICKED_UP", "ARRIVED_WAREHOUSE", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]
ERROR_CODES = ["MISSING_API_KEY", "INVALID_API_KEY", "RATE_LIMIT_EXCEEDED", "VALIDATION_ERROR", "RESOURCE_NOT_FOUND", "INVALID_STATE_TRANSITION", "PAYLOAD_TOO_LARGE"]
TIERS = ["Standard", "Premium", "Enterprise"]

def generate_sellers(count=500):
    sellers = []
    for i in range(1, count + 1):
        seller_id = f"SELLER-{i:03d}"
        name = f"LogiMerchant_{i}"
        email = f"contact@seller{i}.logistics.domain"
        tier = random.choice(TIERS)
        api_key = f"key-seller-{i:03d}-secret"
        created_at = (datetime(2026, 1, 1, tzinfo=timezone.utc) + timedelta(days=random.randint(0, 180))).isoformat()
        sellers.append({
            "seller_id": seller_id,
            "name": name,
            "email": email,
            "tier": tier,
            "api_key": api_key,
            "created_at": created_at,
            "status": "ACTIVE"
        })
    return sellers

def generate_warehouses(count=50):
    warehouses = []
    for i in range(1, count + 1):
        wh_id = f"WH-{i:03d}"
        city = random.choice(CITIES)
        name = f"{city} Fulfillment Hub #{i}"
        capacity = random.randint(5000, 50000)
        # 10% stale, 5% missing
        freshness_rand = random.random()
        if freshness_rand < 0.85:
            last_updated = (datetime.now(timezone.utc) - timedelta(seconds=random.randint(10, 90))).isoformat()
            freshness_status = "FRESH"
        elif freshness_rand < 0.95:
            last_updated = (datetime.now(timezone.utc) - timedelta(minutes=random.randint(5, 14))).isoformat()
            freshness_status = "STALE"
        else:
            last_updated = (datetime.now(timezone.utc) - timedelta(hours=random.randint(2, 24))).isoformat()
            freshness_status = "MISSING"

        warehouses.append({
            "warehouse_id": wh_id,
            "name": name,
            "city": city,
            "capacity": capacity,
            "current_occupancy": random.randint(1000, capacity),
            "freshness_status": freshness_status,
            "last_updated": last_updated
        })
    return warehouses

def generate_carriers(count=100):
    carriers = []
    for i in range(1, count + 1):
        carrier_id = f"CAR-{i:03d}"
        name = f"CarrierExpress_{i}"
        contact_number = f"+91-98765{i:05d}"
        freshness_rand = random.random()
        if freshness_rand < 0.85:
            last_updated = (datetime.now(timezone.utc) - timedelta(seconds=random.randint(15, 100))).isoformat()
            freshness_status = "FRESH"
        elif freshness_rand < 0.95:
            last_updated = (datetime.now(timezone.utc) - timedelta(minutes=random.randint(6, 12))).isoformat()
            freshness_status = "STALE"
        else:
            last_updated = (datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 10))).isoformat()
            freshness_status = "MISSING"

        carriers.append({
            "carrier_id": carrier_id,
            "name": name,
            "contact_number": contact_number,
            "active_vehicles": random.randint(10, 200),
            "freshness_status": freshness_status,
            "last_updated": last_updated
        })
    return carriers

def generate_inventory(count=1000, warehouses=None):
    inventory = []
    wh_ids = [w["warehouse_id"] for w in warehouses] if warehouses else [f"WH-{i:03d}" for i in range(1, 51)]
    for i in range(1, count + 1):
        sku = f"SKU-{1000 + i}"
        wh_id = random.choice(wh_ids)
        qty = random.randint(0, 500)
        reorder_level = random.randint(10, 50)
        freshness_rand = random.random()
        if freshness_rand < 0.9:
            last_updated = (datetime.now(timezone.utc) - timedelta(seconds=random.randint(5, 110))).isoformat()
            freshness_status = "FRESH"
        elif freshness_rand < 0.97:
            last_updated = (datetime.now(timezone.utc) - timedelta(minutes=random.randint(3, 14))).isoformat()
            freshness_status = "STALE"
        else:
            last_updated = (datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 8))).isoformat()
            freshness_status = "MISSING"

        inventory.append({
            "sku": sku,
            "warehouse_id": wh_id,
            "quantity": qty,
            "reorder_level": reorder_level,
            "freshness_status": freshness_status,
            "last_updated": last_updated
        })
    return inventory

def generate_shipments_and_events(shipment_count=5000, sellers=None, warehouses=None, carriers=None):
    shipments = []
    events = []
    
    seller_ids = [s["seller_id"] for s in sellers]
    wh_ids = [w["warehouse_id"] for w in warehouses]
    carrier_ids = [c["carrier_id"] for c in carriers]
    
    base_time = datetime(2026, 9, 1, 0, 0, 0, tzinfo=timezone.utc)
    event_counter = 1
    
    for i in range(1, shipment_count + 1):
        shipment_id = f"SHP-{i:04d}"
        seller_id = random.choice(seller_ids)
        wh_id = random.choice(wh_ids)
        carrier_id = random.choice(carrier_ids)
        origin = random.choice(CITIES)
        dest = random.choice([c for c in CITIES if c != origin])
        
        # Progression step: 0 to 4
        # 0: CREATED, 1: PICKED_UP, 2: IN_TRANSIT, 3: OUT_FOR_DELIVERY, 4: DELIVERED
        stage = random.choices([0, 1, 2, 3, 4, -1], weights=[15, 20, 30, 15, 18, 2])[0]
        final_status = "CANCELLED" if stage == -1 else STATUSES[stage]
        
        shipment_created_at = base_time + timedelta(minutes=random.randint(0, 10000))
        
        dup_count = 0
        ooo_count = 0
        delayed_count = 0
        
        # Sequence counter
        seq = 1
        
        # 1. SHIPMENT_CREATED event
        evt_id = f"EVT-{event_counter:06d}"
        event_counter += 1
        t1 = shipment_created_at
        r1 = t1 + timedelta(seconds=random.randint(1, 10))
        events.append({
            "event_id": evt_id,
            "event_type": "SHIPMENT_CREATED",
            "entity_id": shipment_id,
            "timestamp": t1.isoformat(),
            "received_at": r1.isoformat(),
            "source": "SELLER_PORTAL",
            "sequence_number": seq,
            "payload": json.dumps({"origin": origin, "destination": dest}),
            "status": "PROCESSED",
            "decision": "STATE_MUTATED",
            "reason": "Initial creation"
        })
        
        curr_time = t1
        if stage >= 1 or stage == -1:
            seq += 1
            evt_id = f"EVT-{event_counter:06d}"
            event_counter += 1
            curr_time += timedelta(minutes=random.randint(30, 180))
            is_delayed = random.random() < 0.05
            recv_delay = random.randint(120, 600) if is_delayed else random.randint(1, 15)
            r2 = curr_time + timedelta(seconds=recv_delay)
            if is_delayed: delayed_count += 1
            events.append({
                "event_id": evt_id,
                "event_type": "PICKED_UP",
                "entity_id": shipment_id,
                "timestamp": curr_time.isoformat(),
                "received_at": r2.isoformat(),
                "source": "CARRIER_APP",
                "sequence_number": seq,
                "payload": json.dumps({"carrier_id": carrier_id, "vehicle_id": f"TRK-{random.randint(100,999)}"}),
                "status": "PROCESSED" if not is_delayed else "PROCESSED_DELAYED",
                "decision": "STATE_MUTATED",
                "reason": "Valid transition to PICKED_UP"
            })
            
            # Inject random duplicate for demonstration in ~3% of shipments
            if random.random() < 0.03:
                dup_count += 1
                dup_evt_id = f"EVT-DUP-{event_counter:06d}"
                event_counter += 1
                events.append({
                    "event_id": evt_id,  # Same event_id for duplicate
                    "event_type": "PICKED_UP",
                    "entity_id": shipment_id,
                    "timestamp": curr_time.isoformat(),
                    "received_at": (r2 + timedelta(seconds=12)).isoformat(),
                    "source": "CARRIER_APP_RETRY",
                    "sequence_number": seq,
                    "payload": json.dumps({"carrier_id": carrier_id}),
                    "status": "ACCEPTED_NO_MUTATION",
                    "decision": "IGNORED",
                    "reason": "Duplicate event_id detected"
                })

        if stage >= 2:
            seq += 1
            evt_id = f"EVT-{event_counter:06d}"
            event_counter += 1
            curr_time += timedelta(minutes=random.randint(60, 360))
            r3 = curr_time + timedelta(seconds=random.randint(2, 20))
            events.append({
                "event_id": evt_id,
                "event_type": "IN_TRANSIT",
                "entity_id": shipment_id,
                "timestamp": curr_time.isoformat(),
                "received_at": r3.isoformat(),
                "source": "HUB_SCANNER",
                "sequence_number": seq,
                "payload": json.dumps({"location": f"Transit Hub {random.choice(CITIES)}"}),
                "status": "PROCESSED",
                "decision": "STATE_MUTATED",
                "reason": "Valid transition to IN_TRANSIT"
            })
            
            # Inject random out-of-order event (~2% chance)
            if random.random() < 0.02:
                ooo_count += 1
                events.append({
                    "event_id": f"EVT-OOO-{event_counter:06d}",
                    "event_type": "PICKED_UP",
                    "entity_id": shipment_id,
                    "timestamp": (curr_time - timedelta(minutes=40)).isoformat(),
                    "received_at": (r3 + timedelta(seconds=30)).isoformat(),
                    "source": "DELAYED_SCANNER",
                    "sequence_number": seq - 1, # Older sequence
                    "payload": json.dumps({"location": "Stale scan"}),
                    "status": "ACCEPTED_NO_MUTATION",
                    "decision": "IGNORED",
                    "reason": f"Sequence number ({seq-1}) older than current state sequence ({seq})"
                })
                event_counter += 1

        if stage >= 3:
            seq += 1
            evt_id = f"EVT-{event_counter:06d}"
            event_counter += 1
            curr_time += timedelta(minutes=random.randint(60, 240))
            r4 = curr_time + timedelta(seconds=random.randint(2, 10))
            events.append({
                "event_id": evt_id,
                "event_type": "OUT_FOR_DELIVERY",
                "entity_id": shipment_id,
                "timestamp": curr_time.isoformat(),
                "received_at": r4.isoformat(),
                "source": "DRIVER_MOBILE",
                "sequence_number": seq,
                "payload": json.dumps({"driver": f"Driver_{random.randint(1,50)}"}),
                "status": "PROCESSED",
                "decision": "STATE_MUTATED",
                "reason": "Valid transition to OUT_FOR_DELIVERY"
            })

        if stage >= 4:
            seq += 1
            evt_id = f"EVT-{event_counter:06d}"
            event_counter += 1
            curr_time += timedelta(minutes=random.randint(20, 120))
            r5 = curr_time + timedelta(seconds=random.randint(1, 10))
            events.append({
                "event_id": evt_id,
                "event_type": "DELIVERED",
                "entity_id": shipment_id,
                "timestamp": curr_time.isoformat(),
                "received_at": r5.isoformat(),
                "source": "DRIVER_MOBILE",
                "sequence_number": seq,
                "payload": json.dumps({"signed_by": "Recipient"}),
                "status": "PROCESSED",
                "decision": "STATE_MUTATED",
                "reason": "Valid transition to DELIVERED"
            })

        freshness_status = "FRESH"
        if (datetime.now(timezone.utc) - curr_time).total_seconds() > 900:
            freshness_status = "STALE"

        shipments.append({
            "shipment_id": shipment_id,
            "seller_id": seller_id,
            "warehouse_id": wh_id,
            "carrier_id": carrier_id,
            "origin": origin,
            "destination": dest,
            "status": final_status,
            "current_sequence": seq,
            "duplicate_event_count": dup_count,
            "out_of_order_event_count": ooo_count,
            "delayed_event_count": delayed_count,
            "freshness_status": freshness_status,
            "created_at": shipment_created_at.isoformat(),
            "last_updated": curr_time.isoformat()
        })
        
    return shipments, events

def generate_api_requests_and_errors(request_count=2000, error_count=500):
    requests = []
    errors = []
    
    base_time = datetime.now(timezone.utc) - timedelta(days=7)
    endpoints = [
        ("POST", "/api/v1/shipments"),
        ("GET", "/api/v1/shipments/SHP-0001"),
        ("PATCH", "/api/v1/shipments/SHP-0001/status"),
        ("GET", "/api/v1/carriers"),
        ("GET", "/api/v1/warehouses"),
        ("GET", "/api/v1/inventory/SKU-1001"),
        ("POST", "/api/v1/events"),
        ("GET", "/api/v1/health"),
        ("GET", "/api/v1/limits")
    ]
    
    # Generate requests
    for i in range(1, request_count + 1):
        req_id = f"REQ-{i:06d}"
        method, endpoint = random.choice(endpoints)
        t = base_time + timedelta(seconds=random.randint(0, 604800))
        latency = random.randint(12, 350)
        
        # 85% success, 15% error
        is_error = random.random() < 0.15
        if not is_error:
            status_code = 200 if method in ["GET", "PATCH"] else 201
            err_code = ""
        else:
            status_code = random.choice([400, 401, 403, 404, 422, 429, 500])
            if status_code == 401: err_code = "MISSING_API_KEY"
            elif status_code == 429: err_code = "RATE_LIMIT_EXCEEDED"
            elif status_code == 422: err_code = "VALIDATION_ERROR"
            elif status_code == 404: err_code = "RESOURCE_NOT_FOUND"
            elif status_code == 400: err_code = "INVALID_STATE_TRANSITION"
            else: err_code = "INTERNAL_SERVER_ERROR"

        seller_id = f"SELLER-{random.randint(1, 500):03d}"
        requests.append({
            "request_id": req_id,
            "timestamp": t.isoformat(),
            "method": method,
            "endpoint": endpoint,
            "status_code": status_code,
            "latency_ms": latency,
            "seller_id": seller_id,
            "error_code": err_code
        })

    # Generate additional explicit API error logs (totaling error_count)
    for i in range(1, error_count + 1):
        err_id = f"ERR-{i:05d}"
        err_code = random.choice(ERROR_CODES)
        method, endpoint = random.choice(endpoints)
        t = base_time + timedelta(seconds=random.randint(0, 604800))
        
        advice_map = {
            "MISSING_API_KEY": "Provide a valid X-API-Key header in all HTTP requests.",
            "INVALID_API_KEY": "Verify your API Key credentials in the Partner Portal.",
            "RATE_LIMIT_EXCEEDED": "Wait for Retry-After seconds. Exponential backoff recommended.",
            "VALIDATION_ERROR": "Inspect field requirements in OpenAPI spec schema.",
            "RESOURCE_NOT_FOUND": "Check resource ID exists via GET endpoint before modifying.",
            "INVALID_STATE_TRANSITION": "Follow state machine flow: CREATED -> PICKED_UP -> IN_TRANSIT -> OUT_FOR_DELIVERY -> DELIVERED.",
            "PAYLOAD_TOO_LARGE": "Keep request payload body under 1MB."
        }
        
        errors.append({
            "error_id": err_id,
            "timestamp": t.isoformat(),
            "error_code": err_code,
            "endpoint": endpoint,
            "method": method,
            "message": f"Operational failure: {err_code} encountered during {method} {endpoint}",
            "actionable_advice": advice_map.get(err_code, "Check operational logs for details."),
            "seller_id": f"SELLER-{random.randint(1, 500):03d}"
        })

    return requests, errors

def generate_rate_limits():
    limits = [
        {"tier": "Standard", "requests_per_minute": 100, "burst_per_second": 20, "concurrent_connections": 5},
        {"tier": "Premium", "requests_per_minute": 500, "burst_per_second": 50, "concurrent_connections": 25},
        {"tier": "Enterprise", "requests_per_minute": 2000, "burst_per_second": 200, "concurrent_connections": 100}
    ]
    return limits

def main():
    print(f"Generating synthetic dataset using fixed random seed {RANDOM_SEED}...")
    
    sellers = generate_sellers(500)
    warehouses = generate_warehouses(50)
    carriers = generate_carriers(100)
    inventory = generate_inventory(1000, warehouses)
    shipments, events = generate_shipments_and_events(5000, sellers, warehouses, carriers)
    requests, errors = generate_api_requests_and_errors(2000, 500)
    rate_limits = generate_rate_limits()

    datasets = {
        "sellers.csv": sellers,
        "warehouses.csv": warehouses,
        "carriers.csv": carriers,
        "inventory.csv": inventory,
        "shipments.csv": shipments,
        "shipment_events.csv": events,
        "api_requests.csv": requests,
        "api_errors.csv": errors,
        "rate_limits.csv": rate_limits
    }

    for filename, rows in datasets.items():
        filepath = os.path.join(DATA_DIR, filename)
        if not rows:
            continue
        fieldnames = list(rows[0].keys())
        with open(filepath, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        print(f"  [+] Saved {len(rows)} records to {filename}")

    print("Synthetic dataset generation complete!")

if __name__ == "__main__":
    main()
