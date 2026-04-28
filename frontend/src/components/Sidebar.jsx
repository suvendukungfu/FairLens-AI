import { useState, useEffect } from 'react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: '', description: 'Executive summary & risk score' },
  { id: 'dataset', label: 'Dataset Analysis', icon: '', description: 'Distribution & feature analysis' },
  { id: 'performance', label: 'Model Performance', icon: '', description: 'Accuracy, F1 & Confusion Matrix' },
  { id: 'metrics', label: 'Fairness Metrics', icon: '️', description: 'Detailed fairness analysis' },
  { id: 'flags', label: 'Bias Detection', icon: '', description: 'Detected bias patterns' },
  { id: 'mitigation', label: 'Mitigation', icon: '️', description: 'Bias reduction strategies' },
  { id: 'reports', label: 'Reports', icon: '', description: 'Generate audit report' },
];

export default function Sidebar({ activeTab, onTabChange, isCollapsed, onToggleCollapse }) {
  const tabs = ['overview', 'metrics', 'flags', 'mitigation', 'explain'];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.closest('aside')) {
        const currentIndex = tabs.indexOf(activeTab);

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % tabs.length;
          onTabChange(tabs[nextIndex]);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
          onTabChange(tabs[prevIndex]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, onTabChange]);

  return (
    <>
      {/* Mobile overlay trigger */}
      <button
        onClick={onToggleCollapse}
        className="fixed top-20 left-4 z-50 lg:hidden bg-slate-900/95 backdrop-blur-lg border border-slate-700/30 rounded-lg p-2 shadow-lg"
        aria-label="Open navigation menu"
      >
        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-slate-900/95 backdrop-blur-lg border-r border-slate-700/30 transition-all duration-300 z-40 ${
        isCollapsed ? 'w-16 -translate-x-full lg:translate-x-0 lg:w-16' : 'w-64 translate-x-0'
      } lg:translate-x-0`}>
      <div className="p-4">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
              isCollapsed ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <nav className="px-3 space-y-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
              activeTab === tab.id
                ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30 shadow-lg shadow-primary-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border border-transparent'
            }`}
            title={isCollapsed ? tab.label : ''}
            aria-label={`Navigate to ${tab.label} tab`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <span className="text-lg shrink-0">{tab.icon}</span>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{tab.label}</div>
                <div className="text-xs text-slate-500 truncate group-hover:text-slate-400 transition-colors">
                  {tab.description}
                </div>
              </div>
            )}
            {activeTab === tab.id && !isCollapsed && (
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </nav>
    </aside>

    {/* Mobile overlay */}
    {!isCollapsed && (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
        onClick={onToggleCollapse}
      />
    )}
    </>
  );
}