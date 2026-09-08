import React from 'react';
import { RoleType } from '../types';
import { Users, Truck, Warehouse as WHIcon, ShoppingBag, Code2, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

interface Props {
  currentRole: RoleType;
}

export const RoleViewsPage: React.FC<Props> = ({ currentRole }) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-sky-400" />
            Role-Based Operational Dashboard
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Customized operational view tailored for <span className="text-sky-400 font-semibold">{currentRole}</span> persona.
          </p>
        </div>
      </div>

      {/* Seller Dashboard */}
      {currentRole === 'Seller' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Active Seller Shipments</span>
              <span className="font-display font-bold text-2xl text-white">1,250</span>
              <span className="text-[11px] text-emerald-400 block mt-2 font-semibold">98.4% On-Time Dispatch</span>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Rate Limit Usage</span>
              <span className="font-display font-bold text-2xl text-sky-400">32 / 100 req/min</span>
              <span className="text-[11px] text-slate-400 block mt-2">Standard Tier Quota</span>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Observed API Errors</span>
              <span className="font-display font-bold text-2xl text-amber-400">2 Errors (24h)</span>
              <span className="text-[11px] text-slate-400 block mt-2">Both resolved via retry</span>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-sky-400" />
              Seller Integration Quick Actions
            </h3>
            <p className="text-xs text-slate-400">Create new shipment orders and verify warehouse inventory stock.</p>
            
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
              <span className="text-sky-400 font-bold block mb-1">Endpoint: POST /api/v1/shipments</span>
              <span>Header: X-API-Key: demo-api-key-seller-001</span>
            </div>
          </div>
        </div>
      )}

      {/* Carrier Dashboard */}
      {currentRole === 'Carrier' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Assigned Vehicles & Drivers</span>
              <span className="font-display font-bold text-2xl text-white">120 Active Vehicles</span>
              <span className="text-[11px] text-emerald-400 block mt-2 font-semibold font-mono">100 Carriers Online</span>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Duplicate Events Filtered</span>
              <span className="font-display font-bold text-2xl text-indigo-400">450 Duplicates</span>
              <span className="text-[11px] text-slate-400 block mt-2">Ignored safely without corrupting state</span>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Out-of-Order Vehicle Scans</span>
              <span className="font-display font-bold text-2xl text-amber-400">310 Out-of-Order</span>
              <span className="text-[11px] text-slate-400 block mt-2">Sequence Monotone enforced</span>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-400" />
              Carrier Vehicle Event Ingestion Rule
            </h3>
            <p className="text-xs text-slate-400">All mobile vehicle scans must supply a monotonically increasing <code className="text-sky-400">sequence_number</code>.</p>
          </div>
        </div>
      )}

      {/* Warehouse Dashboard */}
      {currentRole === 'Warehouse' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Active Fulfillment Hubs</span>
              <span className="font-display font-bold text-2xl text-white">50 Warehouses</span>
              <span className="text-[11px] text-emerald-400 block mt-2 font-semibold">1,000 Catalog SKUs</span>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Stock Freshness Status</span>
              <span className="font-display font-bold text-2xl text-emerald-400">85% FRESH</span>
              <span className="text-[11px] text-slate-400 block mt-2">13% STALE, 2% MISSING</span>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Average Occupancy</span>
              <span className="font-display font-bold text-2xl text-sky-400">64.5% Capacity</span>
              <span className="text-[11px] text-slate-400 block mt-2">Optimal inventory balance</span>
            </div>
          </div>
        </div>
      )}

      {/* Partner Developer Dashboard */}
      {currentRole === 'Partner Developer' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-sky-400" />
              Partner Integration Readiness Checklist
            </h3>
            <p className="text-xs text-slate-400">Follow these 9 steps to achieve successful integration in under 20 minutes.</p>

            <div className="space-y-2 text-xs font-mono">
              {[
                { step: 'Step 1', label: 'Get API Key (demo-api-key-partner-admin)', done: true },
                { step: 'Step 2', label: 'Test Authentication Header on GET /api/v1/health', done: true },
                { step: 'Step 3', label: 'Inspect Operational Limits on GET /api/v1/limits', done: true },
                { step: 'Step 4', label: 'Execute POST /api/v1/shipments order creation', done: true },
                { step: 'Step 5', label: 'Read shipment details on GET /api/v1/shipments/{id}', done: true },
                { step: 'Step 6', label: 'Ingest PICKED_UP event on POST /api/v1/events', done: true },
                { step: 'Step 7', label: 'Handle duplicate event re-transmission safely', done: true },
                { step: 'Step 8', label: 'Inspect evidence trace on GET /api/v1/evidence/{id}', done: true },
                { step: 'Step 9', label: 'Complete First Successful Integration (TTFSI Measured)', done: true },
              ].map((s) => (
                <div key={s.step} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-sky-400 font-bold">{s.step}: {s.label}</span>
                  <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> VERIFIED</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Operations Admin Dashboard */}
      {currentRole === 'Operations Admin' && (
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Marketplace Operations & Risk Monitor
            </h3>
            <p className="text-xs text-slate-400">Full administrative visibility into system rate limits, errors, event consistency, and evidence audit trails.</p>
          </div>
        </div>
      )}

    </div>
  );
};
