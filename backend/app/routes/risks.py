from fastapi import APIRouter

router = APIRouter(prefix="/risks", tags=["Risk Register"])

@router.get("")
def get_risk_register():
    return [
        {
            "id": "RISK-01",
            "risk": "Stale Operational Data: Warehouse IoT packet loss leads to stale stock inventory.",
            "likelihood": "Medium",
            "impact": "High",
            "owner": "Warehouse Operations",
            "status": "Mitigated",
            "mitigation": "Implement visual STALE/MISSING data badges; block auto-dispatch when inventory freshness is STALE."
        },
        {
            "id": "RISK-02",
            "risk": "Duplicate Event Storm: Carrier app retries cause duplicate status updates.",
            "likelihood": "High",
            "impact": "Medium",
            "owner": "Event Platform Team",
            "status": "Mitigated",
            "mitigation": "Idempotency guard keyed by event_id ignores duplicate mutations and logs audit evidence."
        },
        {
            "id": "RISK-03",
            "risk": "Out-of-Order Vehicle Scans: Cellular lag sends delivery scan before pickup scan.",
            "likelihood": "High",
            "impact": "High",
            "owner": "Event Platform Team",
            "status": "Mitigated",
            "mitigation": "Sequence numbers enforce monotone state progression; older sequence numbers are rejected for state mutation."
        },
        {
            "id": "RISK-04",
            "risk": "Rate-Limit Misunderstanding: Partners exceed quotas causing order drop spikes.",
            "likelihood": "Medium",
            "impact": "Medium",
            "owner": "API Governance",
            "status": "Mitigated",
            "mitigation": "Interactive rate limit simulator in portal emits standard Retry-After & X-RateLimit-* headers."
        },
        {
            "id": "RISK-05",
            "risk": "Authentication Misuse: Hardcoded API keys in client code leak credentials.",
            "likelihood": "High",
            "impact": "Critical",
            "owner": "Security Lead",
            "status": "Mitigated",
            "mitigation": "Enforce header-based key auth; display interactive security checklist page in developer portal."
        },
        {
            "id": "RISK-06",
            "risk": "Sensitive Data Leakage: Error tracebacks expose internal SQL schemas or stack traces.",
            "likelihood": "Medium",
            "impact": "High",
            "owner": "Backend Engineering",
            "status": "Mitigated",
            "mitigation": "Global error handlers sanitize exceptions and return structured JSON error codes with actionable advice."
        },
        {
            "id": "RISK-07",
            "risk": "Invalid State Transitions: Out-of-sequence status updates corrupt shipment state.",
            "likelihood": "Medium",
            "impact": "Critical",
            "owner": "Core State Machine",
            "status": "Mitigated",
            "mitigation": "Strict transition state machine validator rejects invalid moves (e.g. DELIVERED -> CREATED)."
        },
        {
            "id": "RISK-08",
            "risk": "Infrastructure Resource Exhaustion: Large payload submissions overwhelm API server.",
            "likelihood": "Low",
            "impact": "High",
            "owner": "DevOps Team",
            "status": "Mitigated",
            "mitigation": "Enforce strict 1MB body size limit middleware (HTTP 413 Payload Too Large)."
        }
    ]
