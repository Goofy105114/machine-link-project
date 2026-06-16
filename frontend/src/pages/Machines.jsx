import React, { useState } from 'react';
import { 
  FiSearch, FiSliders, FiPlus, FiEdit3, FiTrash2, 
  FiMapPin, FiX, FiMonitor
} from 'react-icons/fi';

const Machines = ({ 
  machines, 
  onCreateMachine, 
  onUpdateMachine, 
  onDeleteMachine, 
  userRole 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modals state
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Form states
  const [nameInput, setNameInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [statusInput, setStatusInput] = useState('Offline');

  // Filtered machines
  const filteredMachines = machines.filter((machine) => {
    const matchesSearch = 
      machine.machine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'All' || machine.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const openAddModal = () => {
    setNameInput('');
    setLocationInput('');
    setStatusInput('Offline');
    setAddModalOpen(true);
  };

  const openEditModal = (machine) => {
    setSelectedMachine(machine);
    setNameInput(machine.machine_name);
    setLocationInput(machine.location);
    setStatusInput(machine.status);
    setEditModalOpen(true);
  };

  const openDetailModal = (machine) => {
    setSelectedMachine(machine);
    setDetailModalOpen(true);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!nameInput || !locationInput) return;
    onCreateMachine({
      machine_name: nameInput,
      location: locationInput,
      status: statusInput
    });
    setAddModalOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!nameInput || !locationInput) return;
    onUpdateMachine(selectedMachine.id, {
      machine_name: nameInput,
      location: locationInput,
      status: statusInput
    });
    setEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Search, Filter & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-dark-panel border border-dark-border rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark-muted">
              <FiSearch className="w-4.5 h-4.5" />
            </div>
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-white placeholder-dark-muted focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark-muted">
              <FiSliders className="w-4 h-4" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-white appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Offline">Offline</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        {/* Add Machine Button (Admin Only) */}
        {userRole === 'admin' && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20"
          >
            <FiPlus className="w-5 h-5" />
            <span>Register Machine</span>
          </button>
        )}
      </div>

      {/* Machine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMachines.length === 0 ? (
          <div className="col-span-full bg-dark-panel border border-dark-border rounded-2xl p-12 text-center text-dark-muted">
            <FiMonitor className="w-12 h-12 mx-auto mb-3" />
            <span className="block font-semibold text-lg text-white">No machines found</span>
            <span className="text-sm mt-1 block">Try adjusting your search query or registering a new machine.</span>
          </div>
        ) : (
          filteredMachines.map((machine) => (
            <div
              key={machine.id}
              className="bg-dark-panel border border-dark-border rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-dark-border/80 transition-all duration-200"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3
                      onClick={() => openDetailModal(machine)}
                      className="font-bold text-lg text-white leading-tight cursor-pointer hover:text-blue-400 transition-colors"
                    >
                      {machine.machine_name}
                    </h3>
                    <span className="text-xs text-dark-muted flex items-center gap-1.5 mt-2">
                      <FiMapPin className="w-3.5 h-3.5" />
                      {machine.location}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    machine.status === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : machine.status === 'Offline'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-emerald-500/0 border-amber-500/20'
                  }`}>
                    {machine.status}
                  </span>
                </div>

                {/* Micro metrics readouts */}
                <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-dark-border/50">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-dark-muted block">Temperature</span>
                    <span className="text-sm font-semibold text-white mt-1 block">
                      {machine.metrics?.temperature ? `${machine.metrics.temperature} °C` : '0 °C'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-dark-muted block">RPM</span>
                    <span className="text-sm font-semibold text-white mt-1 block">
                      {machine.metrics?.rpm ? `${machine.metrics.rpm} RPM` : '0 RPM'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-dark-border/50">
                <button
                  onClick={() => openDetailModal(machine)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  View Details &rarr;
                </button>

                {userRole === 'admin' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(machine)}
                      className="p-2 bg-dark-bg border border-dark-border rounded-lg text-dark-muted hover:text-white hover:border-blue-500/30 transition-all"
                      title="Edit Machine"
                    >
                      <FiEdit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${machine.machine_name}?`)) {
                          onDeleteMachine(machine.id);
                        }
                      }}
                      className="p-2 bg-dark-bg border border-dark-border rounded-lg text-red-405 hover:bg-red-500/10 text-red-400 hover:text-red-400 hover:border-red-500/30 transition-all"
                      title="Delete Machine"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- ADD MACHINE MODAL --- */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-dark-panel border border-dark-border rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Register New Machine</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-dark-muted hover:text-white">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark-muted mb-1.5">
                  Machine Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CNC Milling Arm Sigma"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark-muted mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Assembly Line B"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark-muted mb-1.5">
                  Initial Status
                </label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Offline">Offline</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 bg-dark-bg border border-dark-border text-dark-muted text-sm font-semibold rounded-xl hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl"
                >
                  Add Machine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT MACHINE MODAL --- */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-dark-panel border border-dark-border rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Edit Machine Details</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-dark-muted hover:text-white">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark-muted mb-1.5">
                  Machine Name
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark-muted mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-dark-muted mb-1.5">
                  Current Status
                </label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Offline">Offline</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 bg-dark-bg border border-dark-border text-dark-muted text-sm font-semibold rounded-xl hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DETAILED VIEW MODAL --- */}
      {detailModalOpen && selectedMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-dark-panel border border-dark-border rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5 border-b border-dark-border pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedMachine.machine_name}</h3>
                <span className="text-xs text-dark-muted flex items-center gap-1 mt-1">
                  <FiMapPin className="w-3.5 h-3.5" />
                  {selectedMachine.location}
                </span>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="text-dark-muted hover:text-white">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Content info */}
            <div className="space-y-6">
              {/* Telemetry readout values */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-dark-muted mb-3">Live Telemetry Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-dark-bg border border-dark-border rounded-xl">
                    <span className="text-xs text-dark-muted">Temperature</span>
                    <span className="text-lg font-bold text-white block mt-1">
                      {selectedMachine.metrics?.temperature ? `${selectedMachine.metrics.temperature} °C` : 'N/A'}
                    </span>
                  </div>
                  <div className="p-3 bg-dark-bg border border-dark-border rounded-xl">
                    <span className="text-xs text-dark-muted">Rotation Speed</span>
                    <span className="text-lg font-bold text-white block mt-1">
                      {selectedMachine.metrics?.rpm ? `${selectedMachine.metrics.rpm} RPM` : 'N/A'}
                    </span>
                  </div>
                  <div className="p-3 bg-dark-bg border border-dark-border rounded-xl">
                    <span className="text-xs text-dark-muted">Input Voltage</span>
                    <span className="text-lg font-bold text-white block mt-1">
                      {selectedMachine.metrics?.voltage ? `${selectedMachine.metrics.voltage} V` : 'N/A'}
                    </span>
                  </div>
                  <div className="p-3 bg-dark-bg border border-dark-border rounded-xl">
                    <span className="text-xs text-dark-muted">Electric Current</span>
                    <span className="text-lg font-bold text-white block mt-1">
                      {selectedMachine.metrics?.current ? `${selectedMachine.metrics.current} A` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status details */}
              <div className="flex items-center justify-between p-4 bg-dark-bg border border-dark-border rounded-xl">
                <div>
                  <span className="text-xs text-dark-muted block">Machine State</span>
                  <span className="text-sm font-semibold text-white mt-1 block">{selectedMachine.status}</span>
                </div>
                <div className={`w-3.5 h-3.5 rounded-full ${
                  selectedMachine.status === 'Active' 
                    ? 'bg-emerald-500 animate-ping' 
                    : selectedMachine.status === 'Offline' 
                    ? 'bg-red-500' 
                    : 'bg-amber-500'
                }`} />
              </div>
            </div>
            
            <div className="flex justify-end mt-8 pt-4 border-t border-dark-border">
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Machines;
