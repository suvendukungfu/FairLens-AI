import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { CardSkeleton } from '../components/Skeleton';
import { AlertBanner } from '../components/AnimationUtils';

const COLORS = ['#6366f1', '#818cf8', '#a78bfa', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444'];

export default function BiasDetection() {
  const { analysisResult, addAlert } = useAppStore();
  const [biasHeatmap, setBiasHeatmap] = useState([]);
  const [selectedBias, setSelectedBias] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (analysisResult?.fairness_metrics) {
      // Generate heatmap data
      const heatmap = analysisResult.fairness_metrics.map(m => ({
        ...m,
        biasScore: (1 - m.value / (m.threshold || 1)) * 100,
        severity: m.is_biased ? (m.value < 0.7 ? 'high' : m.value < 0.85 ? 'medium' : 'low') : 'none',
      }));
      setBiasHeatmap(heatmap);

      // Auto-generate alerts for high bias
      heatmap.forEach(m => {
        if (m.is_biased && m.value < 0.8) {
          addAlert({
            id: `bias-${m.metric_name}-${Date.now()}`,
            severity: m.value < 0.7 ? 'high' : 'medium',
            title: `Bias Detected: ${m.metric_name}`,
            message: `${m.metric_name} score of ${(m.value * 100).toFixed(1)}% indicates potential unfairness.`,
            timestamp: new Date(),
          });
        }
      });
    }
  }, [analysisResult]);

  if (!analysisResult) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20"
      >
        <p className="text-slate-400">No bias analysis available</p>
      </motion.div>
    );
  }

  const { fairness_metrics = [], group_comparisons = [] } = analysisResult;

  // Clinical examples of biased statements
  const biasExamples = [
    {
      group: 'Gender',
      statement: 'Female candidates are 35% less likely to receive positive predictions than males',
      severity: 'high',
      impact: 35,
    },
    {
      group: 'Race',
      statement: 'Black applicants receive 28% lower approval rates compared to white applicants',
      severity: 'high',
      impact: 28,
    },
    {
      group: 'Age',
      statement: 'Applicants over 50 show a 12% reduction in favorable outcomes',
      severity: 'medium',
      impact: 12,
    },
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'from-red-500/20 to-rose-500/20 border-red-500/30 text-red-300';
      case 'medium': return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30 text-yellow-300';
      default: return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2 flex items-center gap-3">
            <span className="text-red-400">️</span>
            Bias Detection
          </h2>
          <p className="text-slate-400">
            Automated detection of unfair patterns and discriminatory behavior
          </p>
        </div>

        {/* Bias Risk Gauge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="text-sm text-slate-500 mb-1">Overall Bias Risk</div>
          <div className="text-4xl font-black text-red-400">
            {Math.round(analysisResult.bias_score || 0)}%
          </div>
        </motion.div>
      </div>

      {/* Bias Alert Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {biasExamples.map((example, idx) => (
          <motion.div
            key={example.group}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            className={`glass-card p-6 border-2 bg-gradient-to-br ${getSeverityColor(example.severity)}`}
            onClick={() => setSelectedBias(example)}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">
                {example.severity === 'high' ? '' : ''}
              </span>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-800/50 text-slate-300">
                {example.group}
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed mb-4">{example.statement}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Impact Score</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${
                      example.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${example.impact}%` }}
                    transition={{ duration: 1, delay: idx * 0.2 }}
                  />
                </div>
                <span className="text-sm font-bold text-red-400">{example.impact}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Bias Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-slate-100 mb-6">Bias Severity Heatmap</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Fairness Metric</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Current Value</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Target</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Severity</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Bias Evidence</th>
              </tr>
            </thead>
            <tbody>
              {biasHeatmap.map((metric, idx) => (
                <motion.tr
                  key={metric.metric_name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className={`border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors cursor-pointer ${
                    selectedBias?.metric_name === metric.metric_name ? 'bg-primary-500/10' : ''
                  }`}
                  onClick={() => setShowDetails(!showDetails || selectedBias?.metric_name !== metric.metric_name)}
                >
                  <td className="py-4 px-4">
                    <p className="font-medium text-slate-200">{metric.metric_name}</p>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`font-mono text-lg font-bold ${
                      metric.is_biased ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {(metric.value * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-slate-400">{(metric.threshold * 100).toFixed(0)}%</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        metric.severity === 'high' ? 'bg-red-500' :
                        metric.severity === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'
                      }`} />
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        metric.severity === 'high'
                          ? 'bg-red-500/20 text-red-300'
                          : metric.severity === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {metric.severity.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${
                          metric.severity === 'high' ? 'bg-gradient-to-r from-red-500 to-rose-500' :
                          metric.severity === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                          'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.biasScore}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Biased Group Details (Radar) */}
      {analysisResult.group_comparisons && analysisResult.group_comparisons.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-slate-100 mb-6">
            Disparity Analysis by Protected Group
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bar chart of disparities */}
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={group_comparisons.map(c => ({
                    name: `${c.group_a} vs ${c.group_b}`,
                    difference: Math.abs(c.difference * 100),
                    ratio: c.ratio * 100,
                  }))}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={90} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid rgba(99,102,241,0.2)',
                      borderRadius: '12px',
                      color: '#e2e8f0'
                    }}
                    formatter={(value) => `${value.toFixed(1)}%`}
                  />
                  <Bar dataKey="difference" fill="#ef4444" radius={[0, 8, 8, 0]} name="Disparity %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Explanation */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-200">Bias Summary</h4>
              {group_comparisons.slice(0, 3).map((comp, idx) => (
                <motion.div
                  key={`${comp.group_a}-${comp.group_b}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className={`p-4 rounded-lg border ${
                    Math.abs(comp.difference) > 0.2
                      ? 'bg-red-500/10 border-red-500/20'
                      : Math.abs(comp.difference) > 0.1
                      ? 'bg-yellow-500/10 border-yellow-500/20'
                      : 'bg-emerald-500/10 border-emerald-500/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-slate-300">
                      <span className="font-semibold">{comp.group_a}</span> vs{' '}
                      <span className="font-semibold">{comp.group_b}</span>
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      Math.abs(comp.difference) > 0.2
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {(comp.difference * 100).toFixed(1)}% gap
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Selection rate: {comp.group_a_rate.toFixed(2)} vs {comp.group_b_rate.toFixed(2)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}