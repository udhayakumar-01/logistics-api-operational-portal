export type RoleType = 'Seller' | 'Carrier' | 'Warehouse' | 'Partner Developer' | 'Operations Admin';

export type FreshnessStatus = 'FRESH' | 'STALE' | 'MISSING' | 'UNKNOWN';

export interface DashboardMetrics {
  api_requests: number;
  success_rate: number;
  error_rate: number;
  rate_limit_429_rate: number;
  active_partners: number;
  warehouses_count: number;
  carriers_count: number;
  total_shipments: number;
  total_events: number;
  duplicate_events: number;
  out_of_order_events: number;
  delayed_events: number;
  avg_ttfsi_minutes: number;
  p90_ttfsi_minutes: number;
  freshness_breakdown: {
    fresh_pct: number;
    stale_pct: number;
    missing_pct: number;
  };
}

export interface EndpointSpec {
  id: string;
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  requiresAuth: boolean;
  requiredHeaders: { [key: string]: string };
  requestParams?: Array<{ name: string; type: string; required: boolean; description: string; example: string }>;
  requestBodyExample?: any;
  responseExamples: {
    [statusCode: number]: {
      description: string;
      example: any;
    };
  };
  rateLimit: string;
  retryGuidance: string;
  failureCases: Array<{ status: number; title: string; explanation: string; action: string }>;
  securityNotes: string;
  lastUpdated: string;
  freshnessStatus: FreshnessStatus;
}

export interface EvidenceReport {
  entity_id: str;
  current_state: string;
  current_sequence: number;
  total_event_count: number;
  duplicate_count: number;
  out_of_order_count: number;
  delayed_count: number;
  freshness_status: FreshnessStatus;
  last_updated: string;
  evidence_audit_trail: Array<{
    event_id: string;
    event_type: string;
    timestamp: string;
    received_at: string;
    sequence_number: number;
    source: string;
    status: string;
    decision: string;
    reason: string;
    payload: any;
  }>;
}

export interface RiskItem {
  id: string;
  risk: string;
  likelihood: string;
  impact: string;
  owner: string;
  status: string;
  mitigation: string;
}
