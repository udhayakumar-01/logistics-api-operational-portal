import React, { useState } from 'react';
import { fetchApi } from '../services/api';
import { Gauge, Zap, AlertTriangle, ShieldCheck, Play, Clock, ArrowRight } from 'lucide-react';

export const RateLimitsPage: React.FC = () => {
  const [armed, setArmed] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleArmBreach = async () => {
    setLoading(true);
    const res = await fetchApi('/simulator/trigger-limit', { method: 'POST' });
    setLoading(false);
    if (res.status === 200) {
      setArmed(true);
    }
  };

  const handleTestCall = async () => {
    setLoading(true);
    const res = await fetchApi('/limits');
    setLoading(false);

    const headers: { [key: string]: string } = {};
    res.headers.forEach((val, key) => {
      headers[key] = val;
    });

    setTestResult({
      status: res.status,
      headers,
      body: res.data || res.errorDetail
    });
    setArmed(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h2 className="font-display font-bold text-2xl text-white flex items-center gap-3">
          <Gauge className="w-7 h-7 text-amber-400" />
          Rate Limiting & Quota Management
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Real operational limits, burst capacity rules, quota headers, and interactive rate limit failure simulator.
        </p>
      </div>

      {/* Tier Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display font-bold text-lg text-white">Standard Tier</h3>
            <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs px-2.5 py-0.5 rounded font-mono">Default</span>
          </div>
          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Request Quota:</span>
              <span className="text-white font-bold">100 req / minute</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Burst Limit:</span>
              <span className="text-amber-400 font-bold">20 req / second</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Concurrency:</span>
              <span className="text-slate-300">5 connections</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display font-bold text-lg text-white">Premium Tier</h3>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded font-mono">Partner</span>
          </div>
          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Request Quota:</span>
              <span className="text-emerald-400 font-bold">500 req / minute</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Burst Limit:</span>
              <span className="text-amber-400 font-bold">50 req / second</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Concurrency:</span>
              <span className="text-slate-300">25 connections</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display font-bold text-lg text-white">Enterprise Tier</h3>
            <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs px-2.5 py-0.5 rounded font-mono">High Scale</span>
          </div>
          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Request Quota:</span>
              <span className="text-purple-400 font-bold">2,000 req / minute</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Burst Limit:</span>
              <span className="text-amber-400 font-bold">200 req / second</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Concurrency:</span>
              <span className="text-slate-300">100 connections</span>
            </div>
          </div>
        </div>

      </div>

      {/* Header Standards & Retry-After Explanation */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-display font-bold text-base text-white">Standard Rate-Limit Response Headers</h3>
        <p className="text-xs text-slate-400">Every API response includes rate limit telemetry in the HTTP headers:</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-sky-400 font-bold block mb-1">X-RateLimit-Limit</span>
            <span className="text-slate-300">Maximum allowed request count in current 60s window (e.g., 100).</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-sky-400 font-bold block mb-1">X-RateLimit-Remaining</span>
            <span className="text-slate-300">Remaining allowed calls before returning HTTP 429.</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-sky-400 font-bold block mb-1">X-RateLimit-Reset</span>
            <span className="text-slate-300">UTC epoch timestamp when the request window resets.</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-amber-400 font-bold block mb-1">Retry-After</span>
            <span className="text-slate-300">Seconds to wait before retrying after receiving HTTP 429.</span>
          </div>
        </div>
      </div>

      {/* Interactive Rate Limit Simulator Panel */}
      <div className="glass-card p-6 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-slate-900 to-amber-950/30 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">Interactive Rate-Limit Breach Simulator</h3>
            <p className="text-xs text-slate-400">Intentionally trigger a rate limit breach (HTTP 429) to evaluate application error handling.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleArmBreach}
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            {armed ? 'Rate Limit Armed!' : '1. Arm Rate-Limit Breach'}
          </button>

          <ArrowRight className="w-4 h-4 text-slate-500 hidden md:block" />

          <button
            onClick={handleTestCall}
            disabled={loading}
            className="bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            2. Execute Request to Observe HTTP 429
          </button>
        </div>

        {/* Live Simulator Output */}
        {testResult && (
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span
                className={`px-3 py-1 rounded font-bold ${
                  testResult.status === 429
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                HTTP {testResult.status} {testResult.status === 429 ? 'Too Many Requests' : 'OK'}
              </span>

              {testResult.headers['retry-after'] && (
                <span className="text-amber-400 font-bold bg-amber-950/60 px-3 py-1 rounded border border-amber-800">
                  Retry-After: {testResult.headers['retry-after']} seconds
                </span>
              )}
            </div>

            <div>
              <span className="text-slate-400 font-semibold block mb-1">Returned Headers:</span>
              <pre className="text-sky-300 text-[11px]">
                {JSON.stringify(testResult.headers, null, 2)}
              </pre>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block mb-1">Returned Actionable Error Response:</span>
              <pre className="text-emerald-300 text-[11px]">
                {JSON.stringify(testResult.body, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
