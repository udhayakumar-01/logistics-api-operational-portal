import React, { useState } from 'react';
import { RoleType } from './types';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { DashboardPage } from './pages/DashboardPage';
import { ApiExplorerPage } from './pages/ApiExplorerPage';
import { RateLimitsPage } from './pages/RateLimitsPage';
import { EventEvidencePage } from './pages/EventEvidencePage';
import { FailureInjectorPage } from './pages/FailureInjectorPage';
import { RoleViewsPage } from './pages/RoleViewsPage';
import { ExperimentsPage } from './pages/ExperimentsPage';
import { SecurityPage } from './pages/SecurityPage';
import { DocsPage } from './pages/DocsPage';

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<RoleType>('Partner Developer');
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      
      {/* Top Header with Role Switcher & System Controls */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />

      {/* Main Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'explorer' && <ApiExplorerPage />}
        {activeTab === 'limits' && <RateLimitsPage />}
        {activeTab === 'events' && <EventEvidencePage />}
        {activeTab === 'simulator' && <FailureInjectorPage />}
        {activeTab === 'roles' && <RoleViewsPage currentRole={currentRole} />}
        {activeTab === 'experiments' && <ExperimentsPage />}
        {activeTab === 'security' && <SecurityPage />}
        {activeTab === 'docs' && <DocsPage />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        Logistics API Operational Documentation & Integration Readiness Portal &copy; 2026. All synthetic measurements clearly labeled.
      </footer>

    </div>
  );
};

export default App;
