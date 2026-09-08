# Operational Risk Register

This risk register tracks identified technical, operational, and integration risks along with likelihood, impact, owner, and mitigation strategies.

| Risk ID | Risk Description | Likelihood | Impact | Owner | Status | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RISK-01** | **Stale Operational Data**: Warehouse IoT packet loss leads to stale stock inventory. | Medium | High | Warehouse Operations | Mitigated | Implement visual STALE/MISSING data badges; block auto-dispatch when inventory freshness is STALE. |
| **RISK-02** | **Duplicate Event Storm**: Carrier app retries cause duplicate status updates. | High | Medium | Event Platform Team | Mitigated | Idempotency guard keyed by `event_id` ignores duplicate mutations and logs audit evidence. |
| **RISK-03** | **Out-of-Order Vehicle Scans**: Cellular lag sends delivery scan before pickup scan. | High | High | Event Platform Team | Mitigated | Sequence numbers enforce monotone state progression; older sequence numbers are rejected for state mutation. |
| **RISK-04** | **Rate-Limit Misunderstanding**: Partners exceed quotas causing order drop spikes. | Medium | Medium | API Governance | Mitigated | Interactive rate limit simulator in portal emits standard `Retry-After` & `X-RateLimit-*` headers. |
| **RISK-05** | **Authentication Misuse**: Hardcoded API keys in client code leak credentials. | High | Critical | Security Lead | Mitigated | Enforce header-based key auth; display interactive security checklist page in developer portal. |
| **RISK-06** | **Sensitive Data Leakage**: Error tracebacks expose internal SQL schemas or stack traces. | Medium | High | Backend Engineering | Mitigated | Global error handlers sanitize exceptions and return structured JSON error codes with actionable advice. |
| **RISK-07** | **Invalid State Transitions**: Out-of-sequence status updates corrupt shipment state. | Medium | Critical | Core State Machine | Mitigated | Strict transition state machine validator rejects invalid moves (e.g. DELIVERED -> CREATED). |
| **RISK-08** | **Infrastructure Resource Exhaustion**: Large payload submissions overwhelm API server. | Low | High | DevOps Team | Mitigated | Enforce strict 1MB body size limit middleware (`HTTP 413 Payload Too Large`). |
| **RISK-09** | **Synthetic Data Divergence**: Demo dataset fails to reflect real production traffic patterns. | Medium | Low | Data Science Team | Documented | Seed script uses realistic probability distributions; clearly label synthetic assumptions in docs. |
