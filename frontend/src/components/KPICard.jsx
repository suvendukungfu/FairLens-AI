import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'number') {
    return decimals > 0 ? value.toFixed(decimals) : Math.round(value);
  }
  return value;
}

function getTrendIcon(trend) {
  if (!trend) return null;
  return trend > 0 ? '↗' : trend < 0 ? '↘' : '→';
}

function getTrendColor(trend) {
  if (!trend) return 'text-slate-400';
  return trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-slate-400';
}

export default function KPICard({
  title,
  value,
  unit = '',
  trend,
  trendLabel = 'vs last period',
  status = 'neutral', // 'good', 'warning', 'critical', 'neutral'
  icon,
  description,
  delay = 0,
}) {
  const { theme, accentColor } = useAppStore();

  const statusStyles = {
    good: {
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-500/10',
    },
    warning: {
      border: 'border-yellow-500/30',
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-400',
      glow: 'shadow-yellow-500/10',
    },
    critical: {
      border: 'border-red-500/30',
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      glow: 'shadow-red-500/10',
    },
    neutral: {
      border: 'border-slate-600/30',
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      glow: 'shadow-slate-500/10',
    },
  };

  const style = statusStyles[status];

  return (
    <motion.div
      custom={delay}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`relative glass-card p-6 border ${style.border} hover:shadow-lg ${style.glow} transition-all duration-300 group`}
    >
      {/* Background gradient effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${style.bg} opacity-50 group-hover:opacity-70 transition-opacity rounded-xl`} />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
            <div className="flex items-baseline gap-1">
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: delay + 0.2 }}
                className={`text-3xl font-black ${style.text}`}
              >
                {formatNumber(value)}
              </motion.span>
              {unit && <span className="text-sm text-slate-500">{unit}</span>}
            </div>
          </div>

          {icon && (
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className={`p-3 rounded-xl bg-slate-800/50 ${style.text}`}
            >
              {icon}
            </motion.div>
          )}
        </div>

        {/* Trend indicator */}
        {trend !== undefined && trend !== null && (
          <div className={`flex items-center gap-2 text-sm ${getTrendColor(trend)}`}>
            <span className="font-bold">{getTrendIcon(trend)}</span>
            <span>{Math.abs(trend).toFixed(1)}%</span>
            <span className="text-slate-500 text-xs">{trendLabel}</span>
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-xs text-slate-500 mt-3 leading-relaxed">
            {description}
          </p>
        )}

        {/* Status indicator */}
        <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${style.bg.replace('bg-', 'bg-').replace('/10', '')} animate-pulse`} />
      </div>
    </motion.div>
  );
}