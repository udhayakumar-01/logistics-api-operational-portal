import React from 'react';
import { 
  LayoutDashboard, 
  Code2, 
  Gauge, 
  Layers, 
  Zap, 
  Users, 
  TrendingUp, 
  ShieldAlert, 
  BookOpen,
  FileText
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'explorer' 
  | 'limits' 
  | 'events' 
  | 'simulator' 
  | 'roles' 
  | 'experiments' 
  | 'security' 
  | 'docs';

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Navigation: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'explorer', label: 'API Explorer', icon: <Code2 className="w-4 h-4" /> },
    { id: 'limits', label: 'Rate Limits', icon: <Gauge className="w-4 h-4" /> },
    { id: 'events', label: 'Events & Evidence', icon: <Layers className="w-4 h-4" /> },
    { id: 'simulator', label: 'Failure Injector', icon: <Zap className="w-4 h-4" /> },
    { id: 'roles', label: 'Role Dashboards', icon: <Users className="w-4 h-4" /> },
    { id: 'experiments', label: 'TTFSI Experiments', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'security', label: 'Security & Misuse', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'docs', label: 'Docs & Risk Register', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <nav className="bg-slate-900/90 border-b border-slate-800 px-6 overflow-x-auto">
      <div className="max-w-7xl mx-auto flex items-center gap-1 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
