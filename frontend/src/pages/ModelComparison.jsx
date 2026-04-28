import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { CardSkeleton } from '../components/Skeleton';

const mockModels = [
  {
    id: 'original',
    name: 'Original Model',
    color: '#ef4444',
    metrics: {
      'Demographic Parity': 65,
      'Equal Opportunity': 72,
      'Disparate Impact': 68,
      'Equalized Odds': 70,
      'Calibration': 85,
    },
  },
  {
    id: 'reweighted',
    name: 'Reweighted',
    color: '#6366f1',
    metrics: {
      'Demographic Parity': 78,
      'Equal Opportunity': 75,
      'Disparate Impact': 82,
      'Equalized Odds': 77,
      'Calibration': 83,
    },
  },
  {
    id: 'adversarial',
    name: 'Adversarial',
    color: '#22c55e',
    metrics: {
      'Demographic Parity': 85,
      'Equal Opportunity': 80,
      'Disparate Impact': 88,
      'Equalized Odds': 82,
      'Calibration': 79,
    },
  },
  {
    id: 'fairlearn',
    name: 'Fairlearn Post',
    color: '#f59e0b',
    metrics: {
      'Demographic Parity': 82,
      'Equal Opportunity': 86,
      'Disparate Impact': 84,
      'Equalized Odds': 85,
      'Calibration': 87,
    },
  },
];

export default function ModelComparison() {
  const { analysisResult } = useAppStore();
  const [selectedMetrics, setSelectedMetrics] = useState(['Demographic Parity', 'Equal Opportunity', 'Disparate Impact']);
  const [viewType, setViewType] = useState('radar'); // 'radar' | 'bar' | 'table'

  const radarData = Object.keys(mockModels[0].metrics).map(metric => ({
    metric,
    ...mockModels.reduce((acc, model) => ({
      ...acc,
      [model.id]: model.metrics[metric],
    }), {}),
  })).filter(d => selectedMetrics.includes(d.metric));

  const comparisonStats = selectedMetrics.map(metric => {
    const values = mockModels.map(m => m.metrics[metric]);
    const best = Math.max(...values);
    const worst = Math.min(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    return { metric, best, worst, avg };
  });

  if (!analysisResult) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20"
      >
        <p className="text-slate-400">Complete analysis to compare models</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Multi-Model Comparison</h2>
        <p className="text-slate-400">
          Compare fairness across different debiasing strategies and model variants
        </p>
      </div>

      {/* Model Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Select Models to Compare</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockModels.map((model, idx) => (
            <motion.button
              key={model.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`p-4 rounded-xl border-2 transition-all ${
                true // All models visible by default
                  ? 'bg-slate-800/50 border-slate-600/30 hover:border-primary-500/50'
                  : 'border-slate-700/30 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: model.color }}
                />
                <span className={`font-medium ${true ? 'text-slate-200' : 'text-slate-500'}`}>
                  {model.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Avg: {Object.values(model.metrics).reduce((a, b) => a + b, 0) / 5 | 0}%
              </p>
            </motion.button>
          ))}
        </div>

        {/* Metrics Filter */}
        <div className="mt-6">
          <label className="text-sm text-slate-400 mb-2 block">Metrics to Compare</label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(mockModels[0].metrics).map(metric => (
              <button
                key={metric}
                onClick={() => {
                  if (selectedMetrics.includes(metric)) {
                    setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
                  } else if (selectedMetrics.length < 6) {
                    setSelectedMetrics([...selectedMetrics, metric]);
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                  selectedMetrics.includes(metric)
                    ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                    : 'bg-slate-700/50 text-slate-500 hover:text-slate-300'
                }`}
              >
                {metric}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Visualizations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          {['radar', 'bar', 'table'].map(view => (
            <button
              key={view}
              onClick={() => setViewType(view)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                viewType === view
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              {view}
            </button>
          ))}
        </div>

        {/* Radar Chart */}
        {viewType === 'radar' && (
          <div className="glass-card p-8">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(100,116,139,0.3)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 13 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />

                  {mockModels.map(model => (
                    <Radar
                      key={model.id}
                      name={model.name}
                      dataKey={model.id}
                      stroke={model.color}
                      fill={model.color}
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-8 mt-6">
              {mockModels.map(model => (
                <div key={model.id} className="flex items-center gap-2">
                  <div
                    className="w-4 h-0.5 rounded-full"
                    style={{ backgroundColor: model.color, borderBottom: `2px solid ${model.color}` }}
                  />
                  <span className="text-sm text-slate-300">{model.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bar Chart */}
        {viewType === 'bar' && (
          <div className="glass-card p-6">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={radarData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                  <XAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid rgba(99,102,241,0.2)',
                      borderRadius: '12px',
                      color: '#e2e8f0'
                    }}
                    formatter={(value) => [`${value.toFixed(1)}%`, value]}
                  />

                  {mockModels.map(model => (
                    <Bar
                      key={model.id}
                      dataKey={model.id}
                      fill={model.color}
                      radius={[8, 8, 0, 0]}
                      name={model.name}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Table View */}
        {viewType === 'table' && (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/30 bg-slate-800/30">
                    <th className="text-left py-4 px-6 text-slate-300 font-semibold">Metric</th>
                    {mockModels.map(model => (
                      <th key={model.id} className="text-center py-4 px-4 text-slate-300 font-semibold">
                        <div className="flex flex-col items-center">
                          <div
                            className="w-3 h-3 rounded-full mb-1"
                            style={{ backgroundColor: model.color }}
                          />
                          <span className="text-xs">{model.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(mockModels[0].metrics).map((metric, idx) => (
                    <motion.tr
                      key={metric}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-slate-200">{metric}</td>
                      {mockModels.map(model => {
                        const value = model.metrics[metric];
                        const isBest = value === Math.max(...mockModels.map(m => m.metrics[metric]));
                        return (
                          <td key={model.id} className="py-4 px-4 text-center">
                            <span className={`font-mono font-bold ${
                              isBest ? 'text-emerald-400' : 'text-slate-300'
                            }`}>
                              {value}%
                              {isBest && (
                                <span className="ml-1"></span>
                              )}
                            </span>
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="glass-card p-6">
          <h4 className="text-sm text-slate-400 mb-3">Best Performing Model</h4>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-200">Adversarial Debiasing</p>
              <p className="text-sm text-emerald-400">89% average fairness</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h4 className="text-sm text-slate-400 mb-3">Most Balanced</h4>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-200">Fairlearn Post</p>
              <p className="text-sm text-blue-400">Best trade-off fairness/accuracy</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h4 className="text-sm text-slate-400 mb-3">Improvement</h4>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-200">+21 points</p>
              <p className="text-sm text-purple-400">From original to best</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}