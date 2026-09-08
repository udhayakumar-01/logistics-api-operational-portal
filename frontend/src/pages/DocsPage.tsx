import React, { useEffect, useState } from 'react';
import { RiskItem } from '../types';
import { fetchApi } from '../services/api';
import { BookOpen, ShieldAlert, Users, CheckCircle, FileText } from 'lucide-react';

export const DocsPage: React.FC = () => {
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [validationData, setValidationData] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<'risks' | 'assumptions' | 'userguide' | 'validation'>('risks');

  useEffect(() => {
    loadDocsData();
  }, []);

  const loadDocsData = async () => {
    const rRes = await fetchApi<RiskItem[]>('/risks');
    if (rRes.data) setRisks(rRes.data);

    const vRes = await fetchApi<any>('/validation');
    if (vRes.data) setValidationData(vRes.data);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h2 className="font-display font-bold text-2xl text-white flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-sky-400" />
          Operational Documentation & Risk Register
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Complete risk mitigations, stakeholder assumptions, integration user guide, and validation feedback.
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'risks', label: 'Operational Risk Register' },
          { id: 'assumptions', label: 'Stakeholder Assumptions' },
          { id: 'userguide', label: '9-Step Integration User Guide' },
          { id: 'validation', label: 'Stakeholder Validation Report' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activeSection === tab.id
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Risk Register Section */}
      {activeSection === 'risks' && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            Operational Risk Register ({risks.length} Technical & Integration Risks)
          </h3>

          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="p-3">Risk ID</th>
                  <th className="p-3">Risk Description</th>
                  <th className="p-3">Likelihood</th>
                  <th className="p-3">Impact</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Mitigation Strategy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {risks.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-bold text-sky-400">{r.id}</td>
                    <td className="p-3 text-slate-200 font-sans">{r.risk}</td>
                    <td className="p-3 text-slate-400">{r.likelihood}</td>
                    <td className="p-3 text-amber-400 font-bold">{r.impact}</td>
                    <td className="p-3 text-slate-300 font-sans">{r.owner}</td>
                    <td className="p-3">
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 font-sans">{r.mitigation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Stakeholder Assumptions */}
      {activeSection === 'assumptions' && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6 text-xs">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            Persona Operational Assumptions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-sky-400 text-sm">Seller Persona</h4>
              <p className="text-slate-300 leading-relaxed">Needs to create shipment orders, check real-time status, understand validation errors, and respect 100 req/min rate limit quotas.</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-indigo-400 text-sm">Carrier Persona</h4>
              <p className="text-slate-300 leading-relaxed">Needs high-throughput event ingestion via POST /api/v1/events, monotone sequence ordering, and duplicate event deduplication.</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-emerald-400 text-sm">Warehouse Persona</h4>
              <p className="text-slate-300 leading-relaxed">Needs inventory stock queries, visual STALE data indicators when IoT scanners drop, and delayed fulfillment event logging.</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-400 text-sm">Partner API Consumer</h4>
              <p className="text-slate-300 leading-relaxed">Needs interactive "Try It" request execution, pre-populated JSON samples, and clear actionable error advice.</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. User Guide */}
      {activeSection === 'userguide' && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            9-Step Partner Integration Workflow
          </h3>

          <div className="space-y-3 font-mono">
            {[
              { step: 'Step 1', title: 'Obtain API Credentials', text: 'Use X-API-Key: demo-api-key-seller-001 or demo-api-key-partner-admin.' },
              { step: 'Step 2', title: 'Test Authentication Header', text: 'Execute GET /api/v1/health in API Explorer to verify HTTP 200 OK.' },
              { step: 'Step 3', title: 'Check Operational Limits', text: 'Query GET /api/v1/limits to review Standard tier rate limits (100 req/min).' },
              { step: 'Step 4', title: 'Create Test Shipment Order', text: 'Send POST /api/v1/shipments with seller_id, warehouse_id, and carrier_id.' },
              { step: 'Step 5', title: 'Query Shipment Status', text: 'Execute GET /api/v1/shipments/{shipment_id} to verify initial state CREATED.' },
              { step: 'Step 6', title: 'Ingest Status Event', text: 'Send POST /api/v1/events with event_type: PICKED_UP and sequence_number: 2.' },
              { step: 'Step 7', title: 'Handle Duplicate Events', text: 'Re-send identical event_id; verify HTTP 202 IGNORED response with zero state corruption.' },
              { step: 'Step 8', title: 'Inspect Evidence Audit Trace', text: 'Query GET /api/v1/evidence/{entity_id} to view verifiable decision trail.' },
              { step: 'Step 9', title: 'Complete First Successful Integration', text: 'TTFSI measured and logged to telemetry dashboard.' }
            ].map((s) => (
              <div key={s.step} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
                <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2 py-1 rounded font-bold">
                  {s.step}
                </span>
                <div>
                  <span className="text-white font-bold block">{s.title}</span>
                  <span className="text-slate-400 font-sans text-xs">{s.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Stakeholder Validation Report */}
      {activeSection === 'validation' && validationData && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6 text-xs">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Stakeholder Validation Report
            </h3>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded font-mono font-bold">
              {validationData.overall_usability_score} / 5.0 Rating
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Participants</span>
              <span className="text-white font-bold text-lg">{validationData.participants_count} Personas</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Task Completion</span>
              <span className="text-emerald-400 font-bold text-lg">{validationData.task_completion_rate}%</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Overall Satisfaction</span>
              <span className="text-sky-400 font-bold text-lg">{validationData.overall_usability_score} / 5.0</span>
            </div>
          </div>

          <div className="space-y-3">
            {validationData.persona_results.map((p: any, i: number) => (
              <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between gap-3">
                <div>
                  <span className="font-bold text-white block text-sm">{p.persona}</span>
                  <p className="text-slate-400 font-sans text-xs mt-1">"{p.feedback}"</p>
                </div>
                <div className="font-mono text-right text-xs">
                  <span className="text-emerald-400 font-bold block">{p.improved_time_min} min (vs {p.baseline_time_min}m)</span>
                  <span className="text-slate-400">Score: {p.score} / 5.0</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
