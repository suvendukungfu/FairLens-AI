import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { CardSkeleton } from '../components/Skeleton';

const fairnessColors = {
  'Demographic Parity': '#6366f1',
  'Equal Opportunity': '#22c55e',
  'Disparate Impact': '#f59e0b',
  'Equalized Odds': '#ec4899',
  'Calibration': '#06b6d4',
};

export default function FairnessMetrics() {
  const { analysisResult, isLoading } = useAppStore();
  const [viewMode, setViewMode] = useState('bar'); // 'bar', 'radar', 'table'

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
        <p className="text-slate-400">No fairness metrics available</p>
      </motion.div>
    );
  }

  const { fairness_metrics = [], group_comparisons = [] } = analysisResult;

  // Transform metrics for charts
  const metricsForChart = fairness_metrics.map(m => ({
    metric: m.metric_name.length > 25 ? m.metric_name.substring(0, 25) + '...' : m.metric_name,
    value: m.value * 100,
    fullMark: (m.threshold || 0.8) * 100,
    status: m.is_biased ? 'biased' : 'fair',
    color: fairnessColors[m.metric_name] || '#6366f1',
    explanation: m.explanation,
  }));

  // Radar data
  const radarData = fairness_metrics.map(m => ({
    metric: m.metric_name.length > 15 ? m.metric_name.substring(0, 15) + '...' : m.metric_name,
    value: Math.max(0, (m.value / (m.threshold || 1)) * 100),
    fullMark: 100,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Fairness Metrics</h2>
          <p className="text-slate-400">
            Quantitative evaluation of bias across multiple fairness criteria
          </p>
        </div>

        {/* View toggles */}
        <div className="flex gap-2 bg-slate-800/50 p-1 rounded-xl">
          {['bar', 'radar', 'table'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                viewMode === mode
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards with Toggle */}
      {viewMode === 'bar' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {fairness_metrics.map((metric, idx) => {
            const colors = fairnessColors[metric.metric_name] || '#6366f1';
            const isFair = !metric.is_biased;

            return (
              <motion.div
                key={metric.metric_name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-6 group hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-slate-200 mb-1">{metric.metric_name}</h4>
                    <p className="text-xs text-slate-500">Threshold: {(metric.threshold * 100).toFixed(0)}%</p>
                  </div>
                  <motion.div
                    className={`w-3 h-3 rounded-full ${isFair ? 'bg-emerald-500' : 'bg-red-500'}`}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>

                {/* Value Display */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-black ${isFair ? 'text-emerald-400' : 'text-red-400'}`}>
                      {(metric.value * 100).toFixed(1)}%
                    </span>
                    <span className="text-sm text-slate-400">/ {(metric.threshold * 100).toFixed(0)}%</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full h-3 bg-slate-700/50 rounded-full overflow-hidden">
                  <motion.div
                    className={`absolute inset-y-0 left-0 rounded-full ${
                      isFair
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : 'bg-gradient-to-r from-red-500 to-rose-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(metric.value / (metric.threshold || 1) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: idx * 0.1 }}
                  />
                </div>

                {/* Explanation */}
                <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-xs text-slate-300 leading-relaxed">{metric.explanation}</p>
                </div>

                {/* Status Badge */}
                <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                  isFair
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {isFair ? ' Fair' : ' Biased'}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Radar View */}
      {viewMode === 'radar' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8"
        >
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(100,116,139,0.3)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 13 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Radar
                  name="Current Model"
                  dataKey="value"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
                <Radar
                  name="Target"
                  dataKey="fullMark"
                  stroke="#22c55e"
                  fill="none"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-8 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-primary-500 rounded-full" />
              <span className="text-sm text-slate-400">Current Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 border-b-2 border-emerald-500 border-dashed rounded-full" />
              <span className="text-sm text-slate-400">Fairness Target</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/30 bg-slate-800/30">
                  <th className="text-left py-4 px-6 text-slate-300 font-semibold">Metric</th>
                  <th className="text-right py-4 px-6 text-slate-300 font-semibold">Value</th>
                  <th className="text-right py-4 px-6 text-slate-300 font-semibold">Threshold</th>
                  <th className="text-right py-4 px-6 text-slate-300 font-semibold">Difference</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {fairness_metrics.map((metric, idx) => (
                  <motion.tr
                    key={metric.metric_name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <p className="font-medium text-slate-200">{metric.metric_name}</p>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <p className={`font-bold font-mono ${
                        metric.is_biased ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        {(metric.value * 100).toFixed(2)}%
                      </p>
                    </td>
                    <td className="py-4 px-6 text-right text-slate-400">
                      {(metric.threshold * 100).toFixed(0)}%
                    </td>
                    <td className="py-4 px-6 text-right">
                      <p className="font-mono text-slate-300">
                        {((metric.value - metric.threshold) * 100).toFixed(2)}pp
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                        metric.is_biased
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {metric.is_biased ? ' Biased' : ' Fair'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Group Comparisons */}
      {viewMode === 'table' && group_comparisons && group_comparisons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-slate-100 mb-6">Group Comparisons</h3>

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
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {group_comparisons.map((comp, idx) => (
                  <motion.tr
                    key={`${comp.group_a}-${comp.group_b}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + idx * 0.05 }}
                    className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="py-4 px-4 text-slate-200 font-medium">{comp.group_a}</td>
                    <td className="py-4 px-4 text-slate-200 font-medium">{comp.group_b}</td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-mono text-slate-300">{(comp.group_a_rate * 100).toFixed(1)}%</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-mono text-slate-300">{(comp.group_b_rate * 100).toFixed(1)}%</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`font-mono font-bold ${
                        Math.abs(comp.difference) > 0.2 ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        {(comp.difference * 100).toFixed(1)}pp
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-mono text-slate-300">{comp.ratio.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        Math.abs(comp.difference) > 0.2
                          ? 'bg-red-500/20 text-red-300'
                          : Math.abs(comp.difference) > 0.1
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {Math.abs(comp.difference) > 0.2 ? 'Significant Disparity' :
                         Math.abs(comp.difference) > 0.1 ? 'Moderate' : 'Acceptable'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}