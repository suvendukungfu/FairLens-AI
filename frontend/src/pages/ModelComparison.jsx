import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { CardSkeleton } from '../components/Skeleton';

export default function ModelComparison() {
  const { analysisResult, mitigationResult } = useAppStore();
  const [selectedMetrics, setSelectedMetrics] = useState(['Demographic Parity Difference', 'Equalized Odds Difference']);
  const [viewType, setViewType] = useState('radar'); // 'radar' | 'bar' | 'table'

  const models = [];
  
  if (analysisResult?.fairness_metrics) {
    const originalMetrics = {};
    analysisResult.fairness_metrics.forEach(m => {
      originalMetrics[m.metric_name] = m.value * 100;
    });
    models.push({
      id: 'original',
      name: 'Original Model',
      color: '#ef4444',
      metrics: originalMetrics,
    });
  }

  if (mitigationResult?.after_metrics) {
    const mitigatedMetrics = {};
    mitigationResult.after_metrics.forEach(m => {
      mitigatedMetrics[m.metric_name] = m.value * 100;
    });
    models.push({
      id: 'mitigated',
      name: mitigationResult.strategy ? mitigationResult.strategy.charAt(0).toUpperCase() + mitigationResult.strategy.slice(1) : 'Mitigated Model',
      color: '#22c55e',
      metrics: mitigatedMetrics,
    });
  }

  const radarData = models.length > 0 ? Object.keys(models[0].metrics).map(metric => ({
    metric,
    ...models.reduce((acc, model) => ({
      ...acc,
      [model.id]: model.metrics[metric],
    }), {}),
  })).filter(d => selectedMetrics.includes(d.metric)) : [];

  const comparisonStats = selectedMetrics.map(metric => {
    const values = models.map(m => m.metrics[metric]);
    const best = Math.min(...values); // Lower difference is better
    const worst = Math.max(...values);
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

  if (models.length < 2) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20 space-y-4"
      >
        <p className="text-slate-400">Please run Bias Mitigation first to compare models.</p>
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
          {models.map((model, idx) => (
            <motion.button
              key={model.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`p-4 rounded-xl border-2 transition-all bg-slate-800/50 border-slate-600/30 hover:border-primary-500/50`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: model.color }}
                />
                <span className={`font-medium text-slate-200`}>
                  {model.name}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Avg Diff: {(Object.values(model.metrics).reduce((a, b) => a + b, 0) / Object.keys(model.metrics).length).toFixed(1)}%
              </p>
            </motion.button>
          ))}
        </div>

        {/* Metrics Filter */}
        <div className="mt-6">
          <label className="text-sm text-slate-400 mb-2 block">Metrics to Compare</label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(models[0].metrics).map(metric => (
              <button
                key={metric}
                onClick={() => {
                  if (selectedMetrics.includes(metric)) {
                    setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
                  } else {
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

                  {models.map(model => (
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
              {models.map(model => (
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

                  {models.map(model => (
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
                    {models.map(model => (
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
                  {Object.keys(models[0].metrics).map((metric, idx) => (
                    <motion.tr
                      key={metric}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                      className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-slate-200">{metric}</td>
                      {models.map(model => {
                        const value = model.metrics[metric];
                        const isBest = value === Math.min(...models.map(m => m.metrics[metric])); // Lower diff is better
                        return (
                          <td key={model.id} className="py-4 px-4 text-center">
                            <span className={`font-mono font-bold ${
                              isBest ? 'text-emerald-400' : 'text-slate-300'
                            }`}>
                              {value.toFixed(1)}%
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


      {/* AI Comparative Analysis */}
      {models.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-8 mt-8 border border-primary-500/20 relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-3">
            <svg className="w-6 h-6 text-primary-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Comparative Analysis
          </h3>

          <div className="space-y-4 relative z-10">
            {Object.keys(models[0].metrics).map((metric, idx) => {
              const original = models[0].metrics[metric];
              const mitigated = models[1].metrics[metric];
              const diff = original - mitigated; // For most fairness metrics, lower diff is better
              const isImproved = diff > 0;
              
              if (Math.abs(diff) < 0.1) return null; // Skip negligible changes

              return (
                <motion.div
                  key={metric}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  className={`p-4 rounded-xl border ${
                    isImproved 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-100'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${isImproved ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                      {isImproved ? (
                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">{metric}</h4>
                      <p className={`text-sm ${isImproved ? 'text-emerald-200/70' : 'text-rose-200/70'} leading-relaxed`}>
                        The {models[1].name} {isImproved ? 'successfully reduced' : 'unfortunately increased'} the disparity in {metric} by <span className="font-bold text-white">{Math.abs(diff).toFixed(1)}%</span>. 
                        It moved from <span className="font-mono">{original.toFixed(1)}%</span> in the original model down to <span className="font-mono">{mitigated.toFixed(1)}%</span>.
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {/* Contextual Summary */}
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 1 }}
               className="mt-6 p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 text-sm leading-relaxed"
            >
              <strong className="text-white">Note on Performance Trade-offs:</strong> Bias mitigation techniques often introduce a slight degradation in overall predictive accuracy. A successful mitigation strategy balances significant fairness improvements with minimal accuracy loss.
            </motion.div>
          </div>
        </motion.div>
      )}

    </motion.div>
  );
}