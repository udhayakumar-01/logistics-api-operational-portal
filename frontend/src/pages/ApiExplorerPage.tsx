import React, { useState } from 'react';
import { EndpointSpec } from '../types';
import { FreshnessBadge } from '../components/FreshnessBadge';
import { TryItModal } from '../components/TryItModal';
import { Code2, Play, Shield, Gauge, AlertCircle, CheckCircle2, Search, Filter } from 'lucide-react';

const ENDPOINTS: EndpointSpec[] = [
  {
    id: 'post-shipment',
    method: 'POST',
    path: '/api/v1/shipments',
    summary: 'Create New Shipment Order',
    description: 'Creates a new logistics shipment order. Validates seller, warehouse, and carrier availability prior to order commitment.',
    requiresAuth: true,
    requiredHeaders: { 'X-API-Key': 'Required (e.g. demo-api-key-seller-001)', 'Content-Type': 'application/json' },
    requestBodyExample: {
      seller_id: 'SELLER-001',
      warehouse_id: 'WH-001',
      carrier_id: 'CAR-001',
      origin: 'Bengaluru, KA, India',
      destination: 'Chennai, TN, India',
      items: [{ sku: 'SKU-1001', quantity: 2 }]
    },
    responseExamples: {
      201: {
        description: 'Shipment created successfully',
        example: {
          shipment_id: 'SHP-5001',
          status: 'CREATED',
          seller_id: 'SELLER-001',
          warehouse_id: 'WH-001',
          carrier_id: 'CAR-001',
          origin: 'Bengaluru, KA, India',
          destination: 'Chennai, TN, India',
          current_sequence: 1,
          created_at: '2026-09-08T09:45:00Z'
        }
      },
      400: {
        description: 'Invalid warehouse or carrier ID',
        example: {
          error_code: 'INVALID_PARAMETER',
          message: "Warehouse 'WH-9999' does not exist or is inactive.",
          timestamp: '2026-09-08T09:45:00Z',
          actionable_advice: 'Verify warehouse ID against GET /api/v1/warehouses before creating shipment.'
        }
      },
      429: {
        description: 'Rate limit exceeded',
        example: {
          error_code: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded (100 req/min). Remaining quota: 0.',
          timestamp: '2026-09-08T09:45:00Z',
          actionable_advice: 'Wait for Retry-After seconds before retrying.'
        }
      }
    },
    rateLimit: '100 requests/minute (Standard Tier)',
    retryGuidance: 'Exponential backoff with jitter on 429 or 5xx status codes.',
    failureCases: [
      { status: 401, title: 'Missing API Key', explanation: 'No X-API-Key header provided.', action: 'Include X-API-Key in header.' },
      { status: 400, title: 'Inactive Warehouse', explanation: 'Warehouse ID is invalid or offline.', action: 'Check GET /api/v1/warehouses.' },
      { status: 422, title: 'Quantity <= 0', explanation: 'Item quantity must be positive integer.', action: 'Set item quantity >= 1.' }
    ],
    securityNotes: 'API key mandatory. Payload body limited to 1MB. Input fields sanitized.',
    lastUpdated: '2026-09-08T09:45:00Z',
    freshnessStatus: 'FRESH'
  },
  {
    id: 'get-shipment',
    method: 'GET',
    path: '/api/v1/shipments/{shipment_id}',
    summary: 'Get Shipment Details & State Machine',
    description: 'Retrieves current status, monotone sequence counter, event counts, and freshness metadata for a specific shipment.',
    requiresAuth: true,
    requiredHeaders: { 'X-API-Key': 'Required' },
    requestParams: [
      { name: 'shipment_id', type: 'path', required: true, description: 'Shipment unique identifier', example: 'SHP-0001' }
    ],
    responseExamples: {
      200: {
        description: 'Shipment detail retrieved',
        example: {
          shipment_id: 'SHP-0001',
          status: 'IN_TRANSIT',
          seller_id: 'SELLER-012',
          warehouse_id: 'WH-005',
          carrier_id: 'CAR-003',
          origin: 'Mumbai',
          destination: 'Delhi',
          current_sequence: 3,
          event_count: 4,
          duplicate_event_count: 1,
          out_of_order_event_count: 1,
          delayed_event_count: 0,
          freshness_status: 'FRESH',
          created_at: '2026-09-08T09:00:00Z',
          last_updated: '2026-09-08T09:30:00Z'
        }
      },
      404: {
        description: 'Shipment not found',
        example: {
          error_code: 'RESOURCE_NOT_FOUND',
          message: "Shipment 'SHP-9999' was not found.",
          timestamp: '2026-09-08T09:45:00Z',
          actionable_advice: 'Check shipment_id formatting.'
        }
      }
    },
    rateLimit: '100 requests/minute',
    retryGuidance: 'Retry after 1s on temporary 503 network drops.',
    failureCases: [
      { status: 404, title: 'Unknown Shipment', explanation: 'ID does not exist in store.', action: 'Verify shipment ID format.' }
    ],
    securityNotes: 'Read access authorized for authenticated partner API keys.',
    lastUpdated: '2026-09-08T09:45:00Z',
    freshnessStatus: 'FRESH'
  },
  {
    id: 'post-events',
    method: 'POST',
    path: '/api/v1/events',
    summary: 'Ingest Logistics Status Event (Idempotent)',
    description: 'Primary state mutation ingestion endpoint. Guarantees idempotent event processing, out-of-order rejection using sequence numbers, and delayed event auditing.',
    requiresAuth: true,
    requiredHeaders: { 'X-API-Key': 'Required', 'Content-Type': 'application/json' },
    requestBodyExample: {
      event_id: 'EVT-9901',
      event_type: 'PICKED_UP',
      entity_id: 'SHP-0001',
      timestamp: '2026-09-08T09:40:00Z',
      source: 'CARRIER-APP',
      sequence_number: 2,
      payload: { location: 'Hub 4, Bengaluru' }
    },
    responseExamples: {
      200: {
        description: 'Valid event state mutation',
        example: {
          event_id: 'EVT-9901',
          status: 'PROCESSED',
          decision: 'STATE_MUTATED',
          reason: 'State updated to PICKED_UP.',
          current_state: 'PICKED_UP',
          is_duplicate: false,
          is_out_of_order: false,
          is_delayed: false
        }
      },
      202: {
        description: 'Accepted but ignored (Duplicate or Out-of-order)',
        example: {
          event_id: 'EVT-9901',
          status: 'ACCEPTED_NO_MUTATION',
          decision: 'IGNORED',
          reason: 'Duplicate event_id detected. State mutation safely skipped.',
          current_state: 'PICKED_UP',
          is_duplicate: true,
          is_out_of_order: false,
          is_delayed: false
        }
      }
    },
    rateLimit: '500 requests/minute (Premium Tier support available)',
    retryGuidance: 'Safe to retry with identical event_id due to backend idempotency protection.',
    failureCases: [
      { status: 202, title: 'Duplicate Event ID', explanation: 'Event ID already processed.', action: 'No action needed; state preserved.' },
      { status: 202, title: 'Out of Order Sequence', explanation: 'Sequence number <= current state sequence.', action: 'Ensure event sequence number is monotonically increasing.' },
      { status: 400, title: 'Invalid State Transition', explanation: 'Transition not allowed (e.g., DELIVERED -> CREATED).', action: 'Follow state machine workflow.' }
    ],
    securityNotes: 'Signature and sequence number verified before state modification.',
    lastUpdated: '2026-09-08T09:45:00Z',
    freshnessStatus: 'FRESH'
  },
  {
    id: 'get-evidence',
    method: 'GET',
    path: '/api/v1/evidence/{entity_id}',
    summary: 'Get Entity Operational Evidence & Audit Trace',
    description: 'Retrieves comprehensive verifiable event traces, processing decisions, duplicate counters, sequence history, and freshness indicators for any shipment.',
    requiresAuth: true,
    requiredHeaders: { 'X-API-Key': 'Required' },
    requestParams: [
      { name: 'entity_id', type: 'path', required: true, description: 'Shipment entity ID', example: 'SHP-0001' }
    ],
    responseExamples: {
      200: {
        description: 'Evidence audit report',
        example: {
          entity_id: 'SHP-0001',
          current_state: 'IN_TRANSIT',
          current_sequence: 3,
          total_event_count: 5,
          duplicate_count: 1,
          out_of_order_count: 1,
          delayed_count: 0,
          freshness_status: 'FRESH',
          last_updated: '2026-09-08T09:30:00Z',
          evidence_audit_trail: []
        }
      }
    },
    rateLimit: '100 requests/minute',
    retryGuidance: 'Read-only query endpoint.',
    failureCases: [
      { status: 404, title: 'Entity Not Found', explanation: 'No evidence recorded for ID.', action: 'Verify entity ID.' }
    ],
    securityNotes: 'Audit log read access restricted to authenticated partner keys.',
    lastUpdated: '2026-09-08T09:45:00Z',
    freshnessStatus: 'FRESH'
  },
  {
    id: 'get-inventory',
    method: 'GET',
    path: '/api/v1/inventory/{sku}',
    summary: 'Check Realtime SKU Inventory Counts',
    description: 'Queries warehouse stock counts and inventory freshness badges by SKU.',
    requiresAuth: true,
    requiredHeaders: { 'X-API-Key': 'Required' },
    requestParams: [
      { name: 'sku', type: 'path', required: true, description: 'SKU identifier', example: 'SKU-1001' }
    ],
    responseExamples: {
      200: {
        description: 'Inventory stock details',
        example: {
          sku: 'SKU-1001',
          total_quantity: 450,
          warehouse_breakdown: [
            { warehouse_id: 'WH-001', quantity: 200, freshness_status: 'FRESH', last_updated: '2026-09-08T09:44:30Z' }
          ]
        }
      }
    },
    rateLimit: '100 requests/minute',
    retryGuidance: 'Check freshness status badge. Re-query if status is STALE.',
    failureCases: [
      { status: 404, title: 'Unknown SKU', explanation: 'SKU not found in catalog.', action: 'Verify SKU syntax.' }
    ],
    securityNotes: 'Read access verified.',
    lastUpdated: '2026-09-08T09:45:00Z',
    freshnessStatus: 'FRESH'
  }
];

export const ApiExplorerPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [activeTryItEndpoint, setActiveTryItEndpoint] = useState<EndpointSpec | null>(null);

  const filteredEndpoints = ENDPOINTS.filter((ep) => {
    const matchesSearch =
      ep.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ep.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ep.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = selectedMethod === 'ALL' || ep.method === selectedMethod;
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-white flex items-center gap-3">
            <Code2 className="w-7 h-7 text-sky-400" />
            Executable API Explorer & OpenAPI Specs
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Explore operational endpoint limits, required headers, failure behavior, security policies, and execute live API calls via the interactive "Try It" client.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-card p-4 rounded-xl border border-slate-800">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search endpoints by path or summary..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Method:</span>
          {['ALL', 'GET', 'POST', 'PATCH'].map((method) => (
            <button
              key={method}
              onClick={() => setSelectedMethod(method)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                selectedMethod === method
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* Endpoint Cards List */}
      <div className="space-y-6">
        {filteredEndpoints.map((ep) => (
          <div
            key={ep.id}
            className="glass-card rounded-2xl border border-slate-800/90 overflow-hidden shadow-lg hover:border-slate-700 transition-all"
          >
            {/* Endpoint Card Header */}
            <div className="bg-slate-950/80 p-5 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold ${
                    ep.method === 'GET'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : ep.method === 'POST'
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="font-mono text-sm font-bold text-white">{ep.path}</span>
              </div>

              <div className="flex items-center gap-3">
                <FreshnessBadge status={ep.freshnessStatus} lastUpdated={ep.lastUpdated} />

                {/* Try It Live Button */}
                <button
                  onClick={() => setActiveTryItEndpoint(ep)}
                  className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Try It Live
                </button>
              </div>
            </div>

            {/* Endpoint Body */}
            <div className="p-6 space-y-6 text-xs">
              
              <div>
                <h4 className="font-display font-bold text-sm text-slate-100 mb-1">{ep.summary}</h4>
                <p className="text-slate-400 leading-relaxed">{ep.description}</p>
              </div>

              {/* Requirements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 font-mono">
                <div>
                  <span className="text-slate-400 block mb-1 font-sans font-semibold">Authentication</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    Header `X-API-Key`
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1 font-sans font-semibold">Rate Limit</span>
                  <span className="text-sky-400 flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5" />
                    {ep.rateLimit}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1 font-sans font-semibold">Retry Policy</span>
                  <span className="text-amber-400">{ep.retryGuidance}</span>
                </div>
              </div>

              {/* Examples Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Request Body Example */}
                {ep.requestBodyExample && (
                  <div>
                    <h5 className="font-semibold text-slate-300 mb-2 font-mono">Sample Request Payload (JSON):</h5>
                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sky-300 font-mono text-[11px] overflow-x-auto">
                      {JSON.stringify(ep.requestBodyExample, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Successful Response Example */}
                {ep.responseExamples[200] || ep.responseExamples[201] ? (
                  <div>
                    <h5 className="font-semibold text-slate-300 mb-2 font-mono flex items-center gap-2">
                      Sample Successful Response:
                      <span className="text-emerald-400 text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                        200 / 201 OK
                      </span>
                    </h5>
                    <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-emerald-300 font-mono text-[11px] overflow-x-auto">
                      {JSON.stringify(ep.responseExamples[201]?.example || ep.responseExamples[200]?.example, null, 2)}
                    </pre>
                  </div>
                ) : null}

              </div>

              {/* Failure & Edge Cases Table */}
              <div>
                <h5 className="font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  Observed Failure Behavior & Remediation Guidance
                </h5>
                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                        <th className="p-3">Status</th>
                        <th className="p-3">Failure Scenario</th>
                        <th className="p-3">Root Cause Explanation</th>
                        <th className="p-3">Recommended Consumer Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      {ep.failureCases.map((fc, i) => (
                        <tr key={i} className="hover:bg-slate-900/40">
                          <td className="p-3">
                            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded font-bold">
                              HTTP {fc.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-200 font-semibold">{fc.title}</td>
                          <td className="p-3 text-slate-400">{fc.explanation}</td>
                          <td className="p-3 text-emerald-400 font-sans">{fc.action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        ))}
      </div>

      {/* Live Execution TryIt Modal */}
      {activeTryItEndpoint && (
        <TryItModal endpoint={activeTryItEndpoint} onClose={() => setActiveTryItEndpoint(null)} />
      )}

    </div>
  );
};
