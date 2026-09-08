# Logistics API Portal - User Guide

## Quick Start Overview
The portal is designed to provide an interactive, operational view of the Logistics Marketplace APIs.

---

## 9-Step Partner Integration Workflow

### Step 1: Obtain API Credentials
Select your partner tier (`Standard` or `Premium`). Obtain your API Key (`demo-api-key-seller-001` or `demo-api-key-partner-admin`).

### Step 2: Test API Key Authentication
Navigate to **API Explorer**, choose `GET /api/v1/health`. Enter your `X-API-Key` header and click **Execute Request**. Verify `200 OK` response.

### Step 3: Check Operational Limits
Visit the **Rate Limits** page or execute `GET /api/v1/limits`. Review your tier's allowed request rate (100 req/min for Standard, 500 req/min for Premium) and payload size limit (1 MB).

### Step 4: Create a Test Shipment Order
In **API Explorer**, navigate to `POST /api/v1/shipments`. Use the pre-populated JSON payload:
```json
{
  "seller_id": "SELLER-001",
  "warehouse_id": "WH-001",
  "carrier_id": "CAR-001",
  "origin": "Bengaluru",
  "destination": "Chennai",
  "items": [{ "sku": "SKU-1001", "quantity": 2 }]
}
```
Click **Execute Request** and copy the returned `shipment_id` (e.g. `SHP-5001`).

### Step 5: Query Shipment Details & State
Execute `GET /api/v1/shipments/{shipment_id}` using your created shipment ID. Verify status is `CREATED`.

### Step 6: Ingest Status Event
Navigate to `POST /api/v1/events`. Ingest a `PICKED_UP` event with sequence number `2`:
```json
{
  "event_id": "EVT-TEST-001",
  "event_type": "PICKED_UP",
  "entity_id": "SHP-5001",
  "timestamp": "2026-09-08T09:50:00Z",
  "source": "CARRIER-SCANNER",
  "sequence_number": 2,
  "payload": { "location": "Bengaluru Warehouse Hub" }
}
```

### Step 7: Handle Duplicate Events (Idempotency)
Re-submit the exact same event JSON payload from Step 6. Notice the backend returns HTTP 202 with decision `IGNORED` and reason `"Duplicate event_id detected"`. The shipment status remains safely unchanged.

### Step 8: Observe Out-of-Order Handling
Submit an event with sequence number `1` (older than current sequence `2`). Observe decision `IGNORED` with sequence violation explanation.

### Step 9: Inspect Evidence Drill-Down
Navigate to **Evidence Viewer**, enter your shipment ID (`SHP-5001`), and review the complete operational event audit log, duplicate count, sequence progression, and freshness status.
