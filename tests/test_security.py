def test_missing_api_key(client):
    res = client.get("/api/v1/shipments/SHP-0001")
    assert res.status_code == 401
    data = res.json()
    assert data["error_code"] == "MISSING_API_KEY"

def test_invalid_api_key(client):
    res = client.get("/api/v1/shipments/SHP-0001", headers={"X-API-Key": "invalid-key-xyz"})
    assert res.status_code == 401
    data = res.json()
    assert data["error_code"] == "INVALID_API_KEY"

def test_invalid_shipment_id_not_found(client, auth_headers):
    res = client.get("/api/v1/shipments/SHP-NONEXISTENT", headers=auth_headers)
    assert res.status_code == 404
    data = res.json()
    assert data["error_code"] == "RESOURCE_NOT_FOUND"
