import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Machines from './pages/Machines';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';
import Workflow from './pages/Workflow';
import { dashboardAPI, machinesAPI, alertsAPI, authAPI } from './api';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [machines, setMachines] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load user on startup
  useEffect(() => {
    const storedUser = authAPI.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const fetchData = async () => {
    if (!user) return;
    try {
      const statsRes = await dashboardAPI.getStats();
      if (statsRes.success) {
        setStats(statsRes.data);
      }

      const machinesRes = await machinesAPI.getAll();
      if (machinesRes.success) {
        setMachines(machinesRes.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard telemetry:', error.message);
    }
  };

  // Poll database statistics every 5 seconds
  useEffect(() => {
    if (!user) return;

    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const handleManualSync = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  // CRUD events
  const handleResolveAlert = async (alertId) => {
    try {
      const res = await alertsAPI.resolve(alertId);
      if (res.success) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error.message);
    }
  };

  const handleCreateMachine = async (machineData) => {
    try {
      const res = await machinesAPI.create(machineData);
      if (res.success) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to register machine:', error.message);
    }
  };

  const handleUpdateMachine = async (id, machineData) => {
    try {
      const res = await machinesAPI.update(id, machineData);
      if (res.success) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to edit machine details:', error.message);
    }
  };

  const handleDeleteMachine = async (id) => {
    try {
      const res = await machinesAPI.delete(id);
      if (res.success) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to delete machine:', error.message);
    }
  };

  // Session guard
  if (!user) {
    return <Login onLoginSuccess={setUser} />;
  }

  // Active view router
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            stats={stats}
            machines={machines}
            onResolveAlert={handleResolveAlert}
            userRole={user.role}
          />
        );
      case 'machines':
        return (
          <Machines
            machines={machines}
            onCreateMachine={handleCreateMachine}
            onUpdateMachine={handleUpdateMachine}
            onDeleteMachine={handleDeleteMachine}
            userRole={user.role}
          />
        );
      case 'analytics':
        return <Analytics machines={machines} />;
      case 'workflow':
        return <Workflow machines={machines} userRole={user.role} />;
      case 'pricing':
        return <Pricing />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <Dashboard
            stats={stats}
            machines={machines}
            onResolveAlert={handleResolveAlert}
            userRole={user.role}
          />
        );
    }
  };

  const activeAlertsCount = stats?.kpis?.activeAlertsCount || 0;

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      activeAlertsCount={activeAlertsCount}
      onRefresh={handleManualSync}
      isRefreshing={isRefreshing}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
