import React from 'react';
import { FiCpu, FiLayers, FiMonitor, FiTrendingUp, FiSettings, FiLogOut, FiMenu, FiChevronLeft, FiDollarSign, FiGitPullRequest } from 'react-icons/fi';
import { authAPI } from '../api';

const Sidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const user = authAPI.getCurrentUser() || { username: 'Operator', role: 'operator' };

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <FiLayers className="w-5 h-5" /> },
    { id: 'machines', name: 'Machines', icon: <FiMonitor className="w-5 h-5" /> },
    { id: 'analytics', name: 'Analytics', icon: <FiTrendingUp className="w-5 h-5" /> },
    { id: 'workflow', name: 'Workflow', icon: <FiGitPullRequest className="w-5 h-5" /> },
    { id: 'pricing', name: 'Pricing', icon: <FiDollarSign className="w-5 h-5" /> },
    { id: 'settings', name: 'Settings', icon: <FiSettings className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    authAPI.logout();
    window.location.reload();
  };

  return (
    <aside
      className={`bg-dark-panel border-r border-dark-border text-dark-text flex flex-col justify-between transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-dark-border">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-blue-600 rounded-lg text-white flex-shrink-0">
              <FiCpu className="w-5 h-5" />
            </div>
            {!collapsed && (
              <span className="font-bold text-lg tracking-wider text-blue-500 whitespace-nowrap">
                Machine<span className="text-white">Link</span>
              </span>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-dark-card text-dark-muted hover:text-white transition-colors"
          >
            {collapsed ? <FiMenu className="w-5 h-5" /> : <FiChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 px-3 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-900/30'
                    : 'text-dark-muted hover:bg-dark-card hover:text-white'
                }`}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                {!collapsed && <span className="text-sm tracking-wide">{item.name}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-dark-border">
        {!collapsed ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold uppercase">
                {user.username[0]}
              </div>
              <div className="overflow-hidden">
                <h4 className="text-sm font-semibold truncate leading-tight">{user.username}</h4>
                <span className="text-xs text-dark-muted uppercase font-semibold tracking-wider">
                  {user.role}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-650 hover:bg-red-700/80 border border-red-905/20 text-red-400 hover:text-white text-sm font-medium rounded-xl transition-all duration-200"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
            >
              <FiLogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold uppercase cursor-help" title={`${user.username} (${user.role})`}>
              {user.username[0]}
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
              title="Sign Out"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
