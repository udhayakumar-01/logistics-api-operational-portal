def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data

def test_get_limits(client):
    response = client.get("/api/v1/limits")
    assert response.status_code == 200
    data = response.json()
    assert data["tier"] == "Standard"
    assert "X-RateLimit-Limit" in response.headers

def test_list_carriers(client, auth_headers):
    response = client.get("/api/v1/carriers", headers=auth_headers)
    assert response.status_code == 200
    carriers = response.json()
    assert isinstance(carriers, list)
    assert len(carriers) > 0

def test_list_warehouses(client, auth_headers):
    response = client.get("/api/v1/warehouses", headers=auth_headers)
    assert response.status_code == 200
    warehouses = response.json()
    assert isinstance(warehouses, list)
    assert len(warehouses) > 0

def test_get_inventory_sku(client, auth_headers):
    response = client.get("/api/v1/inventory/SKU-1001", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["sku"] == "SKU-1001"
    assert "total_quantity" in data

def test_create_and_get_shipment(client, auth_headers):
    payload = {
        "seller_id": "SELLER-001",
        "warehouse_id": "WH-001",
        "carrier_id": "CAR-001",
        "destination": "Chennai",
        "items": [{"sku": "SKU-1001", "quantity": 2}]
    }
    res_create = client.post("/api/v1/shipments", json=payload, headers=auth_headers)
    assert res_create.status_code == 201
    shipment_id = res_create.json()["shipment_id"]
    
    res_get = client.get(f"/api/v1/shipments/{shipment_id}", headers=auth_headers)
    assert res_get.status_code == 200
    assert res_get.json()["status"] == "CREATED"
