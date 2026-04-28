import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

import AlertSystem from './AlertSystem';
import NotificationPanel from './NotificationPanel';

const menuItems = [
  { path: '/overview', label: 'Overview', icon: '', description: 'Executive summary' },
  { path: '/dataset', label: 'Dataset', icon: '', description: 'Data analysis' },
  { path: '/performance', label: 'Performance', icon: '', description: 'Model metrics' },
  { path: '/metrics', label: 'Metrics', icon: '️', description: 'Fairness metrics' },
  { path: '/bias', label: 'Bias Detection', icon: '', description: 'Identify issues' },
  { path: '/mitigation', label: 'Mitigation', icon: '️', description: 'Reduction techniques' },
  { path: '/simulation', label: 'Simulator', icon: '', description: 'Real-time testing' },
  { path: '/timeline', label: 'Timeline', icon: '', description: 'Progress tracking' },
  { path: '/compare', label: 'Compare', icon: '', description: 'Model comparison' },
  { path: '/reports', label: 'Reports', icon: '', description: 'Export & share' },
  { path: '/explain', label: 'Explain', icon: '', description: 'Feature importance' },
];

export default function AppLayout({ children }) {
  const { sidebarCollapsed, toggleSidebar, reset, analysisResult } = useAppStore();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/30 z-40 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between border-b border-slate-700/30">
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-xl font-black bg-linear-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                FairLens AI
              </h1>
              <p className="text-xs text-slate-500">Fairness Platform</p>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-140px)]">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group
                ${isActive
                  ? 'bg-primary-500/20 text-primary-300 border-r-2 border-primary-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }
              `}
              title={sidebarCollapsed ? item.label : ''}
            >
              <span className="text-xl">{item.icon}</span>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{item.label}</div>
                  <div className="text-xs text-slate-500 truncate group-hover:text-slate-400 transition-colors">
                    {item.description}
                  </div>
                </div>
              )}
            </NavLink>
          ))}

          {/* Upload New Dataset */}
          <button
            onClick={reset}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 transition-all mt-8 border-t border-slate-700/30 pt-6"
          >
            <span className="text-xl"></span>
            {!sidebarCollapsed && <span className="font-medium text-sm">Upload New Dataset</span>}
          </button>
        </nav>


      </motion.aside>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-72'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/30">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-slate-200">
                {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <NotificationPanel />

              {/* User Avatar */}
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                U
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children || <Outlet />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Alerts */}
      <AlertSystem />
    </div>
  );
}