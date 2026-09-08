# System Architecture Documentation

## Overview
The **Logistics API Operational Documentation & Integration Readiness Portal** converts static API specifications, sample payloads, rate-limit rules, and observed operational error logs into an interactive documentation ecosystem.

---

## Architecture Diagram

```
+-------------------------------------------------------------------+
|                        API Specification                          |
|                     (specs/logistics_api.yaml)                    |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                        Specification Parser                       |
|               (Loads endpoints, schemas, error codes)             |
+-------------------------------------------------------------------+
             |                                        |
             v                                        v
+------------------------+               +--------------------------+
|   Operational Rules    |               |     Example Payloads     |
+------------------------+               +--------------------------+
             |                                        |
             +--------------------+-------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                      Operational API Layer                        |
|                                                                   |
|   +-------------------+  +--------------------+  +------------+   |
|   | Rate Limit Engine |  | Security Safeguard |  | Error Hndlr|   |
|   +-------------------+  +--------------------+  +------------+   |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                       Event Processor Store                       |
|                                                                   |
|   +---------------+     +---------------+     +---------------+   |
|   | Normal Events |     | Delayed Events|     | Duplicate/OOO |   |
|   +---------------+     +---------------+     +---------------+   |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                      Idempotent State Machine                     |
|           (CREATED -> PICKED_UP -> IN_TRANSIT -> DELIVERED)        |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                           Evidence Store                          |
|         (Event Audit Trail, Decision History, Sequence Logs)      |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                    Interactive Documentation Portal               |
|                                                                   |
|  +--------------+  +--------------+  +-----------+  +----------+  |
|  | Seller View  |  | Carrier View |  | WH View   |  | Dev/Admin|  |
|  +--------------+  +--------------+  +-----------+  +----------+  |
+-------------------------------------------------------------------+
```

---

## Core Components & Data Flow

### 1. Specification Parser & OpenAPI Layer
- Loads OpenAPI 3.0 spec dynamically (`specs/logistics_api.yaml`).
- Exposes standard endpoint descriptions, request parameters, response schemas, and rate limit rules.
- Enables interactive "Try It" client requests with live backend execution.

### 2. Operational Security & Rate Limit Middleware
- **Security**: Validates `X-API-Key` headers, enforces body size limits (< 1MB), prevents stack trace leaks, and blocks invalid HTTP verbs.
- **Rate Limiting**: Enforces tier-based token bucket limits (Standard: 100 req/min, Premium: 500 req/min, Burst: 20 req/sec). Emits headers `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`. Returns HTTP 429 when exhausted.

### 3. State Machine & Idempotent Event Processor
- **State Machine Transitions**:
  `CREATED` -> `PICKED_UP` -> `IN_TRANSIT` -> `OUT_FOR_DELIVERY` -> `DELIVERED` (or `CANCELLED`).
- **Idempotency Guard**: Deduplicates events by `event_id`. Duplicate attempts generate `ACCEPTED_NO_MUTATION` with `IGNORED` decision.
- **Sequence Number Protection**: Events include a monotonically increasing `sequence_number`. If `sequence_number <= current_shipment_sequence`, event is rejected for state mutation to prevent state corruption.
- **Delayed Event Flagging**: Events with `received_at - timestamp > 60 seconds` are flagged as `PROCESSED_DELAYED` and audited.

### 4. Data Freshness Service
- Monitors update recency across Warehouses, Carriers, and Inventory.
- Computes visible freshness badges:
  - `FRESH`: updated < 2 minutes ago
  - `STALE`: updated 2 - 15 minutes ago
  - `MISSING`: no observation in > 15 minutes
  - `UNKNOWN`: uninitialized state

### 5. Evidence Store & Role Dashboards
- Maintains full audit trail for every entity (Shipment ID).
- Captures event arrival times, sequence numbers, payload diffs, and state decisions.
- Serves tailored dashboards for 5 stakeholder roles: Seller, Carrier, Warehouse, Partner Developer, Operations Admin.
