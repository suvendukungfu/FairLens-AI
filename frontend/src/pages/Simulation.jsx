import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { CardSkeleton } from '../components/Skeleton';

// Sample sensitive attributes and their values
const sensitiveAttributes = {
  gender: ['Male', 'Female'],
  race: ['White', 'Black', 'Asian', 'Hispanic', 'Other'],
  age_group: ['18-25', '26-35', '36-50', '50+'],
};

const featureRanges = {
  education: { min: 1, max: 16, label: 'Education (years)' },
  experience: { min: 0, max: 40, label: 'Work Experience (years)' },
  income: { min: 10000, max: 200000, label: 'Annual Income ($)' },
  hours_worked: { min: 10, max: 80, label: 'Hours Worked/Week' },
};

export default function RealTimeSimulation() {
  const { analysisResult } = useAppStore();
  const [params, setParams] = useState({
    gender: 'Male',
    race: 'White',
    age_group: '26-35',
    education: 16,
    experience: 10,
    income: 75000,
    hours_worked: 40,
  });
  const [prediction, setPrediction] = useState(null);
  const [fairnessImpact, setFairnessImpact] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Simulate real-time prediction
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCalculating(true);

      // Simulate prediction calculation
      setTimeout(() => {
        // Generate mock prediction based on parameters
        const baseScore = 0.5;
        const educationBonus = (params.education - 8) * 0.02;
        const experienceBonus = (params.experience - 5) * 0.01;
        const incomeBonus = Math.log10(params.income / 30000) * 0.1;
        const hoursBonus = (params.hours_worked - 40) * 0.005;

        // Demographic adjustments (simulating bias)
        let demographicAdjustment = 0;
        if (params.gender === 'Female') demographicAdjustment -= 0.08;
        if (params.race === 'Black' || params.race === 'Hispanic') demographicAdjustment -= 0.12;
        if (params.age_group === '50+') demographicAdjustment -= 0.05;

        let finalScore = Math.min(0.99, Math.max(0.01,
          baseScore + educationBonus + experienceBonus + incomeBonus + hoursBonus + demographicAdjustment
        ));

        setPrediction({
          score: finalScore,
          probability: finalScore,
          classification: finalScore >= 0.5 ? 'APPROVED' : 'DENIED',
        });

        // Calculate fairness impact
        setFairnessImpact({
          disparateImpact: params.gender === 'Female' ? 0.78 : 0.95,
          equalOpportunity: params.race === 'Black' ? 0.72 : 0.88,
          individualFairness: 0.85 - (Math.abs(params.hours_worked - 40) / 100),
        });

        setIsCalculating(false);
      }, 800);
    }, 300);

    return () => clearTimeout(timer);
  }, [params]);

  if (!analysisResult) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20"
      >
        <p className="text-slate-400">No analysis data available</p>
      </motion.div>
    );
  }

  // Generate comparison data across sensitive groups
  const generateComparisonData = () => {
    const groups = ['Male', 'Female', 'White', 'Black', 'Asian', 'Hispanic'];
    return groups.map(group => {
      const isMale = group === 'Male';
      const isWhite = group === 'White';
      const baseScore = 0.6 + Math.random() * 0.25;

      const adjustments = {
        'Female': -0.08,
        'Black': -0.12,
        'Hispanic': -0.10,
        'Asian': 0.02,
      };

      let adjusted = baseScore + (adjustments[group] || 0);
      adjusted = Math.max(0.1, Math.min(0.95, adjusted));

      return {
        group,
        approvalRate: Math.round(adjusted * 100),
        positive_outcomes: Math.round(adjusted * 1000),
      };
    });
  };

  const comparisonData = generateComparisonData();

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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Real-Time Model Simulator
        </h2>
        <p className="text-slate-400">
          Adjust input parameters to see how predictions change across different demographic groups
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Sensitive Attributes */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Demographics</h3>
            <div className="space-y-4">
              {Object.entries(sensitiveAttributes).map(([key, options]) => (
                <div key={key}>
                  <label className="block text-sm text-slate-400 mb-2 capitalize">
                    {key.replace('_', ' ')}
                  </label>
                  <select
                    value={params[key]}
                    onChange={(e) => setParams({ ...params, [key]: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  >
                    {options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Sliders */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Input Features</h3>
            <div className="space-y-6">
              {Object.entries(featureRanges).map(([key, { min, max, label }]) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-slate-400">{label}</label>
                    <span className="text-sm font-mono text-primary-400">{params[key]}</span>
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={params[key]}
                    onChange={(e) => setParams({ ...params, [key]: Number(e.target.value) })}
                    className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-primary-500"
                  />
                  <div className="flex justify-between text-xs text-slate-600 mt-1">
                    <span>{min}</span>
                    <span>{max}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setParams({
              gender: 'Male',
              race: 'White',
              age_group: '26-35',
              education: 16,
              experience: 10,
              income: 75000,
              hours_worked: 40,
            })}
            className="w-full btn-secondary"
          >
            Reset Parameters
          </motion.button>
        </motion.div>

        {/* Results Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Prediction Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`glass-card p-8 text-center ${
              prediction?.classification === 'APPROVED' ? 'border-emerald-500/30' : 'border-rose-500/30'
            }`}
          >
            {isCalculating ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full mx-auto mb-4"
              />
            ) : (
              <>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 mb-6">
                  <div className={`w-3 h-3 rounded-full ${
                    prediction?.classification === 'APPROVED' ? 'bg-emerald-500' : 'bg-rose-500'
                  } animate-pulse`} />
                  <span className="text-sm font-medium text-slate-300">
                    Real-time Prediction
                  </span>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                  <p className="text-6xl font-black mb-2">
                    <span className={prediction?.classification === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'}>
                      {(prediction?.score * 100).toFixed(1)}%
                    </span>
                  </p>
                  <p className="text-2xl font-bold text-slate-300 mb-4">
                    {prediction?.classification}
                    <span className="text-lg font-normal text-slate-500 ml-2">Probability</span>
                  </p>

                  {/* Fairness indicators */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    {fairnessImpact && Object.entries(fairnessImpact).map(([key, value]) => (
                      <div key={key} className="p-3 bg-slate-800/30 rounded-lg">
                        <p className="text-xs text-slate-500 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className={`text-lg font-bold ${
                            value >= 0.8 ? 'text-emerald-400' :
                            value >= 0.6 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                          {(value * 100).toFixed(0)}%
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>

          {/* Group Comparison Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-slate-100 mb-6">
              Approval Rate by Demographic Group
            </h3>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                  <XAxis
                    dataKey="group"
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    domain={[0, 100]}
                    label={{ value: 'Approval Rate %', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid rgba(99,102,241,0.2)',
                      borderRadius: '12px',
                      color: '#e2e8f0'
                    }}
                    formatter={(value) => [`${value}%`, 'Approval Rate']}
                  />
                  <Bar
                    dataKey="approvalRate"
                    radius={[8, 8, 0, 0]}
                  >
                    {comparisonData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          params.gender === entry.group || params.race === entry.group
                            ? '#6366f1'
                            : entry.group === 'White'
                            ? '#22c55e'
                            : '#94a3b8'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p className="text-xs text-slate-500 mt-4 text-center">
              Highlighted bars show your selected demographic group
            </p>
          </motion.div>

          {/* Fairness Impact Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-slate-100 mb-4">
              Fairness Impact Analysis
            </h3>

            {fairnessImpact && Object.entries(fairnessImpact).map(([metric, value]) => {
              const isFair = value >= 0.8;
              const status = isFair ? 'good' : value >= 0.6 ? 'warning' : 'critical';

              return (
                <motion.div
                  key={metric}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`glass-card p-4 border-l-4 ${
                    status === 'good' ? 'border-emerald-500' :
                    status === 'warning' ? 'border-yellow-500' : 'border-red-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {status === 'good' ? '' : status === 'warning' ? '️' : ''}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-200">
                          {metric.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-sm text-slate-400">
                          Fairness indicator for this scenario
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${
                        isFair ? 'text-emerald-400' : 'text-yellow-400'
                      }`}>
                        {(value * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-slate-500">
                        {isFair ? 'Within acceptable range' :
                         value >= 0.6 ? 'Moderate concern' : 'Significant disparity'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>

      {/* Insight Generation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI-Generated Insights
        </h3>

        <div className="space-y-4">
          {prediction && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg"
              >
                <p className="text-slate-300 leading-relaxed">
                  For a <span className="font-semibold text-slate-100">{params.age_group}</span> {' '}
                  <span className="font-semibold text-slate-100">{params.gender}</span> {' '}
                  with <span className="font-semibold text-slate-100">{params.education} years</span> of education,{' '}
                  <span className="font-semibold text-slate-100">${params.income.toLocaleString()}</span> annual income,{' '}
                  and <span className="font-semibold text-slate-100">{params.hours_worked} hours/week</span> work,
                  the model predicts a{' '}
                  <span className={`font-semibold ${
                    prediction.classification === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {prediction.classification} outcome
                  </span>{' '}
                  with {(prediction.score * 100).toFixed(1)}% confidence.
                </p>
              </motion.div>

              {fairnessImpact && (fairnessImpact.disparateImpact < 0.8 || fairnessImpact.equalOpportunity < 0.8) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  <p className="text-red-300 leading-relaxed">
                     <span className="font-semibold">Bias Alert</span>:{' '}
                    {params.gender === 'Female' && 'Female applicants in this scenario receive 22% lower approval rates than males.'}
                    {params.race === 'Black' && 'Black applicants in this scenario face 28% disparity compared to white applicants.'}
                    {params.race !== 'Black' && params.gender !== 'Female' && 'Consider adjusting model parameters to reduce disparate impact for this demographic.'}
                  </p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}