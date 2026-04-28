import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { CardSkeleton } from '../components/Skeleton';

export default function Reports() {
  const { analysisResult } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportFormat, setReportFormat] = useState('pdf');
  const [includeSections, setIncludeSections] = useState({
    executive: true,
    metrics: true,
    bias: true,
    mitigation: true,
    recommendations: true,
  });

  if (!analysisResult) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-20"
      >
        <p className="text-slate-400">Run analysis first to generate reports</p>
      </motion.div>
    );
  }

  const handleExport = async (format) => {
    if (format !== 'pdf') return;
    setIsGenerating(true);

    try {
      const { session_id, config } = analysisResult;
      const { favorableOutcome } = useAppStore.getState();
      const response = await fetch('/api/report/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id,
          sensitive_attributes: config.sensitive_attributes,
          target_column: config.target_column,
          favorable_outcome: favorableOutcome,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fairlens-report-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportAsJSON = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      dataset: analysisResult.dataset_info,
      fairnessScore: analysisResult.fairness_score,
      metrics: analysisResult.fairness_metrics,
      comparisons: analysisResult.group_comparisons,
      biases: analysisResult.bias_flags,
      recommendations: generateRecommendations(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fairlens-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = () => {
    const metrics = analysisResult.fairness_metrics || [];
    const headers = ['Metric', 'Value', 'Threshold', 'Is Biased', 'Explanation'];
    const rows = metrics.map(m => [
      m.metric_name,
      m.value,
      m.threshold,
      m.is_biased,
      m.explanation,
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fairlens-metrics-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateRecommendations = () => {
    const recommendations = [];

    if (analysisResult.fairness_score < 70) {
      recommendations.push('Apply bias mitigation techniques before deployment');
    }

    const biasedMetrics = analysisResult.fairness_metrics?.filter(m => m.is_biased) || [];
    if (biasedMetrics.length > 0) {
      recommendations.push(`Address bias in: ${biasedMetrics.map(m => m.metric_name).join(', ')}`);
    }

    if (analysisResult.group_comparisons?.some(c => Math.abs(c.difference) > 0.2)) {
      recommendations.push('Significant group disparities detected - consider collecting more balanced data');
    }

    return recommendations;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-5xl"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2 flex items-center gap-3">
          <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Report Generation
        </h2>
        <p className="text-slate-400">
          Export your fairness analysis as professional reports
        </p>
      </div>

      {/* Report Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-slate-100">Report Preview</h3>
          <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-sm">
            Ready to Export
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Fairness Score', value: `${analysisResult.fairness_score}%`, color: 'emerald' },
            { label: 'Bias Risk', value: analysisResult.bias_score > 60 ? 'HIGH' : analysisResult.bias_score > 30 ? 'MEDIUM' : 'LOW', color: analysisResult.bias_score > 60 ? 'red' : 'yellow' },
            { label: 'Metrics Analyzed', value: analysisResult.fairness_metrics?.length || 0, color: 'blue' },
            { label: 'Biased Metrics', value: analysisResult.fairness_metrics?.filter(m => m.is_biased).length || 0, color: 'red' },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="p-4 text-center"
            >
              <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
              <p className={`text-2xl font-black text-${stat.color}-400`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Detailed Metrics Table */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-slate-200 mb-4">Fairness Metrics Summary</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/30">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Metric</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Value</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-medium">Threshold</th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {analysisResult.fairness_metrics?.slice(0, 5).map((metric, idx) => (
                  <motion.tr
                    key={metric.metric_name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                    className="border-b border-slate-800/30"
                  >
                    <td className="py-3 px-4 text-slate-200">{metric.metric_name}</td>
                    <td className="py-3 px-4 text-right font-mono">
                      <span className={metric.is_biased ? 'text-red-400' : 'text-emerald-400'}>
                        {(metric.value * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      {(metric.threshold * 100).toFixed(0)}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        metric.is_biased
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {metric.is_biased ? ' Issue' : ' OK'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="text-lg font-semibold text-slate-200 mb-4">Recommendations</h4>
          <ul className="space-y-2">
            {generateRecommendations().map((rec, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg"
              >
                <span className="text-emerald-400 mt-0.5">•</span>
                <span className="text-slate-300 text-sm">{rec}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Export Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* PDF Export */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Generate PDF Report</h3>
          <p className="text-sm text-slate-400 mb-6">
            Create a professional, printable report with full analysis details
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-500 block mb-2">Include Sections</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(includeSections).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setIncludeSections(prev => ({
                        ...prev,
                        [key]: e.target.checked,
                      }))}
                      className="rounded bg-slate-700 border-slate-600"
                    />
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleExport('pdf')}
              disabled={isGenerating}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF Report
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Other Formats */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Other Export Formats</h3>
          <p className="text-sm text-slate-400 mb-6">
            Raw data exports for further analysis
          </p>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportAsJSON}
              className="w-full p-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700/30 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-200">JSON Export</p>
                  <p className="text-xs text-slate-500">All metrics and comparisons</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportAsCSV}
              className="w-full p-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700/30 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-200">CSV Export</p>
                  <p className="text-xs text-slate-500">Metrics table only</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-slate-500 group-hover:text-green-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}