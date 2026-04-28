import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line
} from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { CardSkeleton } from '../components/Skeleton';

const mitigationStrategies = [
  { id: 'reweighting', name: 'Reweighting', description: 'Adjust sample weights to balance groups', icon: '⚖️' },
  { id: 'adversarial', name: 'Adversarial Debiasing', description: 'Learn fair representations', icon: '🛡️' },
  { id: 'fairlearn', name: 'Fairlearn Post-processing', description: 'Calibrate predictions for fairness', icon: '🎯' },
  { id: 'disparate-impact', name: 'Disparate Impact Remover', description: 'Remove correlations with protected attributes', icon: '🔧' },
];

export default function Mitigation() {
  const { analysisResult, isLoading } = useAppStore();
  const [selectedStrategy, setSelectedStrategy] = useState('reweighting');
  const [isComparing, setIsComparing] = useState(true);
  const [mitigationResults, setMitigationResults] = useState(null);

  // Simulate mitigation impact
  const metrics = analysisResult?.fairness_metrics || [];
  const originalValues = metrics.map(m => m.value);
  const improvedValues = metrics.map(m => {
    if (m.is_biased) {
      // Simulate improvement
      const improvement = (1 - m.value / (m.threshold || 1)) * 0.6;
      return Math.min(m.value + (1 - m.value) * 0.5, 0.95);
    }
    return m.value;
  });

  const comparisonData = metrics.map((m, idx) => ({
    metric: m.metric_name.length > 20 ? m.metric_name.substring(0, 20) + '...' : m.metric_name,
    original: m.value * 100,
    improved: improvedValues[idx] * 100,
    threshold: (m.threshold || 0.8) * 100,
    improvement: ((improvedValues[idx] - m.value) / (1 - m.value) * 100) || 0,
  }));

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
        <p className="text-slate-400">Run analysis first to see mitigation options</p>
      </motion.div>
    );
  }

  // Calculate overall improvement
  const avgImprovement = comparisonData.reduce((sum, d) => sum + d.improvement, 0) / comparisonData.length;
  const biasedCount = comparisonData.filter(d => d.original < d.threshold).length;
  const fixedCount = comparisonData.filter(d => d.improved >= d.threshold).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Hero Section - Comparison Slider */}
      <div className="glass-card overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-100 mb-2">Bias Mitigation</h2>
              <p className="text-slate-400">
                Compare original model vs. mitigated model using advanced debiasing techniques
              </p>
            </div>

            {/* Strategy Selector */}
            <div className="flex gap-3">
              {mitigationStrategies.map((strategy) => (
                <button
                  key={strategy.id}
                  onClick={() => setSelectedStrategy(strategy.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedStrategy === strategy.id
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30 shadow-lg'
                      : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                  title={strategy.description}
                >
                  <span className="mr-2">{strategy.icon}</span>
                  {strategy.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Big Numbers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-6 p-6 bg-slate-800/20"
        >
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-2">Biased Metrics Before</p>
            <p className="text-4xl font-black text-red-400">{biasedCount}</p>
          </div>
          <div className="text-center border-x border-slate-700/30">
            <p className="text-sm text-slate-400 mb-2">Fixed After Mitigation</p>
            <p className="text-4xl font-black text-emerald-400">{fixedCount}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-2">Average Improvement</p>
            <p className="text-4xl font-black text-primary-400">
              {avgImprovement.toFixed(1)}%
            </p>
          </div>
        </motion.div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-2 gap-0">
          {/* Original Model */}
          <div className="p-6 border-r border-slate-700/30">
            <h4 className="text-lg font-semibold text-red-300 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Original Model
            </h4>

            <div className="space-y-4">
              {comparisonData.map((comp, idx) => (
                <motion.div
                  key={`orig-${idx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300 truncate max-w-[150px]">{comp.metric}</span>
                    <span className={`text-sm font-bold ${
                      comp.original < comp.threshold ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {comp.original.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        comp.original < comp.threshold
                          ? 'bg-gradient-to-r from-red-500 to-rose-500'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      }`}
                      style={{ width: `${(comp.original / 100) * 100}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mitigated Model */}
          <div className="p-6">
            <h4 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Mitigated Model
            </h4>

            <div className="space-y-4">
              {comparisonData.map((comp, idx) => (
                <motion.div
                  key={`mit-${idx}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300 truncate max-w-[150px]">{comp.metric}</span>
                    <span className={`text-sm font-bold ${
                      comp.improved < comp.threshold ? 'text-yellow-400' : 'text-emerald-400'
                    }`}>
                      {comp.improved.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        comp.improved < comp.threshold
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(comp.improved / 100) * 100}%` }}
                      transition={{ duration: 1.5, delay: idx * 0.1 }}
                    />
                  </div>
                  {comp.improvement > 0 && (
                    <div className="flex items-center justify-end gap-1">
                      <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs text-emerald-400 font-semibold">
                        +{comp.improvement.toFixed(0)}%
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Apply Mitigation
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-secondary flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Comparison
        </motion.button>
      </motion.div>

      {/* Strategy Explanations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {mitigationStrategies.map((strategy, idx) => (
          <motion.div
            key={strategy.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + idx * 0.1 }}
            className={`glass-card p-5 cursor-pointer transition-all duration-300 ${
              selectedStrategy === strategy.id
                ? 'ring-2 ring-primary-500/50 bg-primary-500/10'
                : 'hover:bg-slate-800/50'
            }`}
            onClick={() => setSelectedStrategy(strategy.id)}
          >
            <div className="text-3xl mb-3">{strategy.icon}</div>
            <h4 className="font-semibold text-slate-200 mb-2">{strategy.name}</h4>
            <p className="text-xs text-slate-400">{strategy.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Before/After Radar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-8"
      >
        <h3 className="text-lg font-semibold text-slate-100 mb-6 text-center">
          Fairness Profile: Before vs After
        </h3>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={comparisonData}>
              <PolarGrid stroke="rgba(100,116,139,0.3)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Radar
                name="Original"
                dataKey="original"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Radar
                name="Mitigated"
                dataKey="improved"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Radar
                name="Target"
                dataKey="threshold"
                stroke="#6366f1"
                fill="none"
                strokeWidth={1.5}
                strokeDasharray="5 5"
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-8 mt-6">
          {[
            { color: '#ef4444', label: 'Original' },
            { color: '#22c55e', label: 'Mitigated' },
            { color: '#6366f1', label: 'Target', dashed: true },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className={`w-4 h-1 rounded-full ${
                  item.dashed ? 'border-b-2 border-dashed' : ''
                }`}
                style={{ backgroundColor: item.dashed ? 'transparent' : item.color, borderColor: item.dashed ? item.color : undefined }}
              />
              <span className="text-sm text-slate-400">{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}