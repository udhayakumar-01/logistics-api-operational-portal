# Logistics API Operational Documentation & Integration Readiness Portal

> A full-stack operational API documentation portal addressing the core logistics marketplace integration problem:
> **"API consumers cannot understand real operational limits, failure behavior, event consistency, and integration requirements from static API documentation."**

---

## 1. System Architecture

```
OpenAPI 3.0 Spec -> Rate Limiter & Auth Guard -> State Machine Validator -> Event Idempotency Engine
                                                                                   |
                                                                                   v
                                                                     Evidence Audit Store & Telemetry
                                                                                   |
                                                                                   v
                                                                   11-Tab Interactive Web Dashboard
```

---

## 2. Comprehensive Database Schema Reference

| Table Name | Primary Key | Key Columns & Indexes | Description & Foreign Keys |
| :--- | :--- | :--- | :--- |
| `sellers` | `seller_id` | `api_key` *(indexed, unique)*, `status`, `tier` | Marketplace seller accounts and authentication credentials. |
| `warehouses` | `warehouse_id` | `freshness_status` *(indexed)*, `city`, `capacity` | Warehouse fulfillment hubs with occupancy and data freshness tracking. |
| `carriers` | `carrier_id` | `freshness_status` *(indexed)*, `active_vehicles` | Logistics freight and parcel carrier partners. |
| `inventory` | `id` | `sku` *(indexed)*, `warehouse_id` *(FK)*, `freshness_status` *(indexed)* | Inventory stock levels per warehouse. FK: `warehouses.warehouse_id`. |
| `shipments` | `shipment_id` | `status` *(indexed)*, `seller_id` *(FK)*, `warehouse_id` *(FK)*, `carrier_id` *(FK)*, `freshness_status` *(indexed)* | Primary shipment orders. Tracks sequence counter, duplicate event count, out-of-order count, and state machine status. |
| `shipment_events` | `id` | `event_id` *(indexed)*, `entity_id` *(FK)*, `event_type` *(indexed)*, `status` *(indexed)* | Idempotent logistics status events log. Stores sequence numbers, payload JSON, decision (`STATE_MUTATED` vs `DEDUPLICATED_IGNORED`), and reason. |
| `api_requests` | `id` | `request_id` *(indexed)*, `endpoint`, `status_code`, `latency_ms` | Request telemetry log for latency and throughput metrics. |
| `api_errors` | `id` | `error_id` *(indexed)*, `error_code` *(indexed)*, `endpoint` | Security and validation failure log for misuse analysis. |
| `rate_limit_rules` | `tier` | `requests_per_minute`, `burst_per_second`, `concurrent_connections` | Rate limit tier quotas (Standard, Premium, Enterprise). |

---

## 3. Complete API Endpoints Documentation

| HTTP Method | Endpoint Path | Auth Required | Request Body / Parameters | Response Status & Schema | Description |
| :---: | :--- | :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/health` | No | None | `200 OK`: Status, DB state, latency metrics | Health check and telemetry metrics. |
| `GET` | `/api/v1/limits` | No | None | `200 OK`: Rate limit tier rules | Fetches operational rate limit rules. |
| `GET` | `/api/v1/freshness` | No | `entity_type`, `status` | `200 OK`: Freshness SLA counts & items | Returns data age metrics (`FRESH`, `STALE`, `MISSING`). |
| `GET` | `/api/v1/shipments` | Yes (`X-API-Key`) | `search`, `status`, `seller_id`, `carrier_id`, `warehouse_id`, `limit`, `offset` | `200 OK`: `{ total, items: [...] }` | Queries shipments with search and multi-field filters. |
| `POST` | `/api/v1/shipments` | Yes (`X-API-Key`) | `{ seller_id, warehouse_id, carrier_id, destination, items }` | `201 Created`: Shipment object | Creates new shipment order in `CREATED` status. |
| `GET` | `/api/v1/shipments/{id}` | Yes (`X-API-Key`) | Path: `id` | `200 OK`: Shipment details / `404` | Fetches single shipment state and sequence count. |
| `PATCH` | `/api/v1/shipments/{id}/status` | Yes (`X-API-Key`) | `{ status }` | `200 OK` / `400 Invalid State` | Updates shipment status guarded by state machine rules. |
| `POST` | `/api/v1/events` | Yes (`X-API-Key`) | `{ event_id, event_type, entity_id, sequence_number, timestamp, payload }` | `200 OK`: Ingestion result | Ingests idempotent logistics status event. |
| `GET` | `/api/v1/evidence/{id}` | Yes (`X-API-Key`) | Path: `id` | `200 OK`: Audit trail / `404` | Returns complete 8-step evidence audit trail. |
| `POST` | `/api/v1/simulator/inject-event` | Yes (`X-API-Key`) | `{ entity_id, is_duplicate, is_out_of_order, is_delayed, event_type }` | `200 OK`: Simulation result | Admin failure injection endpoint. |
| `POST` | `/api/v1/simulator/trigger-limit` | Yes (`X-API-Key`) | None | `200 OK`: Armed status | Arms rate limiter to trigger HTTP 429 on next request. |
| `GET` | `/api/v1/dashboard/metrics` | No | None | `200 OK`: Dashboard telemetry | Aggregates system metrics, charts, and distributions. |

---

## 4. Granular Technical Documentation on Error Boundaries & Exception Architecture

### Structured Safe Error Schema
To prevent sensitive database internal stack trace exposure while providing clear developer guidance, all backend routes and exception handlers enforce a unified error response structure:

```json
{
  "error_code": "INVALID_STATE_TRANSITION",
  "message": "Rejected: invalid state transition from 'CREATED' to 'DELIVERED'.",
  "timestamp": "2026-09-29T14:30:00.000Z",
  "actionable_advice": "Allowed next statuses for 'CREATED': ['PICKED_UP', 'CANCELLED']",
  "documentation_url": "http://localhost:8000/docs"
}
```

### Backend Error Boundaries & Exception Handlers
1. **HTTP Exception Boundary (`@app.exception_handler(HTTPException)`)**:
   Captures all custom business logic errors (e.g. invalid entity IDs, illegal state jumps, authentication failures). Ensures `error_code` and `actionable_advice` are formatted cleanly without HTML error pages.
2. **Rate Limit Middleware Boundary (`rate_limit_middleware`)**:
   Intercepts incoming HTTP requests. If quota is exceeded, returns `HTTP 429 Too Many Requests` with standard response headers:
   - `Retry-After`: Number of seconds to wait before retrying.
   - `X-RateLimit-Limit`: Maximum allowed requests per window.
   - `X-RateLimit-Remaining`: `0` when limit is breached.
   - `X-RateLimit-Reset`: Unix timestamp of window reset.
3. **Database Integrity & Unhandled Exception Boundary**:
   Catches unexpected database exceptions, converts raw ORM failures into safe `API_ERROR` or `RESOURCE_NOT_FOUND` codes, and sanitizes SQL queries from client responses.

---

## 5. Granular Technical Documentation on Unit & Integration Testing

### Test Suite Structure
The testing suite is powered by `pytest` and `FastAPI TestClient`, executing against an in-memory SQLite test database to ensure isolation and reproducibility.

```
tests/
├── conftest.py                             # Test fixtures (client, db, auth_headers)
├── test_api_endpoints.py                   # Health, limits, carriers, warehouses, shipment CRUD
├── test_event_processor.py                 # Normal ingestion, duplicate event deduplication, sequence order
├── test_rate_limiter.py                    # Rate limit breach simulation & Retry-After headers
├── test_security.py                       # Auth headers (missing/invalid key), 404 handling
└── test_freshness_and_simulators.py        # List search/filtering, state machine stepper, freshness, failure injector
```

### Running Automated Tests
```bash
$env:PYTHONPATH="backend"
pytest -v
```

### Key Test Fixtures (`conftest.py`)
- `db`: Provides an isolated SQLite Session for each test, pre-seeded with synthetic Marketplace entities.
- `client`: TestClient instance configured with FastAPI dependency overrides.
- `auth_headers`: Returns valid header dictionary `{"X-API-Key": "demo-api-key-partner-admin"}`.

---

## 6. Technology Stack

- **Backend**: Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy (Async/Sync SQLite ORM), Uvicorn
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Testing**: Pytest 9.0+, FastAPI TestClient

---

## 7. Local Quick Start & Installation

### Step 1: Clone Repository & Set Up Virtual Environment
```bash
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate
```

### Step 2: Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### Step 3: Run Seed Script
```bash
$env:PYTHONPATH="backend"
python backend/app/seed.py
```

### Step 4: Start FastAPI Backend Server
```bash
$env:PYTHONPATH="backend"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Access the interactive portal at:
- Web Portal: `http://localhost:8000`
- Swagger UI Docs: `http://localhost:8000/docs`

---

## 8. Demo API Keys

- **Partner Admin / Operations**: `demo-api-key-partner-admin`
- **Seller**: `demo-api-key-seller-001`
- **Carrier**: `demo-api-key-carrier-001`
- **Warehouse**: `demo-api-key-warehouse-001`
