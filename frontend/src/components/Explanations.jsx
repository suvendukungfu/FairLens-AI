import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Explanations({ explanations, topFeatures }) {
  if (!explanations || explanations.length === 0) return null;

  const chartData = topFeatures 
    ? Object.entries(topFeatures).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
    : [];

  return (
    <div className="space-y-6">
      {topFeatures && chartData.length > 0 && (
        <div className="glass-card p-6 animate-fade-in-up">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-cyan-500 rounded-full" />
            Feature Importance (Top {chartData.length})
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 60, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsla(180, 70%, ${70 - index * 4}%, 0.8)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500 mt-4 italic text-center">
            * Higher values indicate a stronger influence on model classification decisions.
          </p>
        </div>
      )}

      <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
          AI Explainability Report
        </h3>
        <div className="space-y-4">
          {explanations.map((exp, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/20 hover:border-slate-600/40 transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/20 transition-colors">
                <span className="text-cyan-400 font-bold text-sm">{i + 1}</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{exp}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
