import React from 'react';
import { FiActivity, FiAlertTriangle, FiCheckCircle, FiBell } from 'react-icons/fi';

const Navbar = ({ activeTab, activeAlertsCount, onRefresh, isRefreshing }) => {
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'System Overview';
      case 'machines':
        return 'Machine Registry';
      case 'analytics':
        return 'Telemetry Analytics';
      case 'settings':
        return 'Settings & Thresholds';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="h-16 bg-dark-panel border-b border-dark-border px-6 flex items-center justify-between text-dark-text">
      {/* Page Title & Breadcrumbs */}
      <div>
        <h1 className="text-xl font-bold tracking-wide">{getPageTitle()}</h1>
        <p className="text-xs text-dark-muted hidden sm:block">
          MachineLink Industrial IoT Platform / {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </p>
      </div>

      {/* Global Alerts & System Status Indicators */}
      <div className="flex items-center gap-4">
        {/* Refresh Indicator */}
        <button
          onClick={onRefresh}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dark-border hover:bg-dark-card text-xs font-semibold text-dark-muted hover:text-white transition-all ${
            isRefreshing ? 'animate-pulse' : ''
          }`}
          disabled={isRefreshing}
        >
          <FiActivity className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : 'text-blue-400'}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Sync Data'}</span>
        </button>

        {/* System Health Status Badge */}
        {activeAlertsCount > 0 ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 animate-pulse">
            <FiAlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold uppercase tracking-wider hidden md:inline">Alerts Triggered</span>
            <span className="text-xs font-extrabold bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
              {activeAlertsCount}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <FiCheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider hidden md:inline">System Healthy</span>
          </div>
        )}

        {/* Notification Bell Icon */}
        <div className="relative p-2 rounded-lg bg-dark-card border border-dark-border text-dark-muted hover:text-white cursor-pointer transition-colors">
          <FiBell className="w-4.5 h-4.5" />
          {activeAlertsCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-505 bg-red-500 rounded-full ring-2 ring-dark-panel animate-ping"></span>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
