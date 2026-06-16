import React, { useState } from 'react';
import { FiSliders, FiBell, FiUser, FiShield, FiSave, FiAlertCircle } from 'react-icons/fi';
import { authAPI } from '../api';

const Settings = () => {
  const user = authAPI.getCurrentUser() || { username: 'Admin', email: 'admin@machinelink.io', role: 'admin' };
  
  // States for thresholds (for demonstration, saved in local state/simulated)
  const [tempThreshold, setTempThreshold] = useState('85.0');
  const [rpmThreshold, setRpmThreshold] = useState('4500');
  const [refreshInterval, setRefreshInterval] = useState('5');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [criticalAlertsOnly, setCriticalAlertsOnly] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const handleSaveThresholds = (e) => {
    e.preventDefault();
    setSavedMsg('Settings saved successfully (Local Override active)');
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dark-panel border border-dark-border rounded-2xl p-5 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-1">System Configuration</h3>
        <p className="text-xs text-dark-muted">Manage alarm limits, notifications, and user settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Threshold Configuration */}
        <div className="lg:col-span-2 bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-dark-border pb-4">
            <FiSliders className="w-5 h-5 text-blue-500" />
            <h4 className="font-bold text-white text-base">Alarms & Limits</h4>
          </div>

          {savedMsg && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm flex items-center gap-3">
              <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{savedMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveThresholds} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark-muted mb-2">
                  Temperature Trigger Limit (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={tempThreshold}
                  onChange={(e) => setTempThreshold(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                />
                <span className="text-[10px] text-dark-muted mt-1 block">
                  Triggers Critical Alert if exceeded. Default: 85°C.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark-muted mb-2">
                  RPM Trigger Limit (RPM)
                </label>
                <input
                  type="number"
                  value={rpmThreshold}
                  onChange={(e) => setRpmThreshold(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                />
                <span className="text-[10px] text-dark-muted mt-1 block">
                  Triggers Warning Alert if exceeded. Default: 4500 RPM.
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-dark-muted mb-2">
                Simulator telemetry update interval (seconds)
              </label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="2">2 seconds</option>
                <option value="5">5 seconds (Recommended)</option>
                <option value="10">10 seconds</option>
                <option value="30">30 seconds</option>
              </select>
            </div>

            {/* Notifications switches */}
            <div className="pt-4 border-t border-dark-border space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-dark-muted flex items-center gap-1.5">
                <FiBell className="w-4 h-4 text-blue-400" />
                Notification Controls
              </h5>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-white block">Email Dispatch Alerts</span>
                  <span className="text-xs text-dark-muted">Send email notification when telemetry limits breach</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`w-11 h-6 rounded-full transition-all relative ${
                    emailAlerts ? 'bg-blue-600' : 'bg-dark-bg border border-dark-border'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 left-1 transition-all ${
                    emailAlerts ? 'translate-x-5' : ''
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-white block">Critical Alerts Only</span>
                  <span className="text-xs text-dark-muted">Do not dispatch notices for intermediate warnings</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCriticalAlertsOnly(!criticalAlertsOnly)}
                  className={`w-11 h-6 rounded-full transition-all relative ${
                    criticalAlertsOnly ? 'bg-blue-600' : 'bg-dark-bg border border-dark-border'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 left-1 transition-all ${
                    criticalAlertsOnly ? 'translate-x-5' : ''
                  }`} />
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-dark-border">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20"
              >
                <FiSave className="w-4.5 h-4.5" />
                <span>Save Config</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: User profile card */}
        <div className="bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-dark-border pb-4 mb-5">
              <FiUser className="w-5 h-5 text-blue-500" />
              <h4 className="font-bold text-white text-base">Operator Session</h4>
            </div>

            <div className="flex flex-col items-center py-6 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-3xl font-extrabold uppercase mb-4">
                {user.username[0]}
              </div>
              <h4 className="text-lg font-bold text-white leading-tight">{user.username}</h4>
              <span className="text-xs text-dark-muted uppercase font-semibold tracking-wider mt-1 block">
                {user.role} Privilege
              </span>
            </div>

            <div className="space-y-4 pt-4 border-t border-dark-border">
              <div>
                <span className="text-[10px] uppercase font-bold text-dark-muted block">Registered Email</span>
                <span className="text-sm font-semibold text-white mt-1 block">{user.email}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-dark-muted block">Security Group</span>
                <span className="text-sm font-semibold text-white mt-1 block flex items-center gap-1.5">
                  <FiShield className="w-4 h-4 text-emerald-400" />
                  {user.role === 'admin' ? 'Root Administrative Access' : 'Standard Read-Only Operator'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-center pt-8 text-[10px] text-dark-muted">
            AWS Cloud Platform Ready / CloudWatch Configured
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
