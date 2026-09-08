import React from 'react';
import { FreshnessStatus } from '../types';

interface Props {
  status: FreshnessStatus;
  lastUpdated?: string;
  showText?: boolean;
}

export const FreshnessBadge: React.FC<Props> = ({ status, lastUpdated, showText = true }) => {
  let badgeClass = 'badge-unknown';
  let dotClass = 'bg-slate-400';
  let label = status;

  if (status === 'FRESH') {
    badgeClass = 'badge-fresh';
    dotClass = 'bg-emerald-400 animate-pulse';
    label = 'FRESH — Realtime (<2m)';
  } else if (status === 'STALE') {
    badgeClass = 'badge-stale';
    dotClass = 'bg-amber-400 animate-pulse';
    label = 'STALE — Unverified (>2m)';
  } else if (status === 'MISSING') {
    badgeClass = 'badge-missing';
    dotClass = 'bg-rose-500';
    label = 'MISSING — No Signal (>15m)';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${badgeClass}`}>
      <span className={`w-2 h-2 rounded-full ${dotClass}`}></span>
      {showText ? label : status}
      {lastUpdated && <span className="opacity-75 font-mono text-[10px]">({lastUpdated.slice(11, 19)})</span>}
    </span>
  );
};
