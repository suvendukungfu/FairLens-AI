import { MetricsSkeleton, TableSkeleton } from './Skeleton';

export default function MetricsDashboard({ metrics, comparisons, loading = false }) {
  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in-up" id="metrics-dashboard">
        <MetricsSkeleton />
        <TableSkeleton rows={3} cols={6} />
      </div>
    );
  }

  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="space-y-4 animate-fade-in-up" id="metrics-dashboard">
      <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
        Fairness Metrics
      </h3>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
        {metrics.map((m, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm font-semibold text-slate-300">{m.metric_name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${m.is_biased ? 'badge-high' : 'badge-low'}`}>
                {m.is_biased ? 'BIASED' : 'FAIR'}
              </span>
            </div>
            <p className="text-3xl font-black text-slate-100 mb-1">
              {m.value.toFixed(4)}
            </p>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-slate-500">Threshold:</span>
              <span className="text-xs text-slate-400 font-mono">{m.threshold}</span>
            </div>
            {/* Progress bar showing metric value */}
            <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.min(m.value * 100, 100)}%`,
                  background: m.is_biased
                    ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                    : 'linear-gradient(90deg, #22c55e, #06b6d4)',
                }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-3 leading-relaxed">{m.explanation}</p>
          </div>
        ))}
      </div>

      {/* Group Comparisons */}
      {comparisons && comparisons.length > 0 && (
        <div className="glass-card p-6">
          <h4 className="text-md font-bold text-slate-100 mb-4">Group Comparisons</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Group A</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Group B</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Rate A</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Rate B</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Difference</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Ratio</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((c, i) => (
                  <tr key={i} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 px-4 text-slate-200 font-medium">{c.group_a}</td>
                    <td className="py-3 px-4 text-slate-200 font-medium">{c.group_b}</td>
                    <td className="py-3 px-4 text-right text-slate-300 font-mono">{(c.group_a_rate * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 text-right text-slate-300 font-mono">{(c.group_b_rate * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 text-right font-mono">
                      <span className={c.difference > 0.1 ? 'text-red-400' : 'text-green-400'}>
                        {(c.difference * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300 font-mono">{c.ratio.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
