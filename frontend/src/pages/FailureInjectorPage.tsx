import React, { useState } from 'react';
import { fetchApi } from '../services/api';
import { Zap, AlertTriangle, ShieldAlert, CheckCircle, RefreshCw, Layers, ArrowRight } from 'lucide-react';

export const FailureInjectorPage: React.FC = () => {
  const [targetShipmentId, setTargetShipmentId] = useState('SHP-0001');
  const [injecting, setInjecting] = useState(false);
  const [injectionResult, setInjectionResult] = useState<any>(null);

  const handleInject = async (type: 'duplicate' | 'out_of_order' | 'delayed' | 'rate_limit' | 'missing_auth' | 'invalid_key' | 'validation' | 'oversized') => {
    setInjecting(true);
    setInjectionResult(null);

    if (type === 'duplicate') {
      const res = await fetchApi('/simulator/inject-event', {
        method: 'POST',
        body: JSON.stringify({ entity_id: targetShipmentId, is_duplicate: true, event_type: 'PICKED_UP' })
      });
      setInjectionResult(res.data || res.errorDetail);
    } else if (type === 'out_of_order') {
      const res = await fetchApi('/simulator/inject-event', {
        method: 'POST',
        body: JSON.stringify({ entity_id: targetShipmentId, is_out_of_order: true, event_type: 'PICKED_UP', sequence_number: 1 })
      });
      setInjectionResult(res.data || res.errorDetail);
    } else if (type === 'delayed') {
      const res = await fetchApi('/simulator/inject-event', {
        method: 'POST',
        body: JSON.stringify({ entity_id: targetShipmentId, is_delayed: true, event_type: 'IN_TRANSIT', sequence_number: 5 })
      });
      setInjectionResult(res.data || res.errorDetail);
    } else if (type === 'rate_limit') {
      await fetchApi('/simulator/trigger-limit', { method: 'POST' });
      const res = await fetchApi('/shipments/SHP-0001');
      setInjectionResult({
        simulation_scenario: 'RATE_LIMIT_BREACH',
        system_response: res.errorDetail || res.data,
        status: res.status
      });
    } else if (type === 'missing_auth') {
      const res = await fetchApi('/shipments/SHP-0001', {}, '');
      setInjectionResult({
        simulation_scenario: 'MISSING_AUTH_HEADER',
        system_response: res.errorDetail || res.data,
        status: res.status
      });
    } else if (type === 'invalid_key') {
      const res = await fetchApi('/shipments/SHP-0001', {}, 'invalid-key-xyz');
      setInjectionResult({
        simulation_scenario: 'INVALID_API_KEY',
        system_response: res.errorDetail || res.data,
        status: res.status
      });
    } else if (type === 'validation') {
      const res = await fetchApi('/shipments', {
        method: 'POST',
        body: JSON.stringify({ seller_id: 'SELLER-001', warehouse_id: 'WH-001', carrier_id: 'CAR-001', destination: 'Delhi', items: [{ sku: 'SKU-1', quantity: -5 }] })
      });
      setInjectionResult({
        simulation_scenario: 'PAYLOAD_VALIDATION_ERROR',
        system_response: res.errorDetail || res.data,
        status: res.status
      });
    } else if (type === 'oversized') {
      const largePayload = { items: new Array(100000).fill({ sku: 'SKU-LARGE', quantity: 1 }) };
      const res = await fetchApi('/shipments', {
        method: 'POST',
        body: JSON.stringify(largePayload)
      });
      setInjectionResult({
        simulation_scenario: 'OVERSIZED_PAYLOAD',
        system_response: res.errorDetail || res.data,
        status: res.status
      });
    }

    setInjecting(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h2 className="font-display font-bold text-2xl text-white flex items-center gap-3">
          <Zap className="w-7 h-7 text-rose-400" />
          Admin Operational Failure Injection Panel
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Directly inject real operational failures (duplicate events, out-of-order vehicle scans, rate limit breaches, validation errors) and verify system state recovery.
        </p>
      </div>

      {/* Target Configuration */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center gap-4 text-xs">
        <span className="text-slate-300 font-semibold">Target Entity ID:</span>
        <input
          type="text"
          value={targetShipmentId}
          onChange={(e) => setTargetShipmentId(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-sky-400 w-48 focus:outline-none"
        />
        <span className="text-slate-500">Target shipment for event mutation testing</span>
      </div>

      {/* Injection Trigger Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Event Injections */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            1. Event Consistency Failures
          </h3>
          <p className="text-slate-400 text-[11px]">Inject duplicated network events or out-of-order sequence scans.</p>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => handleInject('duplicate')}
              disabled={injecting}
              className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 p-2.5 rounded-xl font-mono text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer"
            >
              <span>Inject Duplicate Event</span>
              <Zap className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleInject('out_of_order')}
              disabled={injecting}
              className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 p-2.5 rounded-xl font-mono text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer"
            >
              <span>Inject Out-of-Order Event</span>
              <Zap className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleInject('delayed')}
              disabled={injecting}
              className="w-full bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 p-2.5 rounded-xl font-mono text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer"
            >
              <span>Inject Delayed Telemetry</span>
              <Zap className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Security & Auth Injections */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            2. Authentication & Rate Limits
          </h3>
          <p className="text-slate-400 text-[11px]">Simulate missing headers, invalid keys, or 429 quota breaches.</p>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => handleInject('missing_auth')}
              disabled={injecting}
              className="w-full bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 p-2.5 rounded-xl font-mono text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer"
            >
              <span>Simulate Missing Auth (401)</span>
              <ShieldAlert className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleInject('invalid_key')}
              disabled={injecting}
              className="w-full bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 p-2.5 rounded-xl font-mono text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer"
            >
              <span>Simulate Invalid Key (401)</span>
              <ShieldAlert className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleInject('rate_limit')}
              disabled={injecting}
              className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 p-2.5 rounded-xl font-mono text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer"
            >
              <span>Trigger Rate-Limit Breach (429)</span>
              <Zap className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Payload Injections */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            3. Payload & Schema Injections
          </h3>
          <p className="text-slate-400 text-[11px]">Inject invalid payload fields or oversized request bodies.</p>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => handleInject('validation')}
              disabled={injecting}
              className="w-full bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 p-2.5 rounded-xl font-mono text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer"
            >
              <span>Inject Invalid Schema (422)</span>
              <AlertTriangle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleInject('oversized')}
              disabled={injecting}
              className="w-full bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 p-2.5 rounded-xl font-mono text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer"
            >
              <span>Inject Oversized Body (413)</span>
              <AlertTriangle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Live System Recovery Response Output */}
      {injectionResult && (
        <div className="glass-card p-6 rounded-2xl border border-sky-500/30 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-white text-sm">System Failure Handling Response</span>
            </div>

            {injectionResult.state_preserved !== undefined && (
              <span
                className={`px-3 py-1 rounded font-bold ${
                  injectionResult.state_preserved
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                State Preservation: {injectionResult.state_preserved ? 'VERIFIED SAFE' : 'MUTATED'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {injectionResult.before_state && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1 font-sans font-semibold">Before Ingestion State:</span>
                <span className="text-sky-400 font-bold">{injectionResult.before_state} (Seq #{injectionResult.before_sequence})</span>
              </div>
            )}

            {injectionResult.after_state && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1 font-sans font-semibold">After Ingestion State:</span>
                <span className="text-emerald-400 font-bold">{injectionResult.after_state} (Seq #{injectionResult.after_sequence})</span>
              </div>
            )}
          </div>

          <div>
            <span className="text-slate-400 font-semibold block mb-1 font-sans">Full Backend Execution Audit Result:</span>
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-emerald-300 text-[11px] overflow-x-auto">
              {JSON.stringify(injectionResult, null, 2)}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
};
