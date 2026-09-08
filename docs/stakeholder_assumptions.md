# Stakeholder Assumptions & Requirements

> [!NOTE]
> All assumptions listed below are synthetic operational assumptions designed for demonstration in the Logistics API Operational Documentation & Integration Readiness Portal.

---

## 1. Seller Persona
- **Primary Goal**: Create shipment orders, track dispatch status, and handle order exceptions.
- **Operational Needs**:
  - Clear request body specifications for `POST /api/v1/shipments`.
  - Understanding error responses (e.g. invalid warehouse or inactive SKU).
  - Understanding rate-limiting rules (100 req/min for Standard Tier) to prevent automated order script failures.
  - Transparent retry guidance for 429 and 5xx errors.

---

## 2. Carrier Persona
- **Primary Goal**: Ingest shipment pickup, transit, and delivery events from mobile scanners and vehicle telemetry.
- **Operational Needs**:
  - High-throughput event ingestion via `POST /api/v1/events`.
  - Understanding event ordering rules and how sequence numbers resolve out-of-order vehicle scans.
  - Safe duplicate event processing (ignoring re-transmitted network packets without double-stepping shipment state).

---

## 3. Warehouse Persona
- **Primary Goal**: Process inventory stock, manage order fulfillment, and report capacity status.
- **Operational Needs**:
  - Real-time stock availability check via `GET /api/v1/inventory/{sku}`.
  - Clear visibility into stale or missing data indicators when warehouse IoT connections drop.
  - Handling delayed inbound fulfillment events without corrupting inventory balance.

---

## 4. API Consumer / Partner Developer Persona
- **Primary Goal**: Complete first successful API integration quickly and reliably.
- **Operational Needs**:
  - Interactive "Try It" client to test requests directly in browser with real response payloads.
  - Complete OpenAPI 3.0 specification explorer.
  - Clear authentication guidelines (`X-API-Key` headers).
  - Pre-built code samples and actionable error remediation messages.

---

## 5. Marketplace Operations / Admin Persona
- **Primary Goal**: Monitor overall API ecosystem health, rate limit violations, event consistency, and evidence logs.
- **Operational Needs**:
  - Executive KPI dashboard showing request volume, success rates, 429 rate, and average TTFSI.
  - Interactive failure injection panel to simulate edge cases and evaluate system resilience.
  - Full evidence drill-down for disputed shipment states.
