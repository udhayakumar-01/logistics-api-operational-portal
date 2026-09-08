import React, { useState } from 'react';
import { EndpointSpec } from '../types';
import { fetchApi } from '../services/api';
import { X, Play, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface Props {
  endpoint: EndpointSpec;
  onClose: () => void;
}

export const TryItModal: React.FC<Props> = ({ endpoint, onClose }) => {
  const [apiKey, setApiKey] = useState('demo-api-key-partner-admin');
  const [paramValues, setParamValues] = useState<{ [key: string]: string }>({
    shipment_id: 'SHP-0001',
    sku: 'SKU-1001',
    entity_id: 'SHP-0001',
    event_id: 'EVT-000001'
  });
  
  const [requestBodyText, setRequestBodyText] = useState(
    JSON.stringify(endpoint.requestBodyExample || {}, null, 2)
  );

  const [loading, setLoading] = useState(false);
  const [responseResult, setResponseResult] = useState<{
    status: number;
    headers: { [key: string]: string };
    body: any;
    durationMs: number;
  } | null>(null);

  const handleExecute = async () => {
    setLoading(true);
    const startTime = performance.now();

    // Substitute path parameters
    let path = endpoint.path;
    if (endpoint.requestParams) {
      endpoint.requestParams.forEach((p) => {
        if (p.type === 'path') {
          const val = paramValues[p.name] || p.example || '1';
          path = path.replace(`{${p.name}}`, val);
        }
      });
    }

    let parsedBody = undefined;
    if (['POST', 'PATCH', 'PUT'].includes(endpoint.method) && requestBodyText.trim()) {
      try {
        parsedBody = JSON.parse(requestBodyText);
      } catch (err) {
        alert('Invalid JSON request body format.');
        setLoading(false);
        return;
      }
    }

    const res = await fetchApi<any>(
      path,
      {
        method: endpoint.method,
        body: parsedBody ? JSON.stringify(parsedBody) : undefined
      },
      apiKey
    );

    const endTime = performance.now();
    const durationMs = Math.round(endTime - startTime);

    const resHeaders: { [key: string]: string } = {};
    res.headers.forEach((val, key) => {
      resHeaders[key] = val;
    });

    let resBodyParsed = res.data || res.errorDetail || res.rawText;

    setResponseResult({
      status: res.status,
      headers: resHeaders,
      body: resBodyParsed,
      durationMs
    });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="glass-card bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                endpoint.method === 'GET'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : endpoint.method === 'POST'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {endpoint.method}
            </span>
            <h3 className="font-mono text-sm text-slate-200">{endpoint.path}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* API Key Header */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">X-API-Key Header</label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-sky-500"
              placeholder="e.g. demo-api-key-partner-admin"
            />
          </div>

          {/* Path Parameters */}
          {endpoint.requestParams && endpoint.requestParams.length > 0 && (
            <div>
              <label className="block text-slate-300 font-semibold mb-2">Request Path Parameters</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {endpoint.requestParams.map((p) => (
                  <div key={p.name}>
                    <span className="text-slate-400 block mb-1 font-mono">{p.name} ({p.type})</span>
                    <input
                      type="text"
                      value={paramValues[p.name] || ''}
                      onChange={(e) => setParamValues({ ...paramValues, [p.name]: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Request Body JSON */}
          {['POST', 'PATCH', 'PUT'].includes(endpoint.method) && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Request Body (JSON)</label>
              <textarea
                value={requestBodyText}
                onChange={(e) => setRequestBodyText(e.target.value)}
                rows={7}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sky-300 font-mono text-xs focus:outline-none focus:border-sky-500"
              />
            </div>
          )}

          {/* Execute Trigger */}
          <div className="pt-2">
            <button
              onClick={handleExecute}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              {loading ? 'Executing Live Request...' : 'Execute Live API Request'}
            </button>
          </div>

          {/* Response Inspector */}
          {responseResult && (
            <div className="mt-6 border-t border-slate-800 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-md font-bold font-mono text-sm ${
                      responseResult.status >= 200 && responseResult.status < 300
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : responseResult.status === 429
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    HTTP {responseResult.status}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {responseResult.durationMs} ms
                  </span>
                </div>

                {responseResult.headers['x-ratelimit-remaining'] && (
                  <div className="text-[11px] font-mono text-sky-400 bg-sky-950/60 px-2.5 py-1 rounded border border-sky-800/60">
                    Quota Remaining: {responseResult.headers['x-ratelimit-remaining']}
                  </div>
                )}
              </div>

              {/* Response Headers */}
              {Object.keys(responseResult.headers).length > 0 && (
                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Response Headers:</span>
                  <div className="bg-slate-950 rounded-lg p-2.5 font-mono text-[11px] text-slate-400 max-h-24 overflow-y-auto">
                    {Object.entries(responseResult.headers).map(([k, v]) => (
                      <div key={k}><span className="text-sky-400">{k}:</span> {v}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Response Payload */}
              <div>
                <span className="text-slate-400 font-semibold block mb-1">Response Payload:</span>
                <pre className="bg-slate-950 rounded-lg p-3 font-mono text-xs text-emerald-300 max-h-60 overflow-y-auto border border-slate-800">
                  {typeof responseResult.body === 'object'
                    ? JSON.stringify(responseResult.body, null, 2)
                    : responseResult.body}
                </pre>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
