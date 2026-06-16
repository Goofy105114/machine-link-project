import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children, activeTab, setActiveTab, activeAlertsCount, onRefresh, isRefreshing }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-dark-bg text-dark-text overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar
          activeTab={activeTab}
          activeAlertsCount={activeAlertsCount}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 bg-dark-bg">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
