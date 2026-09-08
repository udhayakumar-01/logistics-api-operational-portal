def test_normal_event_ingestion(client, auth_headers):
    # First create a new shipment at sequence 1
    create_res = client.post("/api/v1/shipments", json={
        "seller_id": "SELLER-001",
        "warehouse_id": "WH-001",
        "carrier_id": "CAR-001",
        "destination": "Hyderabad",
        "items": [{"sku": "SKU-1001", "quantity": 1}]
    }, headers=auth_headers)
    assert create_res.status_code == 201
    shp_id = create_res.json()["shipment_id"]

    payload = {
        "event_id": f"EVT-TEST-NORM-{shp_id}",
        "event_type": "PICKED_UP",
        "entity_id": shp_id,
        "timestamp": "2026-09-08T09:40:00Z",
        "source": "CARRIER-APP",
        "sequence_number": 2,
        "payload": {"location": "Bengaluru"}
    }
    res = client.post("/api/v1/events", json=payload, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["decision"] == "STATE_MUTATED"
    assert data["current_state"] == "PICKED_UP"

def test_duplicate_event_handling(client, auth_headers):
    # Create fresh shipment
    create_res = client.post("/api/v1/shipments", json={
        "seller_id": "SELLER-002",
        "warehouse_id": "WH-002",
        "carrier_id": "CAR-002",
        "destination": "Pune",
        "items": [{"sku": "SKU-1002", "quantity": 1}]
    }, headers=auth_headers)
    shp_id = create_res.json()["shipment_id"]

    # Ingest event EVT-DUP-TEST twice
    payload = {
        "event_id": f"EVT-DUP-TEST-{shp_id}",
        "event_type": "PICKED_UP",
        "entity_id": shp_id,
        "timestamp": "2026-09-08T09:45:00Z",
        "source": "HUB-SCANNER",
        "sequence_number": 2,
        "payload": {"hub": "Hub-1"}
    }
    res1 = client.post("/api/v1/events", json=payload, headers=auth_headers)
    assert res1.status_code == 200
    assert res1.json()["decision"] == "STATE_MUTATED"

    # Exact duplicate event_id re-sent
    res2 = client.post("/api/v1/events", json=payload, headers=auth_headers)
    assert res2.status_code == 202
    data2 = res2.json()
    assert data2["is_duplicate"] is True
    assert data2["decision"] == "IGNORED"

def test_out_of_order_event_handling(client, auth_headers):
    # Create fresh shipment
    create_res = client.post("/api/v1/shipments", json={
        "seller_id": "SELLER-003",
        "warehouse_id": "WH-003",
        "carrier_id": "CAR-003",
        "destination": "Delhi",
        "items": [{"sku": "SKU-1003", "quantity": 1}]
    }, headers=auth_headers)
    shp_id = create_res.json()["shipment_id"]

    # Mutate to sequence 2
    client.post("/api/v1/events", json={
        "event_id": f"EVT-SEQ2-{shp_id}",
        "event_type": "PICKED_UP",
        "entity_id": shp_id,
        "timestamp": "2026-09-08T09:40:00Z",
        "source": "CARRIER",
        "sequence_number": 2
    }, headers=auth_headers)

    # Now ingest event with sequence_number 1 (older than current sequence 2)
    payload = {
        "event_id": f"EVT-OOO-TEST-{shp_id}",
        "event_type": "PICKED_UP",
        "entity_id": shp_id,
        "timestamp": "2026-09-08T09:30:00Z",
        "source": "OLD-SCANNER",
        "sequence_number": 1,
        "payload": {"hub": "Old-Hub"}
    }
    res = client.post("/api/v1/events", json=payload, headers=auth_headers)
    assert res.status_code == 202
    data = res.json()
    assert data["is_out_of_order"] is True
    assert data["decision"] == "IGNORED"

def test_evidence_drilldown(client, auth_headers):
    res = client.get("/api/v1/evidence/SHP-0002", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["entity_id"] == "SHP-0002"
    assert "evidence_audit_trail" in data
    assert len(data["evidence_audit_trail"]) > 0
