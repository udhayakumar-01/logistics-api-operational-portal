import React, { useState } from 'react';
import { fetchApi } from '../services/api';
import { ShieldAlert, ShieldCheck, Lock, AlertTriangle, CheckCircle, Play } from 'lucide-react';

export const SecurityPage: React.FC = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runMisuseTest = async (testCase: string) => {
    setLoading(true);
    setTestResult(null);

    if (testCase === 'missing_key') {
      const res = await fetchApi('/shipments/SHP-0001', {}, '');
      setTestResult({ testCase: 'Missing API Key Header', status: res.status, response: res.errorDetail || res.data });
    } else if (testCase === 'invalid_key') {
      const res = await fetchApi('/shipments/SHP-0001', {}, 'hacker-secret-key');
      setTestResult({ testCase: 'Invalid API Key Credentials', status: res.status, response: res.errorDetail || res.data });
    } else if (testCase === 'invalid_schema') {
      const res = await fetchApi('/shipments', { method: 'POST', body: JSON.stringify({ items: [] }) });
      setTestResult({ testCase: 'Malformed Request Schema (Missing Fields)', status: res.status, response: res.errorDetail || res.data });
    } else if (testCase === 'rate_limit') {
      await fetchApi('/simulator/trigger-limit', { method: 'POST' });
      const res = await fetchApi('/shipments/SHP-0001');
      setTestResult({ testCase: 'Quota Rate Limit Exhaustion (429)', status: res.status, response: res.errorDetail || res.data });
    }

    setLoading(false);
  };

  const securityProtections = [
    { title: 'API Key Header Authentication', desc: 'Enforces mandatory X-API-Key validation on protected operational endpoints.', code: '401 Unauthorized' },
    { title: 'Token Bucket Rate Limiting', desc: 'Restricts client call frequencies per minute; emits standard Retry-After and X-RateLimit headers.', code: '429 Too Many Requests' },
    { title: 'Strict Request Body Size Limits', desc: 'Middleware rejects request bodies exceeding 1,048,576 bytes (1MB) to prevent denial-of-service.', code: '413 Payload Too Large' },
    { title: 'Pydantic Type & Schema Validation', desc: 'Strict field typing and positive integer assertions prevent SQL injection and invalid payloads.', code: '422 Validation Error' },
    { title: 'Sanitized Error Exceptions', desc: 'Global exception handlers suppress internal Python stack traces and SQL query strings.', code: 'Safe Error Codes' },
    { title: 'CORS & HTTP Method Controls', desc: 'Restricts origin headers and blocks unsupported HTTP methods.', code: '405 Method Not Allowed' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <h2 className="font-display font-bold text-2xl text-white flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-emerald-400" />
          Security Architecture & Misuse Resistance
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Demonstrating zero trust default protections, safe error masking, rate limit safeguards, and misuse resistance.
        </p>
      </div>

      {/* Security Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {securityProtections.map((sp, i) => (
          <div key={i} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-sm text-white">{sp.title}</h3>
              <span className="bg-slate-800 text-emerald-400 border border-slate-700 text-[10px] font-mono px-2 py-0.5 rounded">
                {sp.code}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{sp.desc}</p>
          </div>
        ))}
      </div>

      {/* Interactive Misuse Test Suite */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          Interactive API Misuse Scenario Testbed
        </h3>
        <p className="text-xs text-slate-400">Execute simulated misuse scenarios to observe system defense responses:</p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => runMisuseTest('missing_key')}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-sky-300" />
            Test Missing Auth (401)
          </button>

          <button
            onClick={() => runMisuseTest('invalid_key')}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-sky-300" />
            Test Invalid Key (401)
          </button>

          <button
            onClick={() => runMisuseTest('invalid_schema')}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-amber-300" />
            Test Invalid Schema (422)
          </button>

          <button
            onClick={() => runMisuseTest('rate_limit')}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-amber-300" />
            Test Quota Breach (429)
          </button>
        </div>

        {/* Live Test Result */}
        {testResult && (
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 font-mono text-xs mt-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold">{testResult.testCase}</span>
              <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded font-bold">
                HTTP {testResult.status}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block mb-1">Sanitized Safe Error Response Payload:</span>
              <pre className="text-emerald-300 text-[11px] overflow-x-auto">
                {JSON.stringify(testResult.response, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
