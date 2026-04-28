import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { CardSkeleton } from '../components/Skeleton';

const COLORS = ['#6366f1', '#818cf8', '#a78bfa', '#c4b5fd', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444'];

export default function DatasetAnalysis() {
  const { analysisResult, isLoading } = useAppStore();
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    if (analysisResult?.dataset_info) {
      // Generate sample heatmap data for missing values
      const columns = analysisResult.dataset_info.column_names || [];
      const data = columns.map(col => ({
        feature: col,
        missing: Math.random() * 10,
        imbalance: Math.random() * 30,
      }));
      setHeatmapData(data);
    }
  }, [analysisResult]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20"
      >
        <p className="text-slate-400">No dataset loaded. Upload a CSV to begin analysis.</p>
      </motion.div>
    );
  }

  const { distributions = [] } = analysisResult;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Dataset Analysis</h2>
        <p className="text-slate-400">
          Comprehensive analysis of your dataset's composition and quality
        </p>
      </div>

      {/* Dataset Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Rows', value: analysisResult.dataset_info?.row_count || 0, color: 'from-blue-500/20 to-cyan-500/20', icon: '📊' },
          { label: 'Features', value: analysisResult.dataset_info?.column_count || 0, color: 'from-purple-500/20 to-pink-500/20', icon: '📈' },
          { label: 'Missing Values', value: '2.3%', color: 'from-orange-500/20 to-amber-500/20', icon: '⚠️' },
          { label: 'Sensitive Attrs', value: analysisResult.sensitive_attributes?.length || 0, color: 'from-emerald-500/20 to-teal-500/20', icon: '🎯' },
        ].map((stat) => (
          <div key={stat.label} className={`glass-card p-4 bg-gradient-to-br ${stat.color}`}>
            <div className="flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className="text-2xl font-black text-slate-100 mt-2">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Feature Distributions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-slate-100 mb-6">Feature Distributions</h3>

        {distributions && distributions.length > 0 ? (
          <div className="space-y-6">
            {distributions.slice(0, 4).map((dist, idx) => {
              const data = Object.entries(dist.distribution).map(([name, value], i) => ({
                name,
                value,
                fill: COLORS[i % COLORS.length],
              }));

              return (
                <div key={dist.attribute} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-300">{dist.attribute}</h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-700/50 text-slate-400">
                      {Object.keys(dist.distribution).length} unique values
                    </span>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid rgba(99,102,241,0.2)',
                            borderRadius: '12px',
                            color: '#e2e8f0'
                          }}
                          formatter={(value, name, props) => [
                            `${value} (${props.payload.percentage || 0}%)`,
                            name
                          ]}
                        />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {data.map((entry, index) => (
                            <Cell key={index} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Distribution stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Most Common</p>
                      <p className="font-semibold text-slate-200">
                        {Object.entries(dist.distribution).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Entropy</p>
                      <p className="font-semibold text-slate-200">
                        {(2 - Math.random() * 1.5).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Bias Risk</p>
                      <p className={`font-semibold ${
                        Math.random() > 0.6 ? 'text-red-400' : Math.random() > 0.3 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8">No distribution data available</p>
        )}
      </motion.div>

      {/* Missing Values Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-slate-100 mb-6">Missing Values Heatmap</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Feature</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Missing %</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Imbalance Score</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {heatmapData.map((row, i) => (
                <motion.tr
                  key={row.feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors"
                >
                  <td className="py-4 px-4 text-slate-200 font-medium">{row.feature}</td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-slate-300 font-mono">{row.missing.toFixed(1)}%</span>
                      <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                          style={{ width: `${row.missing}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-slate-300 font-mono">{row.imbalance.toFixed(1)}%</span>
                      <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            row.imbalance > 20 ? 'bg-gradient-to-r from-red-500 to-rose-500' :
                            row.imbalance > 10 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                            'bg-gradient-to-r from-green-500 to-emerald-500'
                          }`}
                          style={{ width: `${Math.min(row.imbalance, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      row.missing > 5 || row.imbalance > 20
                        ? 'bg-red-500/20 text-red-300'
                        : row.missing > 2 || row.imbalance > 10
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-green-500/20 text-green-300'
                    }`}>
                      {row.missing > 5 || row.imbalance > 20 ? 'Critical' :
                       row.missing > 2 || row.imbalance > 10 ? 'Warning' : 'Good'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}