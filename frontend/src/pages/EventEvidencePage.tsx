import React, { useState, useEffect } from 'react';
import { EvidenceReport } from '../types';
import { fetchApi } from '../services/api';
import { FreshnessBadge } from '../components/FreshnessBadge';
import { EvidenceModal } from '../components/EvidenceModal';
import { Layers, ShieldCheck, Search, ArrowRight, CheckCircle2, AlertOctagon, RefreshCw } from 'lucide-react';

export const EventEvidencePage: React.FC = () => {
  const [targetShipmentId, setTargetShipmentId] = useState('SHP-0001');
  const [evidence, setEvidence] = useState<EvidenceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadEvidence('SHP-0001');
  }, []);

  const loadEvidence = async (id: string) => {
    setLoading(true);
    setErrorMsg('');
    const res = await fetchApi<EvidenceReport>(`/evidence/${id}`);
    setLoading(false);

    if (res.data) {
      setEvidence(res.data);
    } else {
      setErrorMsg(res.errorDetail?.message || `Shipment ${id} not found.`);
      setEvidence(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetShipmentId.trim()) {
      loadEvidence(targetShipmentId.trim());
    }
  };

  const statesOrder = ['CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h2 className="font-display font-bold text-2xl text-white flex items-center gap-3">
          <Layers className="w-7 h-7 text-indigo-400" />
          Event Processing, Idempotency & Evidence Store
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Safely processes duplicate, out-of-order, and delayed events without corrupting shipment state machine.
        </p>
      </div>

      {/* Shipment State Machine Visual Diagram */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-display font-bold text-base text-white">Monotone State Machine Transition Model</h3>
        
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs">
          {statesOrder.map((st, i) => {
            const isCurrent = evidence?.current_state === st;
            return (
              <React.Fragment key={st}>
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    isCurrent
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-bold shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrent ? 'text-emerald-400' : 'text-slate-600'}`} />
                  {st}
                </div>
                {i < statesOrder.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Search Input & Quick Samples */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={targetShipmentId}
              onChange={(e) => setTargetShipmentId(e.target.value)}
              placeholder="Enter Shipment ID (e.g. SHP-0001)"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Query Evidence Store
          </button>
        </form>

        {/* Preset Sample Buttons */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Sample Evidence Records:</span>
          {['SHP-0001', 'SHP-0002', 'SHP-0003', 'SHP-0004'].map((id) => (
            <button
              key={id}
              onClick={() => {
                setTargetShipmentId(id);
                loadEvidence(id);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 px-2.5 py-1 rounded font-mono text-[11px] cursor-pointer"
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Error display */}
      {errorMsg && (
        <div className="bg-rose-950/40 border border-rose-800 text-rose-300 p-4 rounded-xl text-xs">
          {errorMsg}
        </div>
      )}

      {/* Evidence Overview Display */}
      {evidence && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-display font-bold text-xl text-white flex items-center gap-3">
                Shipment {evidence.entity_id}
                <FreshnessBadge status={evidence.freshness_status} lastUpdated={evidence.last_updated} />
              </h3>
              <p className="text-xs text-slate-400 mt-1">Current State: <span className="font-mono text-emerald-400 font-bold">{evidence.current_state}</span></p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              View Full Evidence Audit Log
            </button>
          </div>

          {/* Audit Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1 font-sans">Current Sequence</span>
              <span className="text-sky-400 font-bold text-lg">Seq #{evidence.current_sequence}</span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1 font-sans">Duplicate Attempts</span>
              <span className={`font-bold text-lg ${evidence.duplicate_count > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                {evidence.duplicate_count} Ignored
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1 font-sans">Out-of-Order Events</span>
              <span className={`font-bold text-lg ${evidence.out_of_order_count > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                {evidence.out_of_order_count} Ignored
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1 font-sans">Delayed Events</span>
              <span className={`font-bold text-lg ${evidence.delayed_count > 0 ? 'text-indigo-400' : 'text-slate-300'}`}>
                {evidence.delayed_count} Logged
              </span>
            </div>
          </div>

          {/* Recent Event Snippets */}
          <div>
            <h4 className="font-semibold text-slate-300 text-xs mb-3">Recent Ingested Events Summary</h4>
            <div className="space-y-2">
              {evidence.evidence_audit_trail.slice(0, 3).map((evt, idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">{evt.event_type}</span>
                    <span className="text-slate-400">({evt.event_id})</span>
                    <span className="text-sky-400">Seq #{evt.sequence_number}</span>
                  </div>
                  <div className="text-slate-400">
                    Decision: <span className={evt.decision === 'STATE_MUTATED' ? 'text-emerald-400' : 'text-amber-400'}>{evt.decision}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Modal Popup */}
      {showModal && evidence && (
        <EvidenceModal evidence={evidence} onClose={() => setShowModal(false)} />
      )}

    </div>
  );
};
