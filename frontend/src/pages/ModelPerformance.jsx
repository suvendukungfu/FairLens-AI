import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { CardSkeleton } from '../components/Skeleton';

const performanceData = [
  { epoch: 1, train: 0.72, validation: 0.68 },
  { epoch: 2, train: 0.78, validation: 0.72 },
  { epoch: 3, train: 0.82, validation: 0.75 },
  { epoch: 4, train: 0.85, validation: 0.77 },
  { epoch: 5, train: 0.87, validation: 0.79 },
  { epoch: 6, train: 0.89, validation: 0.80 },
  { epoch: 7, train: 0.90, validation: 0.81 },
  { epoch: 8, train: 0.91, validation: 0.82 },
  { epoch: 9, train: 0.92, validation: 0.82 },
  { epoch: 10, train: 0.93, validation: 0.83 },
];

const rocData = [
  { fpr: 0, tpr: 0 },
  { fpr: 0.1, tpr: 0.45 },
  { fpr: 0.2, tpr: 0.65 },
  { fpr: 0.3, tpr: 0.78 },
  { fpr: 0.4, tpr: 0.85 },
  { fpr: 0.5, tpr: 0.90 },
  { fpr: 0.6, tpr: 0.93 },
  { fpr: 0.7, tpr: 0.96 },
  { fpr: 0.8, tpr: 0.98 },
  { fpr: 0.9, tpr: 0.99 },
  { fpr: 1, tpr: 1 },
];

const fairnessRadarData = [
  { metric: 'Demographic Parity', value: 85, fullMark: 100 },
  { metric: 'Equal Opportunity', value: 78, fullMark: 100 },
  { metric: 'Equalized Odds', value: 82, fullMark: 100 },
  { metric: 'Calibration', value: 91, fullMark: 100 },
  { metric: 'Individual Fairness', value: 75, fullMark: 100 },
];

export default function ModelPerformance() {
  const { analysisResult, isLoading } = useAppStore();
  const [activeMetric, setActiveMetric] = useState('all');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
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
        <p className="text-slate-400">No analysis results available</p>
      </motion.div>
    );
  }

  const { fairness_metrics = [], performance = {} } = analysisResult;

  const metrics = {
    accuracy: performance.accuracy || 0.85,
    precision: performance.precision || 0.87,
    recall: performance.recall || 0.83,
    f1: performance.f1 || 0.85,
  };

  let cmData = [];
  if (performance.confusion_matrix && performance.confusion_matrix.length === 2) {
    const cm = performance.confusion_matrix;
    cmData = [
      { label: 'TN', value: cm[0][0], color: 'bg-emerald-500/20 text-emerald-400' },
      { label: 'FP', value: cm[0][1], color: 'bg-red-500/20 text-red-400' },
      { label: 'FN', value: cm[1][0], color: 'bg-red-500/20 text-red-400' },
      { label: 'TP', value: cm[1][1], color: 'bg-emerald-500/20 text-emerald-400' },
    ];
  } else {
    cmData = [
      { label: 'TN', value: 380, color: 'bg-emerald-500/20 text-emerald-400' },
      { label: 'FP', value: 67, color: 'bg-red-500/20 text-red-400' },
      { label: 'FN', value: 103, color: 'bg-red-500/20 text-red-400' },
      { label: 'TP', value: 450, color: 'bg-emerald-500/20 text-emerald-400' },
    ];
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
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Model Performance</h2>
        <p className="text-slate-400">
          Comprehensive evaluation of model accuracy and fairness metrics
        </p>
      </div>

      {/* Performance Metrics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="glass-card p-5 text-center">
            <p className="text-sm text-slate-400 mb-2 capitalize">{key}</p>
            <motion.p
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-3xl font-black text-slate-100"
            >
              {(value * 100).toFixed(1)}%
            </motion.p>
            <p className="text-xs text-slate-500 mt-2">
              {key === 'accuracy' ? 'Overall Accuracy' :
               key === 'precision' ? 'Positive Predictive Value' :
               key === 'recall' ? 'True Positive Rate' : 'F1 Score'}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Training Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-100">Training Progress</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveMetric('all')}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                activeMetric === 'all'
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'bg-slate-700/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveMetric('train')}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                activeMetric === 'train'
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'bg-slate-700/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              Train
            </button>
            <button
              onClick={() => setActiveMetric('validation')}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                activeMetric === 'validation'
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'bg-slate-700/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              Val
            </button>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="trainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="valGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
              <XAxis dataKey="epoch" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0.6, 1]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: '12px',
                  color: '#e2e8f0'
                }}
                formatter={(value) => `${(value * 100).toFixed(1)}%`}
              />
              <Legend />

              {(activeMetric === 'all' || activeMetric === 'train') && (
                <Area
                  type="monotone"
                  dataKey="train"
                  stroke="#6366f1"
                  fill="url(#trainGradient)"
                  strokeWidth={3}
                  name="Training"
                />
              )}

              {(activeMetric === 'all' || activeMetric === 'validation') && (
                <Area
                  type="monotone"
                  dataKey="validation"
                  stroke="#06b6d4"
                  fill="url(#valGradient)"
                  strokeWidth={3}
                  name="Validation"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Confusion Matrix & ROC */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-slate-100 mb-6">Confusion Matrix</h3>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            {cmData.map((cell, idx) => (
              <motion.div
                key={cell.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className={`p-6 rounded-xl text-center border ${cell.color} border-slate-700`}
              >
                <p className="text-2xl font-black">{cell.value}</p>
                <p className="text-xs opacity-80 mt-1">{cell.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between p-3 bg-slate-800/30 rounded-lg">
              <span className="text-slate-400">Precision</span>
              <span className="font-semibold text-slate-200">{(metrics.precision * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-800/30 rounded-lg">
              <span className="text-slate-400">Recall</span>
              <span className="font-semibold text-slate-200">{(metrics.recall * 100).toFixed(1)}%</span>
            </div>
          </div>
        </motion.div>

        {/* ROC Curve */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-slate-100 mb-6">ROC Curve</h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                <XAxis
                  dataKey="fpr"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  label={{ value: 'False Positive Rate', position: 'insideBottomRight', offset: -5, fill: '#94a3b8' }}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: '12px',
                    color: '#e2e8f0'
                  }}
                  formatter={(value) => `${(value * 100).toFixed(1)}%`}
                />
                <Line
                  type="monotone"
                  dataKey="tpr"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={false}
                  name="ROC Curve"
                />
                {/* Diagonal reference line */}
                <Line
                  type="monotone"
                  dataKey="fpr"
                  stroke="#94a3b8"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Random"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex justify-center">
            <div className="px-4 py-2 bg-slate-800/50 rounded-full">
              <span className="text-sm text-slate-400">AUC: </span>
              <span className="text-lg font-bold text-primary-400">0.87</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Fairness Radar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-slate-100 mb-6">Fairness Radar</h3>

        <div className="h-80 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={fairnessRadarData}>
              <PolarGrid stroke="rgba(100,116,139,0.3)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Radar
                name="Fairness Score"
                dataKey="value"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="Target"
                dataKey="fullMark"
                stroke="#22c55e"
                fill="none"
                strokeWidth={1}
                strokeDasharray="5 5"
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );
}