import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

export default function FairnessScoreGauge() {
  const { analysisResult } = useAppStore();
  const [animatedScore, setAnimatedScore] = useState(0);

  const score = analysisResult?.fairness_score || 0;

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const getScoreColor = (value) => {
    if (value >= 80) return { bg: 'from-green-500 to-emerald-500', border: 'border-green-500/30', text: 'text-green-400' };
    if (value >= 60) return { bg: 'from-yellow-500 to-amber-500', border: 'border-yellow-500/30', text: 'text-yellow-400' };
    if (value >= 40) return { bg: 'from-orange-500 to-amber-600', border: 'border-orange-500/30', text: 'text-orange-400' };
    return { bg: 'from-red-500 to-rose-600', border: 'border-red-500/30', text: 'text-red-400' };
  };

  const colors = getScoreColor(animatedScore);
  const percentage = Math.min(animatedScore, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative w-48 h-48 mx-auto"
    >
      {/* Outer glow ring */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${colors.bg} opacity-20 blur-xl animate-pulse`} />

      {/* Main gauge */}
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-700/30"
        />

        {/* Progress arc */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={`url(#gradient-${animatedScore})`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />

        {/* Gradient definitions */}
        <defs>
          <linearGradient id={`gradient-${animatedScore}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.bg.includes('green') ? '#22c55e' : colors.bg.includes('yellow') ? '#f59e0b' : colors.bg.includes('orange') ? '#f97316' : '#ef4444'} />
            <stop offset="100%" stopColor={colors.bg.includes('green') ? '#22c55e' : colors.bg.includes('yellow') ? '#f59e0b' : colors.bg.includes('orange') ? '#f97316' : '#ef4444'} style={{ stopOpacity: 0.6 }} />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className={`text-5xl font-black ${colors.text}`}>
            {Math.round(animatedScore)}
          </p>
          <p className="text-xs uppercase tracking-wider text-slate-400 mt-1">Fairness Score</p>
        </motion.div>
      </div>

      {/* Indicator needle */}
      <motion.div
        className="absolute w-1 h-1 bg-white rounded-full"
        style={{
          left: '50%',
          top: '50%',
          transformOrigin: '0 0',
        }}
        animate={{ rotate: (percentage / 100) * 180 - 90 }}
        transition={{ duration: 2, ease: 'easeOut' }}
      >
        <div
          className="absolute w-8 -left-8"
          style={{
            borderLeft: `2px solid ${colors.bg.includes('green') ? '#22c55e' : colors.bg.includes('yellow') ? '#f59e0b' : colors.bg.includes('orange') ? '#f97316' : '#ef4444'}`,
            transformOrigin: 'right center',
          }}
        />
      </motion.div>
    </motion.div>
  );
}