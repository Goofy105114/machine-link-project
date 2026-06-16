import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  FiMonitor, FiCheckCircle, FiAlertTriangle, FiSliders, 
  FiActivity, FiMapPin, FiClock, FiCheckSquare 
} from 'react-icons/fi';
import { alertsAPI } from '../api';

const Dashboard = ({ stats, machines, onResolveAlert, userRole }) => {
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const { kpis, statusDistribution, recentAlerts } = stats;

  const kpiCards = [
    {
      title: 'Total Machines',
      value: kpis.totalMachines,
      icon: <FiMonitor className="w-5 h-5" />,
      color: 'from-blue-600/20 to-blue-500/5',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400'
    },
    {
      title: 'Active',
      value: kpis.activeMachines,
      icon: <FiCheckCircle className="w-5 h-5" />,
      color: 'from-emerald-600/20 to-emerald-500/5',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400'
    },
    {
      title: 'Offline',
      value: kpis.offlineMachines,
      icon: <FiAlertTriangle className="w-5 h-5" />,
      color: 'from-red-600/20 to-red-500/5',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400'
    },
    {
      title: 'Maintenance',
      value: kpis.maintenanceMachines,
      icon: <FiSliders className="w-5 h-5" />,
      color: 'from-amber-600/20 to-amber-500/5',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400'
    },
    {
      title: 'Avg Temperature',
      value: `${kpis.averageTemperature} °C`,
      icon: <FiActivity className="w-5 h-5" />,
      color: 'from-indigo-600/20 to-indigo-500/5',
      borderColor: 'border-indigo-500/30',
      textColor: 'text-indigo-400'
    },
    {
      title: 'Avg Rotation Speed',
      value: `${kpis.averageRpm} RPM`,
      icon: <FiActivity className="w-5 h-5" />,
      color: 'from-purple-600/20 to-purple-500/5',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((kpi, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br ${kpi.color} border ${kpi.borderColor} rounded-2xl p-5 shadow-lg flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-dark-muted">
                {kpi.title}
              </span>
              <div className={`${kpi.textColor} p-2 rounded-lg bg-dark-panel/40 border border-dark-border/50`}>
                {kpi.icon}
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold tracking-tight text-white">{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Status Chart & Alerts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Status Distribution Pie Chart */}
        <div className="lg:col-span-4 bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Status Distribution</h3>
            <p className="text-xs text-dark-muted mb-4">Current distribution of machines status</p>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Active Alerts Panel */}
        <div className="lg:col-span-8 bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Live Active Alerts</h3>
              <p className="text-xs text-dark-muted">Real-time status alerts requiring operator response</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/10 border border-red-500/20 text-red-400">
              {recentAlerts.length} Active
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-64 pr-2 space-y-3">
            {recentAlerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-dark-muted text-sm">
                <FiCheckCircle className="w-12 h-12 text-emerald-500 mb-2" />
                <span>All systems nominal. No alerts active.</span>
              </div>
            ) : (
              recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 bg-dark-bg border border-dark-border/80 rounded-xl hover:border-dark-border transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg mt-0.5 ${
                      alert.severity === 'Critical' 
                        ? 'bg-red-550/10 text-red-500 border border-red-500/20' 
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      <FiAlertTriangle className="w-4 h-4 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white leading-tight">{alert.message}</h4>
                      <div className="flex items-center gap-4 mt-2 text-xs text-dark-muted">
                        <span className="flex items-center gap-1">
                          <FiClock className="w-3.5 h-3.5" />
                          {new Date(alert.created_at).toLocaleTimeString()}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          alert.severity === 'Critical' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {userRole === 'admin' && (
                    <button
                      onClick={() => onResolveAlert(alert.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-650 hover:bg-emerald-600 border border-emerald-500/20 hover:border-emerald-500 text-xs font-semibold text-emerald-400 hover:text-white transition-all"
                      style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                    >
                      <FiCheckSquare className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Grid of Machines (Live Monitor Grid) */}
      <div className="bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-xl">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-white mb-1">Live Telemetry Monitor</h3>
          <p className="text-xs text-dark-muted">Current status of all registered factory machines</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {machines.slice(0, 6).map((machine) => (
            <div
              key={machine.id}
              className="bg-dark-bg border border-dark-border/80 rounded-xl p-5 space-y-4 hover:border-blue-500/30 transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-base leading-tight">{machine.machine_name}</h4>
                  <span className="text-xs text-dark-muted flex items-center gap-1.5 mt-1.5">
                    <FiMapPin className="w-3.5 h-3.5" />
                    {machine.location}
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  machine.status === 'Active'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : machine.status === 'Offline'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {machine.status}
                </span>
              </div>

              {/* Metrics Readout */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-dark-border/50">
                <div className="p-2.5 rounded-lg bg-dark-panel/40 border border-dark-border/30">
                  <span className="text-[10px] uppercase font-bold text-dark-muted block mb-1">Temperature</span>
                  <span className={`text-base font-bold ${
                    machine.metrics?.temperature > 85 ? 'text-red-400 animate-pulse' : 'text-white'
                  }`}>
                    {machine.metrics?.temperature ? `${machine.metrics.temperature} °C` : '0 °C'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-dark-panel/40 border border-dark-border/30">
                  <span className="text-[10px] uppercase font-bold text-dark-muted block mb-1">RPM</span>
                  <span className={`text-base font-bold ${
                    machine.metrics?.rpm > 4500 ? 'text-amber-400' : 'text-white'
                  }`}>
                    {machine.metrics?.rpm ? `${machine.metrics.rpm} RPM` : '0 RPM'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-dark-panel/40 border border-dark-border/30">
                  <span className="text-[10px] uppercase font-bold text-dark-muted block mb-1">Voltage</span>
                  <span className="text-sm font-semibold text-white">
                    {machine.metrics?.voltage ? `${machine.metrics.voltage} V` : '0 V'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-dark-panel/40 border border-dark-border/30">
                  <span className="text-[10px] uppercase font-bold text-dark-muted block mb-1">Current</span>
                  <span className="text-sm font-semibold text-white">
                    {machine.metrics?.current ? `${machine.metrics.current} A` : '0 A'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
