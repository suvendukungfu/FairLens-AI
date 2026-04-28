import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, ReferenceLine
} from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { CardSkeleton } from '../components/Skeleton';

const timelineData = [
  {
    version: 'v1.0',
    date: '2024-01-15',
    accuracy: 0.82,
    fairness: 68,
    disparateImpact: 0.72,
    biasScore: 35,
    notes: 'Initial model, high bias detected',
  },
  {
    version: 'v1.1',
    date: '2024-02-03',
    accuracy: 0.83,
    fairness: 72,
    disparateImpact: 0.78,
    biasScore: 28,
    notes: 'Applied reweighting',
  },
  {
    version: 'v1.2',
    date: '2024-02-20',
    accuracy: 0.84,
    fairness: 79,
    disparateImpact: 0.85,
    biasScore: 18,
    notes: 'Added adversarial debiasing',
  },
  {
    version: 'v2.0',
    date: '2024-03-10',
    accuracy: 0.86,
    fairness: 85,
    disparateImpact: 0.91,
    biasScore: 12,
    notes: 'Full pipeline retraining',
  },
  {
    version: 'v2.1',
    date: '2024-04-01',
    accuracy: 0.87,
    fairness: 89,
    disparateImpact: 0.94,
    biasScore: 8,
    notes: 'Fairness constraints tuned',
  },
];

export default function Timeline() {
  const { isLoading } = useAppStore();
  const [selectedMetric, setSelectedMetric] = useState('fairness');
  const [timeRange, setTimeRange] = useState('all');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const metrics = {
    fairness: 'Fairness Score',
    accuracy: 'Model Accuracy',
    disparateImpact: 'Disparate Impact',
    biasScore: 'Bias Risk Score',
  };

  const colors = {
    fairness: '#6366f1',
    accuracy: '#22c55e',
    disparateImpact: '#f59e0b',
    biasScore: '#ef4444',
  };

  // Format data for charts
  const chartData = timelineData.map(d => ({
    ...d,
    fairness: d.fairness,
    accuracy: d.accuracy * 100,
    disparateImpact: d.disparateImpact * 100,
    biasScore: 100 - d.fairness, // Inverse for display
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2 flex items-center gap-3">
          <svg className="w-6 h-6 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Model Evolution Timeline
        </h2>
        <p className="text-slate-400">
          Track fairness improvements across model iterations and retraining cycles
        </p>
      </div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-6"
      >
        {/* Metric selector */}
        <div className="flex gap-2 bg-slate-800/50 p-1 rounded-xl">
          {Object.entries(metrics).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedMetric(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedMetric === key
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {label.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Time range */}
        <div className="flex gap-2">
          {['3m', '6m', '1y', 'all'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                timeRange === range
                  ? 'bg-slate-700 text-slate-200'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {range === 'all' ? 'All Time' : range}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Main Timeline Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-8"
      >
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 60, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id={`gradient-${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[selectedMetric]} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={colors[selectedMetric]} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" vertical={false} />
              <XAxis
                dataKey="version"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(100,116,139,0.3)' }}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                domain={selectedMetric === 'biasScore' ? [0, 50] : [50, 100]}
                axisLine={{ stroke: 'rgba(100,116,139,0.3)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: '12px',
                  color: '#e2e8f0'
                }}
                formatter={(value) => [
                  selectedMetric === 'biasScore'
                    ? `${(100 - value).toFixed(0)}%`
                    : `${value.toFixed(1)}%`,
                  metrics[selectedMetric]
                ]}
              />

              {/* Target line for fairness */}
              {(selectedMetric === 'fairness' || selectedMetric === 'disparateImpact') && (
                <ReferenceLine
                  y={80}
                  stroke="#22c55e"
                  strokeDasharray="5 5"
                  label={{ value: 'Target', fill: '#22c55e', fontSize: 12 }}
                />
              )}

              {/* Animated line */}
              <Line
                type="monotone"
                dataKey={selectedMetric}
                stroke={colors[selectedMetric]}
                strokeWidth={3}
                dot={{ fill: colors[selectedMetric], strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: colors[selectedMetric], strokeWidth: 2, fill: '#1e293b' }}
                animationDuration={2000}
              />

              {/* Gradient fill */}
              <Area
                type="monotone"
                dataKey={selectedMetric}
                stroke="none"
                fill={`url(#gradient-${selectedMetric})`}
                fillOpacity={0.2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Version annotations */}
        <div className="mt-8 space-y-3">
          {timelineData.map((version, idx) => (
            <motion.div
              key={version.version}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-800/30 transition-colors cursor-pointer"
            >
              <div className="flex flex-col items-center">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: colors[selectedMetric] }}
                />
                {idx < timelineData.length - 1 && (
                  <div className="w-0.5 h-16 bg-slate-700 my-1" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-200">{version.version}</span>
                  <span className="text-xs text-slate-500">{version.date}</span>
                </div>
                <p className="text-sm text-slate-400">{version.notes}</p>
                <div className="flex gap-4 mt-2">
                  <span className="text-xs text-slate-500">
                    Fairness: <span className="text-emerald-400 font-semibold">{version.fairness}%</span>
                  </span>
                  <span className="text-xs text-slate-500">
                    Accuracy: <span className="text-blue-400 font-semibold">{(version.accuracy * 100).toFixed(1)}%</span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Progress Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          {
            label: 'Fairness Improvement',
            value: `+${timelineData[timelineData.length - 1].fairness - timelineData[0].fairness}%`,
            color: 'emerald',
          },
          {
            label: 'Accuracy Gain',
            value: `+${((timelineData[timelineData.length - 1].accuracy - timelineData[0].accuracy) * 100).toFixed(1)}%`,
            color: 'blue',
          },
          {
            label: 'Bias Reduction',
            value: `${((1 - timelineData[timelineData.length - 1].biasScore / timelineData[0].biasScore) * 100).toFixed(0)}%`,
            color: 'purple',
          },
          {
            label: 'Total Iterations',
            value: timelineData.length,
            color: 'amber',
          },
        ].map((stat, idx) => (
          <div
            key={stat.label}
            className="glass-card p-4 text-center"
          >
            <p className="text-sm text-slate-400 mb-2">{stat.label}</p>
            <p className={`text-2xl font-black text-${stat.color}-400`}>{stat.value}</p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}