import React, { useState } from 'react';
import { RoleType } from '../types';
import { ShieldCheck, RefreshCw, Activity, User, Server } from 'lucide-react';
import { fetchApi } from '../services/api';

interface Props {
  currentRole: RoleType;
  onRoleChange: (role: RoleType) => void;
  onResetComplete?: () => void;
}

export const Header: React.FC<Props> = ({ currentRole, onRoleChange, onResetComplete }) => {
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetDemo = async () => {
    setResetting(true);
    const res = await fetchApi('/simulator/reset-demo', { method: 'POST' });
    setResetting(false);
    if (res.status === 200) {
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
      if (onResetComplete) onResetComplete();
    }
  };

  const roles: RoleType[] = ['Seller', 'Carrier', 'Warehouse', 'Partner Developer', 'Operations Admin'];

  return (
    <header className="glass-nav sticky top-0 z-40 px-6 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white leading-tight flex items-center gap-2">
              Logistics API Portal
              <span className="text-xs font-mono font-normal bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full">
                Operational MVP
              </span>
            </h1>
            <p className="text-xs text-slate-400">Interactive API Limits, Failure Behavior & Event Consistency</p>
          </div>
        </div>

        {/* System Controls & Role Selector */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Health status badge */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
            <Server className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">Backend Status:</span>
            <span className="font-semibold text-emerald-400">HTTP 200 OK</span>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={handleResetDemo}
            disabled={resetting}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            {resetSuccess ? 'Demo Reset!' : 'Reset Demo Data'}
          </button>

          {/* Role Switcher Selector */}
          <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1">
            <User className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-medium text-slate-400">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as RoleType)}
              className="bg-transparent text-xs font-semibold text-sky-400 focus:outline-none cursor-pointer"
            >
              {roles.map((r) => (
                <option key={r} value={r} className="bg-slate-900 text-slate-200">
                  {r}
                </option>
              ))}
            </select>
          </div>

        </div>

      </div>
    </header>
  );
};
