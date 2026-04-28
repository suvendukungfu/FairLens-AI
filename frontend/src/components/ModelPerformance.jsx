import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ModelPerformance({ performance }) {
  if (!performance) return null;

  const stats = [
    { label: 'Accuracy', value: performance.accuracy, color: '#6366f1' },
    { label: 'Precision', value: performance.precision, color: '#8b5cf6' },
    { label: 'Recall', value: performance.recall, color: '#ec4899' },
    { label: 'F1 Score', value: performance.f1, color: '#f43f5e' },
  ];

  const cm = performance.confusion_matrix; // [[TN, FP], [FN, TP]]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-6">
            <p className="text-sm font-medium text-slate-400 mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{(stat.value * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000" 
                style={{ width: `${stat.value * 100}%`, backgroundColor: stat.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary-500 rounded-full" />
            Confusion Matrix
          </h3>
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="aspect-square bg-slate-800/50 rounded-xl p-4 flex flex-col items-center justify-center border border-slate-700/30">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">True Negative</p>
              <span className="text-2xl font-black text-white">{cm[0][0]}</span>
            </div>
            <div className="aspect-square bg-red-500/10 rounded-xl p-4 flex flex-col items-center justify-center border border-red-500/20">
              <p className="text-[10px] uppercase tracking-wider text-red-400 font-bold mb-1">False Positive</p>
              <span className="text-2xl font-black text-red-400">{cm[0][1]}</span>
            </div>
            <div className="aspect-square bg-amber-500/10 rounded-xl p-4 flex flex-col items-center justify-center border border-amber-500/20">
              <p className="text-[10px] uppercase tracking-wider text-amber-400 font-bold mb-1">False Negative</p>
              <span className="text-2xl font-black text-amber-400">{cm[1][0]}</span>
            </div>
            <div className="aspect-square bg-green-500/10 rounded-xl p-4 flex flex-col items-center justify-center border border-green-500/20">
              <p className="text-[10px] uppercase tracking-wider text-green-400 font-bold mb-1">True Positive</p>
              <span className="text-2xl font-black text-green-400">{cm[1][1]}</span>
            </div>
          </div>
          <div className="mt-8 flex justify-between text-xs text-slate-500 font-medium italic">
            <span>Predicted Negative</span>
            <span>Predicted Positive</span>
          </div>
        </div>

        {/* Accuracy Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary-500 rounded-full" />
            Metric Comparison
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide domain={[0, 1]} />
                <YAxis 
                  dataKey="label" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
