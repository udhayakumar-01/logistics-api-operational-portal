import React, { useEffect, useState } from 'react';
import { fetchApi } from '../services/api';
import { TrendingUp, Clock, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export const ExperimentsPage: React.FC = () => {
  const [expData, setExpData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'report' | 'raw'>('summary');

  useEffect(() => {
    loadExperiments();
  }, []);

  const loadExperiments = async () => {
    setLoading(true);
    const res = await fetchApi<any>('/experiments');
    if (res.data) {
      setExpData(res.data);
    }
    setLoading(false);
  };

  const chartData = expData ? [
    { metric: 'Mean TTFSI (min)', Baseline: expData.baseline_summary.mean_ttfsi, Improved: expData.improved_summary.mean_ttfsi },
    { metric: 'Median TTFSI (min)', Baseline: expData.baseline_summary.median_ttfsi, Improved: expData.improved_summary.median_ttfsi },
    { metric: 'P90 TTFSI (min)', Baseline: expData.baseline_summary.p90_ttfsi, Improved: expData.improved_summary.p90_ttfsi },
  ] : [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-white flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-emerald-400" />
            Partner Onboarding Experiment & TTFSI Metric
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Quantifying developer time saved during initial API integration (30 Simulated Developer Trials).
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
            activeTab === 'summary' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Comparative Metrics Summary
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
            activeTab === 'report' ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Full Experiment Report (.md)
        </button>
      </div>

      {/* Summary View */}
      {activeTab === 'summary' && expData && (
        <div className="space-y-6">
          
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Baseline Mean TTFSI</span>
              <span className="font-display font-extrabold text-2xl text-rose-400">
                {expData.baseline_summary.mean_ttfsi} min
              </span>
              <span className="text-[11px] text-slate-400 block mt-2">Static Documentation</span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Improved Mean TTFSI</span>
              <span className="font-display font-extrabold text-2xl text-emerald-400">
                {expData.improved_summary.mean_ttfsi} min
              </span>
              <span className="text-[11px] text-emerald-400 block mt-2 font-semibold">-58.3% Time Reduction</span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block mb-1">First-Attempt Success</span>
              <span className="font-display font-extrabold text-2xl text-sky-400">
                {expData.improved_summary.first_call_success_rate}%
              </span>
              <span className="text-[11px] text-slate-400 block mt-2">Vs {expData.baseline_summary.first_call_success_rate}% Baseline</span>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-slate-400 block mb-1">Simulated Developer Trials</span>
              <span className="font-display font-extrabold text-2xl text-white">30 Trials</span>
              <span className="text-[11px] text-slate-400 block mt-2">Stochastic Behavior Model</span>
            </div>
          </div>

          {/* Chart */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-display font-bold text-base text-white">TTFSI Percentile Comparison (Minutes)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="metric" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} unit="m" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
                  <Legend />
                  <Bar dataKey="Baseline" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Improved" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* Report View */}
      {activeTab === 'report' && expData && (
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 text-xs font-mono text-slate-300 overflow-x-auto">
          <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            experiments/experiment_report.md
          </h3>
          <pre className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
            {expData.report_markdown}
          </pre>
        </div>
      )}

    </div>
  );
};
