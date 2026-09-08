# Logistics API Operational Documentation & Integration Readiness Portal

> A B.Tech AI & Data Science full-stack operational documentation portal addressing the core logistics marketplace integration problem:
> **"API consumers cannot understand real operational limits, failure behavior, event consistency, and integration requirements from static API documentation."**

---

## 1. System Architecture

```
OpenAPI Spec (logistics_api.yaml) -> Specification Parser -> Rate Limiter / Security Safeguards
                                                                   |
                                                                   v
                                                     Idempotent Event State Machine
                                                    (CREATED -> IN_TRANSIT -> DELIVERED)
                                                                   |
                                                                   v
                                                     Evidence Audit Store & Telemetry
                                                                   |
                                                                   v
                                                Role Dashboards & Interactive Portal
```

---

## 2. Core Features & Capabilities

1. **Executable API Explorer**: Full OpenAPI 3.0 specs with live "Try It" request execution.
2. **Rate Limit Management**: Standard (100 req/min), Premium (500 req/min), Burst (20 req/sec) with `Retry-After` headers and interactive breach simulator.
3. **Idempotent Event Processing**: Deduplicates `event_id` retries safely, rejects out-of-order sequence numbers, and audits delayed events without corrupting shipment state machine.
4. **Verifiable Evidence Drill-Down**: Full event sequence timeline and decision rationale (`STATE_MUTATED` vs `ACCEPTED_NO_MUTATION` vs `REJECTED`).
5. **Data Freshness Badges**: `FRESH`, `STALE`, `MISSING`, `UNKNOWN` indicators across Warehouses & Inventory.
6. **Role-Based Views**: Tailored dashboards for Seller, Carrier, Warehouse, Partner Developer, and Operations Admin.
7. **Partner Integration Timer (TTFSI)**: 30-trial experiment dataset measuring onboarding time reduction (**58.3% decrease in TTFSI**).
8. **Admin Failure Injection Panel**: Live UI triggers for duplicate events, out-of-order sequence scans, rate limit breaches, validation failures (422), oversized payloads (413), and missing auth (401).
9. **Automated Pytest Suite**: 100% test coverage across endpoint CRUD, state transitions, idempotency, rate limiting, and security controls.

---

## 3. Technology Stack

- **Backend**: Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy, SQLite
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Data & Experiments**: Python dataset generator script (`scripts/generate_dataset.py`), experiment runner (`scripts/run_experiment.py`)
- **Testing**: Pytest, FastAPI TestClient

---

## 4. Local Quick Start & Installation

### Step 1: Clone Repository & Create Virtual Environment
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

### Step 3: Generate Synthetic Dataset & Run Experiments
```bash
# Generate 5,000 shipments, 15,000 events, 2,000 requests, 500 errors
python scripts/generate_dataset.py

# Run 30-trial partner onboarding experiment simulation
python scripts/run_experiment.py
```

### Step 4: Seed Database
```bash
$env:PYTHONPATH="backend"
python backend/app/seed.py
```

### Step 5: Start FastAPI Backend Server
```bash
$env:PYTHONPATH="backend"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Step 6: Start Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```
Access portal at: `http://localhost:5173`

---

## 5. Demo Credentials & API Keys

- **Partner Admin / Operations**: `demo-api-key-partner-admin`
- **Seller**: `demo-api-key-seller-001`
- **Carrier**: `demo-api-key-carrier-001`
- **Warehouse**: `demo-api-key-warehouse-001`

---

## 6. Automated Testing

Run the automated test suite:
```bash
$env:PYTHONPATH="backend"
pytest -v tests/
```

---

## 7. Operational Limitations & Future Work

- **Database**: Uses SQLite for lightweight local MVP running on developer laptop; schema designed for PostgreSQL transition.
- **Data Labeling**: All onboarding experiment metrics are based on 30 simulated partner developer trials.
