import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

const STRATEGIES = [
  { id: 'reweighing', name: 'Reweighing', desc: 'Adjust instance weights to balance group outcomes', icon: '️' },
  { id: 'resampling', name: 'Resampling', desc: 'Over/undersample to balance group sizes', icon: '' },
  { id: 'feature_removal', name: 'Feature Removal', desc: 'Remove sensitive attributes from dataset', icon: '️' },
];

export default function MitigationPanel({ sessionId, sensitiveAttrs, targetColumn, onMitigate, mitigationResult, loading }) {
  const [strategy, setStrategy] = useState('reweighing');

  const handleApply = () => {
    onMitigate(strategy);
  };

  return (
    <div className="space-y-4 animate-fade-in-up" id="mitigation-panel">
      <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384-3.19A1.5 1.5 0 005 13.309V18a1.5 1.5 0 002.036 1.398l5.384-3.19a1.5 1.5 0 000-2.598zM16.5 12a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zM16.5 15.75a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75zM16.5 8.25a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75z" />
        </svg>
        Bias Mitigation
      </h3>

      {/* Strategy Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {STRATEGIES.map((s) => (
          <button
            key={s.id}
            onClick={() => setStrategy(s.id)}
            className={`glass-card p-4 text-left transition-all ${
              strategy === s.id ? 'border-primary-500/50 bg-primary-500/10' : ''
            }`}
            id={`strategy-${s.id}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{s.icon}</span>
              <span className="text-sm font-bold text-slate-200">{s.name}</span>
            </div>
            <p className="text-xs text-slate-400">{s.desc}</p>
          </button>
        ))}
      </div>

      <button
        onClick={handleApply}
        disabled={loading}
        className="btn-primary flex items-center gap-2"
        id="apply-mitigation-btn"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Applying {strategy}...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
            Apply Mitigation
          </>
        )}
      </button>

      {/* Results */}
      {mitigationResult && (
        <div className="space-y-4">
          {/* Improvement Score */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-bold text-slate-100">Mitigation Results</h4>
              <span className="text-2xl font-black text-green-400">
                {mitigationResult.improvement_percentage.toFixed(0)}% Improvement
              </span>
            </div>

            {/* Before/After Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricsColumn title="Before" metrics={mitigationResult.before_metrics} color="#ef4444" />
              <MetricsColumn title="After" metrics={mitigationResult.after_metrics} color="#22c55e" />
            </div>
          </div>

          {/* Before/After Distribution Comparison */}
          {mitigationResult.before_distributions.length > 0 && (
            <div className="glass-card p-6">
              <h4 className="text-md font-bold text-slate-100 mb-4">Distribution Comparison</h4>
              {mitigationResult.before_distributions.map((bd, idx) => {
                const afterDist = mitigationResult.after_distributions[idx];
                if (!afterDist) return null;
                const data = Object.keys(bd.distribution).map((key) => ({
                  name: key,
                  before: bd.percentages[key] || 0,
                  after: afterDist.percentages[key] || 0,
                }));
                return (
                  <div key={bd.attribute} className="mb-6">
                    <p className="text-sm text-slate-400 mb-2">{bd.attribute}</p>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" />
                          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', color: '#e2e8f0' }} />
                          <Legend />
                          <Bar dataKey="before" fill="#ef4444" radius={[4, 4, 0, 0]} name="Before" />
                          <Bar dataKey="after" fill="#22c55e" radius={[4, 4, 0, 0]} name="After" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Explanations */}
          {mitigationResult.explanations.length > 0 && (
            <div className="glass-card p-6">
              <h4 className="text-md font-bold text-slate-100 mb-3">Summary</h4>
              {mitigationResult.explanations.map((e, i) => (
                <p key={i} className="text-sm text-slate-400 mb-1">• {e}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MetricsColumn({ title, metrics, color }) {
  return (
    <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/20">
      <h5 className="text-sm font-bold mb-3" style={{ color }}>{title}</h5>
      {metrics.map((m, i) => (
        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-800/30 last:border-0">
          <span className="text-xs text-slate-400">{m.metric_name}</span>
          <span className="text-sm font-mono text-slate-200">{m.value.toFixed(4)}</span>
        </div>
      ))}
    </div>
  );
}
