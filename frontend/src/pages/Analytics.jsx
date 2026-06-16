import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LineChart, Line 
} from 'recharts';
import { FiTrendingUp, FiActivity, FiCpu, FiLayers } from 'react-icons/fi';
import { metricsAPI } from '../api';

const Analytics = ({ machines }) => {
  const [selectedMachineId, setSelectedMachineId] = useState('all');
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        if (selectedMachineId === 'all') {
          const res = await metricsAPI.getAll(80);
          if (res.success) {
            setMetricsHistory(res.data);
          }
        } else {
          const res = await metricsAPI.getByMachineId(selectedMachineId, 50);
          if (res.success) {
            setMetricsHistory(res.data);
          }
        }
      } catch (err) {
        console.error('Error fetching analytics metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    // Poll analytics metrics every 5 seconds to match simulator
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, [selectedMachineId]);

  // Format timestamps for display on charts
  const chartData = metricsHistory.map((m) => ({
    ...m,
    time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    temp: parseFloat(m.temperature),
    speed: parseInt(m.rpm, 10),
    machine: m.machine_name || `Machine ${m.machine_id}`
  }));

  // Calculations for KPI summaries
  const getKpiStats = () => {
    if (chartData.length === 0) return { avgTemp: 0, maxTemp: 0, avgRpm: 0, maxRpm: 0 };
    
    const temps = chartData.map(d => d.temp);
    const rpms = chartData.map(d => d.speed);
    
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const maxTemp = Math.max(...temps);
    const avgRpm = rpms.reduce((a, b) => a + b, 0) / rpms.length;
    const maxRpm = Math.max(...rpms);

    return {
      avgTemp: avgTemp.toFixed(1),
      maxTemp: maxTemp.toFixed(1),
      avgRpm: Math.round(avgRpm),
      maxRpm: maxRpm
    };
  };

  const kpis = getKpiStats();

  return (
    <div className="space-y-6">
      {/* Top Header & Select controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-panel border border-dark-border rounded-2xl p-5 shadow-xl">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Performance Analytics</h3>
          <p className="text-xs text-dark-muted">Inspect telemetry charts and check anomalies</p>
        </div>

        {/* Machine Selector */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark-muted">
            <FiCpu className="w-4 h-4" />
          </div>
          <select
            value={selectedMachineId}
            onChange={(e) => setSelectedMachineId(e.target.value)}
            className="pl-10 pr-8 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-white appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm w-full sm:w-64"
          >
            <option value="all">All Registered Machines</option>
            {machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.machine_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Analytics Summary Panels */}
      {selectedMachineId !== 'all' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-dark-panel border border-dark-border rounded-2xl p-4 shadow-lg">
            <span className="text-xs text-dark-muted font-semibold uppercase tracking-wider block">Average Temp</span>
            <span className="text-xl font-extrabold text-white mt-1 block">{kpis.avgTemp} °C</span>
          </div>
          <div className="bg-dark-panel border border-dark-border rounded-2xl p-4 shadow-lg">
            <span className="text-xs text-dark-muted font-semibold uppercase tracking-wider block">Max Temp Peak</span>
            <span className="text-xl font-extrabold text-red-400 mt-1 block">{kpis.maxTemp} °C</span>
          </div>
          <div className="bg-dark-panel border border-dark-border rounded-2xl p-4 shadow-lg">
            <span className="text-xs text-dark-muted font-semibold uppercase tracking-wider block">Average RPM</span>
            <span className="text-xl font-extrabold text-white mt-1 block">{kpis.avgRpm} RPM</span>
          </div>
          <div className="bg-dark-panel border border-dark-border rounded-2xl p-4 shadow-lg">
            <span className="text-xs text-dark-muted font-semibold uppercase tracking-wider block">Max RPM Peak</span>
            <span className="text-xl font-extrabold text-amber-400 mt-1 block">{kpis.maxRpm} RPM</span>
          </div>
        </div>
      )}

      {/* Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Chart */}
        <div className="bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="font-bold text-white text-base">Temperature Trend (°C)</h4>
            <span className="text-xs text-dark-muted">Real-time thermal behavior</span>
          </div>

          <div className="h-72">
            {loading && chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-dark-muted text-sm">
                No telemetry data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={10} domain={['auto', 'auto']} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="temp" 
                    name={selectedMachineId === 'all' ? 'Temperature (°C)' : 'Machine Temp (°C)'} 
                    stroke="#2563eb" 
                    fillOpacity={1} 
                    fill="url(#colorTemp)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* RPM Chart */}
        <div className="bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="font-bold text-white text-base">Rotation Speed Trend (RPM)</h4>
            <span className="text-xs text-dark-muted">Real-time speed behavior</span>
          </div>

          <div className="h-72">
            {loading && chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-dark-muted text-sm">
                No telemetry data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRpm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={10} domain={['auto', 'auto']} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="speed" 
                    name={selectedMachineId === 'all' ? 'RPM' : 'Machine RPM'} 
                    stroke="#d97706" 
                    fillOpacity={1} 
                    fill="url(#colorRpm)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
