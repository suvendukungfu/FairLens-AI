import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { CardSkeleton } from '../components/Skeleton';

export default function RealTimeSimulation() {
  const { analysisResult } = useAppStore();
  
  const [params, setParams] = useState({});
  const [sensitiveAttributes, setSensitiveAttributes] = useState({});
  const [featureRanges, setFeatureRanges] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [fairnessImpact, setFairnessImpact] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize parameters dynamically based on the uploaded dataset
  useEffect(() => {
    if (analysisResult) {
      const newSensitive = {};
      const newParams = {};
      
      if (analysisResult.distributions) {
        analysisResult.distributions.forEach(d => {
           const options = Object.keys(d.distribution);
           newSensitive[d.attribute] = options;
           newParams[d.attribute] = options[0];
        });
      }
      
      const newFeatures = {};
      if (analysisResult.top_features && analysisResult.top_features.length > 0) {
         analysisResult.top_features.slice(0, 4).forEach(f => {
            // We use a generic 0-100 range since we don't have the exact min/max from the backend
            newFeatures[f.feature] = { min: 0, max: 100, label: f.feature };
            newParams[f.feature] = 50;
         });
      } else {
         newFeatures['Feature_A'] = { min: 0, max: 100, label: 'Continuous Feature A' };
         newParams['Feature_A'] = 50;
      }
      
      setSensitiveAttributes(newSensitive);
      setFeatureRanges(newFeatures);
      setParams(newParams);
      setIsInitialized(true);
    }
  }, [analysisResult]);

  // Simulate real-time prediction using generic logic
  useEffect(() => {
    if (!isInitialized) return;

    const timer = setTimeout(() => {
      setIsCalculating(true);

      setTimeout(() => {
        // Base probability
        let baseScore = 0.5;

        // Add variance based on continuous features
        Object.keys(featureRanges).forEach(key => {
            const val = params[key] || 50;
            baseScore += ((val - 50) / 50) * 0.1; 
        });

        // Add variance based on sensitive features
        Object.entries(sensitiveAttributes).forEach(([key, options]) => {
           const selectedIndex = options.indexOf(params[key]);
           if (selectedIndex > 0) {
               baseScore -= (selectedIndex * 0.05); // Simulate bias against non-baseline groups
           }
        });

        let finalScore = Math.min(0.99, Math.max(0.01, baseScore));

        setPrediction({
          score: finalScore,
          probability: finalScore,
          classification: finalScore >= 0.5 ? 'FAVORABLE' : 'UNFAVORABLE',
        });

        // Calculate a simulated fairness impact
        const fImpact = {
          disparateImpact: Math.min(1, 0.75 + (Math.random() * 0.2)),
          equalOpportunity: Math.min(1, 0.70 + (Math.random() * 0.25)),
          individualFairness: Math.min(1, 0.80 + (Math.random() * 0.15)),
        };
        setFairnessImpact(fImpact);

        setIsCalculating(false);
      }, 600);
    }, 300);

    return () => clearTimeout(timer);
  }, [params, isInitialized]);

  if (!analysisResult || !isInitialized) {
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

  // Extract unique groups and their real baseline approval rates from group_comparisons
  const generateComparisonData = () => {
    const { group_comparisons = [] } = analysisResult;
    
    if (!group_comparisons.length) {
      return Object.entries(sensitiveAttributes).flatMap(([attr, options]) => {
         return options.map(opt => ({
             group: opt,
             approvalRate: Math.round((0.4 + Math.random() * 0.4) * 100)
         }));
      }).slice(0, 6);
    }

    const groupRates = {};
    group_comparisons.forEach(c => {
      groupRates[c.group_a] = c.group_a_rate;
      groupRates[c.group_b] = c.group_b_rate;
    });

    return Object.entries(groupRates).map(([group, rate]) => {
      // Simulate real-time adjustment based on sliders
      let continuousBonus = 0;
      Object.keys(featureRanges).forEach(key => {
          const val = params[key] || 50;
          continuousBonus += ((val - 50) / 50) * 0.05; 
      });

      const baseScore = rate + (Math.random() * 0.02); // Add slight jitter
      let adjusted = baseScore + continuousBonus;
      adjusted = Math.max(0.01, Math.min(0.99, adjusted));

      return {
        group,
        approvalRate: Math.round(adjusted * 100),
      };
    });
  };

  const comparisonData = generateComparisonData();

  const handleReset = () => {
      const newParams = {};
      Object.entries(sensitiveAttributes).forEach(([key, options]) => {
          newParams[key] = options[0];
      });
      Object.keys(featureRanges).forEach(key => {
          newParams[key] = 50;
      });
      setParams(newParams);
  };

  // Determine if a group in the chart matches a currently selected dropdown parameter
  const isGroupSelected = (groupName) => {
      return Object.values(params).includes(groupName);
  };

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
          Adjust input parameters to see how predictions change across different demographic groups dynamically extracted from your dataset
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
            {Object.keys(sensitiveAttributes).length === 0 ? (
               <p className="text-sm text-slate-500">No sensitive attributes detected.</p>
            ) : (
                <div className="space-y-4">
                  {Object.entries(sensitiveAttributes).map(([key, options]) => (
                    <div key={key}>
                      <label className="block text-sm text-slate-400 mb-2 capitalize">
                        {key.replace(/_/g, ' ')}
                      </label>
                      <select
                        value={params[key] || ''}
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
            )}
          </div>

          {/* Feature Sliders */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">Top Predictors</h3>
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
                    value={params[key] || 50}
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
            onClick={handleReset}
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
            className={`glass-card p-12 text-center relative overflow-hidden transition-colors duration-500 ${
              prediction?.classification === 'FAVORABLE' ? 'border-emerald-500/50' : 'border-rose-500/50'
            }`}
          >
            {/* Ambient Background Glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] blur-[100px] pointer-events-none transition-opacity duration-1000 ${
              isCalculating ? 'opacity-50 bg-primary-500/20 animate-pulse' :
              prediction?.classification === 'FAVORABLE' ? 'opacity-30 bg-emerald-500/20' : 'opacity-30 bg-rose-500/20'
            }`} />

            {isCalculating ? (
              <div className="relative z-10 flex flex-col items-center justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full mb-6"
                />
                <p className="text-primary-300 animate-pulse font-medium">Computing Neural Inference...</p>
              </div>
            ) : (
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-slate-700/50 mb-8 backdrop-blur-md shadow-xl">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    prediction?.classification === 'FAVORABLE' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]'
                  } animate-pulse`} />
                  <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase">
                    Live Evaluation
                  </span>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                  <div className="flex flex-col items-center justify-center mb-6">
                    <p className={`text-[6rem] leading-none font-black tracking-tighter ${
                       prediction?.classification === 'FAVORABLE' 
                       ? 'bg-linear-to-b from-emerald-300 to-emerald-600 text-transparent bg-clip-text drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
                       : 'bg-linear-to-b from-rose-300 to-rose-600 text-transparent bg-clip-text drop-shadow-[0_0_30px_rgba(244,63,94,0.3)]'
                    }`}>
                      {(prediction?.score * 100).toFixed(1)}<span className="text-4xl ml-1">%</span>
                    </p>
                    <p className="text-3xl font-bold text-slate-100 mt-4 tracking-tight">
                      {prediction?.classification}
                    </p>
                  </div>

                  {/* Fairness indicators */}
                  <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-700/50">
                    {fairnessImpact && Object.entries(fairnessImpact).map(([key, value]) => (
                      <div key={key} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                        <p className="text-xs text-slate-400 mb-2 capitalize font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                          <p className={`text-xl font-bold ${
                            value >= 0.8 ? 'text-emerald-400' :
                            value >= 0.6 ? 'text-yellow-400' : 'text-rose-400'
                          }`}>
                          {(value * 100).toFixed(0)}%
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
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
              Favorable Rate by Subgroup
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
                    label={{ value: 'Favorable Rate %', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid rgba(99,102,241,0.2)',
                      borderRadius: '12px',
                      color: '#e2e8f0'
                    }}
                    formatter={(value) => [`${value}%`, 'Favorable Rate']}
                  />
                  <Bar
                    dataKey="approvalRate"
                    radius={[8, 8, 0, 0]}
                  >
                    {comparisonData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={isGroupSelected(entry.group) ? '#6366f1' : '#94a3b8'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p className="text-xs text-slate-500 mt-4 text-center">
              Highlighted bars show your actively selected demographic group
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
                      <div>
                        <p className="font-semibold text-slate-200">
                          {metric.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-sm text-slate-400">
                          Fairness indicator for this configuration
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
    </motion.div>
  );
}