import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

export default function BiasScoreGauge({ score: externalScore }) {
  const { analysisResult } = useAppStore();
  const score = externalScore || analysisResult?.bias_score || 0;
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    setAnimatedScore(0);
    let current = 0;
    const increment = score / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(current);
      }
    }, 33);

    return () => clearInterval(timer);
  }, [score]);

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (animatedScore / 100) * circumference;
  const getScoreColor = (value) => {
    if (value < 20) return '#22c55e';
    if (value < 50) return '#f59e0b';
    return '#ef4444';
  };
  const color = getScoreColor(score);
  const label = score < 20 ? 'Low Risk' : score < 50 ? 'Moderate Risk' : 'High Risk';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="glass-card p-6 flex flex-col items-center"
      id="bias-score-gauge"
    >
      <h3 className="text-lg font-bold text-slate-100 mb-4">Bias Risk Score</h3>

      {/* Gauge */}
      <div className="relative w-32 h-32">
        <motion.svg
          className="w-32 h-32 transform -rotate-90"
          viewBox="0 0 100 100"
          initial={{ rotate: -90 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {/* Background */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(51,65,85,0.3)"
            strokeWidth="8"
          />
          {/* Progress */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${color}40)`,
            }}
          />
        </motion.svg>

        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="text-3xl font-black text-slate-100"
          >
            {Math.round(animatedScore)}
          </motion.span>
          <span className="text-xs text-slate-400">/100</span>
        </div>
      </div>

      {/* Label */}
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-4 px-3 py-1 rounded-full text-xs font-semibold"
        style={{
          backgroundColor: `${color}20`,
          color,
          border: `1px solid ${color}40`,
        }}
      >
        {label}
      </motion.span>
    </motion.div>
  );
}