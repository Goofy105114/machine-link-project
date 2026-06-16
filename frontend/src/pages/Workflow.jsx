import React, { useState, useEffect } from 'react';
import {
  FiPlusCircle, FiCheckCircle, FiXCircle, FiClock,
  FiMapPin, FiAlertTriangle, FiUser, FiTool, FiFilter
} from 'react-icons/fi';

const STORAGE_KEY = 'machinelink_workflow_requests';

const priorityConfig = {
  High:   { color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20'    },
  Medium: { color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20'  },
  Low:    { color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20'   },
};

const statusConfig = {
  Pending:  { color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  icon: <FiClock className="w-4 h-4" />        },
  Approved: { color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/20', icon: <FiCheckCircle className="w-4 h-4" />   },
  Rejected: { color: 'text-red-400',   bg: 'bg-red-500/10',    border: 'border-red-500/20',    icon: <FiXCircle className="w-4 h-4" />      },
};

const generateId = () => `WF-${Date.now().toString(36).toUpperCase()}`;

const Workflow = ({ userRole, machines }) => {
  const [requests, setRequests] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    machineId: '',
    type: 'Scheduled Maintenance',
    priority: 'Medium',
    description: '',
    requestedBy: 'admin',
  });

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setRequests(JSON.parse(stored));
    } else {
      // Seed some demo requests
      const demo = [
        { id: 'WF-DEMO01', machineId: 1, machineName: 'CNC Milling Machine Alpha', type: 'Scheduled Maintenance', priority: 'Medium', description: 'Monthly lubrication and belt inspection due.', requestedBy: 'operator', status: 'Approved', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), resolvedAt: new Date(Date.now() - 86400000).toISOString(), adminNote: 'Approved. Schedule for Sunday 2AM.' },
        { id: 'WF-DEMO02', machineId: 2, machineName: 'Robotic Welding Arm Beta', type: 'Emergency Repair', priority: 'High', description: 'Temperature threshold exceeded multiple times. Cooling system inspection needed immediately.', requestedBy: 'operator', status: 'Pending', createdAt: new Date(Date.now() - 3600000).toISOString(), resolvedAt: null, adminNote: '' },
        { id: 'WF-DEMO03', machineId: 3, machineName: 'Injection Molding Gamma', type: 'Part Replacement', priority: 'Low', description: 'Conveyor belt shows wear. Request replacement during next planned downtime.', requestedBy: 'operator', status: 'Rejected', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), resolvedAt: new Date(Date.now() - 86400000 * 4).toISOString(), adminNote: 'Part not in stock. Deferred to Q3.' },
      ];
      setRequests(demo);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
    }
  }, []);

  const save = (updated) => {
    setRequests(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const machine = machines.find(m => m.id === parseInt(form.machineId));
    const newRequest = {
      id: generateId(),
      machineId: parseInt(form.machineId),
      machineName: machine ? machine.machine_name : 'Unknown',
      type: form.type,
      priority: form.priority,
      description: form.description,
      requestedBy: form.requestedBy,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      resolvedAt: null,
      adminNote: '',
    };
    save([newRequest, ...requests]);
    setModalOpen(false);
    setForm({ machineId: '', type: 'Scheduled Maintenance', priority: 'Medium', description: '', requestedBy: 'admin' });
  };

  const handleAction = (id, action, note = '') => {
    const updated = requests.map(r =>
      r.id === id
        ? { ...r, status: action, resolvedAt: new Date().toISOString(), adminNote: note }
        : r
    );
    save(updated);
  };

  const filtered = filterStatus === 'All' ? requests : requests.filter(r => r.status === filterStatus);
  const counts = { Pending: requests.filter(r => r.status === 'Pending').length, Approved: requests.filter(r => r.status === 'Approved').length, Rejected: requests.filter(r => r.status === 'Rejected').length };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-panel border border-dark-border rounded-2xl p-5 shadow-xl">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Workflow Management</h3>
          <p className="text-xs text-dark-muted">Submit and manage machine maintenance requests and approval chains</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20"
        >
          <FiPlusCircle className="w-4 h-4" />
          New Request
        </button>
      </div>

      {/* Summary KPI badges */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending Approval', count: counts.Pending, ...statusConfig.Pending },
          { label: 'Approved', count: counts.Approved, ...statusConfig.Approved },
          { label: 'Rejected', count: counts.Rejected, ...statusConfig.Rejected },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} border ${s.border} rounded-2xl p-4 flex items-center gap-4`}>
            <div className={`${s.color} p-2.5 rounded-xl bg-dark-panel/40 border ${s.border}`}>{s.icon}</div>
            <div>
              <span className="text-2xl font-extrabold text-white">{s.count}</span>
              <span className="text-xs text-dark-muted block">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        <FiFilter className="w-4 h-4 text-dark-muted" />
        {['All', 'Pending', 'Approved', 'Rejected'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === s
                ? 'bg-blue-600 text-white'
                : 'bg-dark-panel border border-dark-border text-dark-muted hover:text-white'
            }`}
          >
            {s} {s !== 'All' && `(${counts[s] || 0})`}
          </button>
        ))}
      </div>

      {/* Request list */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-dark-panel border border-dark-border rounded-2xl p-12 text-center text-dark-muted">
            <FiTool className="w-10 h-10 mx-auto mb-3" />
            <span className="block text-white font-semibold">No requests found</span>
            <span className="text-sm mt-1 block">Submit a new maintenance request to get started.</span>
          </div>
        ) : (
          filtered.map(req => {
            const sc = statusConfig[req.status];
            const pc = priorityConfig[req.priority];
            return (
              <div key={req.id} className="bg-dark-panel border border-dark-border rounded-2xl p-5 shadow-xl space-y-4">
                {/* Top row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl ${sc.bg} border ${sc.border} ${sc.color} flex-shrink-0`}>
                      {sc.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-base">{req.type}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pc.bg} ${pc.border} ${pc.color}`}>
                          {req.priority} Priority
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.border} ${sc.color}`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-dark-muted flex-wrap">
                        <span className="flex items-center gap-1"><FiMapPin className="w-3 h-3" />{req.machineName}</span>
                        <span className="flex items-center gap-1"><FiUser className="w-3 h-3" />By: {req.requestedBy}</span>
                        <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />{new Date(req.createdAt).toLocaleString()}</span>
                        <span className="font-mono text-dark-muted/60">{req.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Admin action buttons */}
                  {userRole === 'admin' && req.status === 'Pending' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAction(req.id, 'Approved', 'Approved by admin.')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold rounded-xl transition-all"
                      >
                        <FiCheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleAction(req.id, 'Rejected', 'Rejected by admin.')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold rounded-xl transition-all"
                      >
                        <FiXCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-dark-muted bg-dark-bg border border-dark-border/60 rounded-xl p-3">
                  {req.description}
                </p>

                {/* Admin note if resolved */}
                {req.adminNote && (
                  <div className={`text-xs p-3 rounded-xl border ${sc.bg} ${sc.border} ${sc.color} flex items-start gap-2`}>
                    <FiAlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span><strong>Admin Note:</strong> {req.adminNote} — {req.resolvedAt ? new Date(req.resolvedAt).toLocaleString() : ''}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Request Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-dark-panel border border-dark-border rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Submit Maintenance Request</h3>
              <button onClick={() => setModalOpen(false)} className="text-dark-muted hover:text-white text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-dark-muted mb-1.5">Machine</label>
                  <select required value={form.machineId} onChange={e => setForm({ ...form, machineId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:border-blue-500">
                    <option value="">Select machine</option>
                    {machines.map(m => <option key={m.id} value={m.id}>{m.machine_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-dark-muted mb-1.5">Request Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:border-blue-500">
                    <option>Scheduled Maintenance</option>
                    <option>Emergency Repair</option>
                    <option>Part Replacement</option>
                    <option>Inspection</option>
                    <option>Calibration</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark-muted mb-1.5">Priority</label>
                <div className="flex gap-3">
                  {['Low', 'Medium', 'High'].map(p => (
                    <button type="button" key={p} onClick={() => setForm({ ...form, priority: p })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        form.priority === p
                          ? `${priorityConfig[p].bg} ${priorityConfig[p].border} ${priorityConfig[p].color}`
                          : 'border-dark-border text-dark-muted hover:text-white bg-dark-bg'
                      }`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark-muted mb-1.5">Description</label>
                <textarea required rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the issue or maintenance required..."
                  className="w-full px-3 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-dark-bg border border-dark-border text-dark-muted text-sm font-semibold rounded-xl hover:text-white">
                  Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workflow;
