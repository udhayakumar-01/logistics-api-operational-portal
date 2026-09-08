import React from 'react';
import { EvidenceReport } from '../types';
import { FreshnessBadge } from './FreshnessBadge';
import { X, ShieldCheck, CheckCircle2, AlertOctagon, Clock, Layers } from 'lucide-react';

interface Props {
  evidence: EvidenceReport;
  onClose: () => void;
}

export const EvidenceModal: React.FC<Props> = ({ evidence, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-card bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                Operational Evidence Audit Log
                <span className="font-mono text-xs bg-slate-800 text-sky-400 px-2 py-0.5 rounded border border-slate-700">
                  {evidence.entity_id}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Verifiable event trace & decision rationale</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-6 border-b border-slate-800/80 bg-slate-950/50 text-xs">
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Current State</span>
            <span className="font-bold text-emerald-400 font-mono text-sm">{evidence.current_state}</span>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Sequence Monotone</span>
            <span className="font-bold text-sky-400 font-mono text-sm">Seq #{evidence.current_sequence}</span>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Duplicate Events</span>
            <span className={`font-bold font-mono text-sm ${evidence.duplicate_count > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
              {evidence.duplicate_count} Ignored
            </span>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Out-of-Order</span>
            <span className={`font-bold font-mono text-sm ${evidence.out_of_order_count > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
              {evidence.out_of_order_count} Ignored
            </span>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Data Freshness</span>
            <FreshnessBadge status={evidence.freshness_status} lastUpdated={evidence.last_updated} showText={false} />
          </div>
        </div>

        {/* Event Timeline Audit List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            Chronological Event Decision Timeline ({evidence.evidence_audit_trail.length} Events)
          </h4>

          <div className="space-y-3">
            {evidence.evidence_audit_trail.map((evt, idx) => {
              const isMutated = evt.decision === 'STATE_MUTATED';
              const isIgnored = evt.decision === 'IGNORED';
              const isRejected = evt.decision === 'REJECTED';

              return (
                <div
                  key={evt.event_id + idx}
                  className={`p-4 rounded-xl border transition-all text-xs ${
                    isMutated
                      ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40'
                      : isIgnored
                      ? 'bg-amber-950/20 border-amber-800/40'
                      : 'bg-rose-950/20 border-rose-800/40'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`p-1 rounded ${
                          isMutated
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : isIgnored
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {isMutated ? <CheckCircle2 className="w-4 h-4" /> : <AlertOctagon className="w-4 h-4" />}
                      </span>

                      <span className="font-mono font-bold text-slate-200">{evt.event_type}</span>
                      <span className="font-mono text-slate-400">({evt.event_id})</span>
                      <span className="bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded text-[11px]">
                        Seq #{evt.sequence_number}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
                      <span>Source: {evt.source}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {evt.received_at.slice(11, 19)}
                      </span>
                    </div>
                  </div>

                  {/* Decision Banner */}
                  <div className="mt-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                    <div>
                      <span className="text-slate-400 font-semibold mr-2">Processing Decision:</span>
                      <span
                        className={`font-mono font-bold ${
                          isMutated ? 'text-emerald-400' : isIgnored ? 'text-amber-400' : 'text-rose-400'
                        }`}
                      >
                        {evt.decision}
                      </span>
                    </div>
                    <div className="text-slate-300 font-mono text-[11px]">{evt.reason}</div>
                  </div>

                  {/* Payload preview */}
                  {evt.payload && Object.keys(evt.payload).length > 0 && (
                    <details className="mt-2 text-[11px]">
                      <summary className="cursor-pointer text-sky-400 hover:underline">View Ingested Payload JSON</summary>
                      <pre className="mt-1 bg-slate-950 p-2 rounded text-slate-400 font-mono overflow-x-auto">
                        {JSON.stringify(evt.payload, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
