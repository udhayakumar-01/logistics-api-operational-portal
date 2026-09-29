def test_list_shipments_with_filters(client, auth_headers):
    # Test listing shipments
    response = client.get("/api/v1/shipments", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    assert isinstance(data["items"], list)

    # Filter by status
    response_filtered = client.get("/api/v1/shipments?status=CREATED", headers=auth_headers)
    assert response_filtered.status_code == 200
    for item in response_filtered.json()["items"]:
        assert item["status"] == "CREATED"

def test_shipment_state_transitions(client, auth_headers):
    # Create shipment
    payload = {
        "seller_id": "SELLER-001",
        "warehouse_id": "WH-001",
        "carrier_id": "CAR-001",
        "destination": "Bengaluru",
        "items": [{"sku": "SKU-1001", "quantity": 1}]
    }
    res_create = client.post("/api/v1/shipments", json=payload, headers=auth_headers)
    assert res_create.status_code == 201
    shp_id = res_create.json()["shipment_id"]

    # Valid transition to PICKED_UP
    res_valid = client.patch(f"/api/v1/shipments/{shp_id}/status", json={"status": "PICKED_UP"}, headers=auth_headers)
    assert res_valid.status_code == 200
    assert res_valid.json()["new_status"] == "PICKED_UP"

    # Invalid transition (PICKED_UP directly to DELIVERED)
    res_invalid = client.patch(f"/api/v1/shipments/{shp_id}/status", json={"status": "DELIVERED"}, headers=auth_headers)
    assert res_invalid.status_code == 400
    err_data = res_invalid.json()
    assert err_data["error_code"] == "INVALID_STATE_TRANSITION"

def test_freshness_endpoint(client):
    response = client.get("/api/v1/freshness")
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "by_category" in data
    assert "entities" in data

def test_simulator_inject_event(client, auth_headers):
    payload = {
        "entity_id": "SHP-0001",
        "is_duplicate": True,
        "event_type": "PICKED_UP",
        "sequence_number": 2
    }
    response = client.post("/api/v1/simulator/inject-event", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["simulation_scenario"] == "DUPLICATE_EVENT"
    assert "processing_response" in data

def test_simulator_trigger_limit(client, auth_headers):
    response = client.post("/api/v1/simulator/trigger-limit", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "ARMED"
