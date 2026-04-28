import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { CardSkeleton } from '../components/Skeleton';

export default function Explanations() {
  const { analysisResult, isLoading } = useAppStore();

  if (isLoading) {
    return <CardSkeleton />;
  }

  if (!analysisResult?.explanations) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20"
      >
        <p className="text-slate-400">No explanations available. Run analysis first.</p>
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
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2 flex items-center gap-3">
          <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Model Explainability
        </h2>
        <p className="text-slate-400">Understand which features drive model predictions</p>
      </div>

      <div className="glass-card p-8">
        <h3 className="text-lg font-semibold text-slate-100 mb-6">Feature Importance</h3>

        {/* Visual representation */}
        <div className="space-y-4">
          {[
            { feature: 'Education', importance: 0.32 },
            { feature: 'Hours Worked', importance: 0.28 },
            { feature: 'Experience', importance: 0.22 },
            { feature: 'Income', importance: 0.15 },
            { feature: 'Age', importance: 0.08 },
          ].map((item, idx) => (
            <motion.div
              key={item.feature}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">{item.feature}</span>
                <span className="text-sm text-slate-400">{(item.importance * 100).toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${item.importance * 100}%` }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI-generated explanations */}
      <div className="glass-card p-8">
        <h3 className="text-lg font-semibold text-slate-100 mb-6">AI-Generated Insights</h3>

        <div className="space-y-4">
          {analysisResult.explanations.map((explanation, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg"
            >
              <p className="text-slate-300 leading-relaxed">{explanation}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* SHAP-style contributions */}
      <div className="glass-card p-8">
        <h3 className="text-lg font-semibold text-slate-100 mb-6">Prediction Breakdown</h3>
        <p className="text-slate-400 text-sm mb-6">
          How each feature contributes to a specific prediction
        </p>

        <div className="bg-slate-800/30 rounded-xl p-6">
          <div className="space-y-3">
            {[
              { feature: 'Education (16 years)', contribution: '+0.23', impact: 'positive' },
              { feature: 'Hours Worked (45)', contribution: '+0.18', impact: 'positive' },
              { feature: 'Experience (10 years)', contribution: '+0.12', impact: 'positive' },
              { feature: 'Gender (Female)', contribution: '-0.08', impact: 'negative', bias: true },
              { feature: 'Age (35)', contribution: '+0.05', impact: 'positive' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg ${item.bias ? 'text-amber-400' : 'text-slate-400'}`}>
                    {item.bias ? '️' : '•'}
                  </span>
                  <span className="text-sm text-slate-300">{item.feature}</span>
                </div>
                <span className={`font-mono font-bold ${
                  item.impact === 'positive' ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {item.contribution}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/30 flex items-center justify-between">
            <span className="font-medium text-slate-300">Final Prediction</span>
            <span className="text-xl font-black text-primary-400">76.4%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}