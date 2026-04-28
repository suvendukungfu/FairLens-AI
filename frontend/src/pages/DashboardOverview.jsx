import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import KPICard from '../components/KPICard';
import FairnessScoreGauge from '../components/FairnessScoreGauge';
import AlertSystem from '../components/AlertSystem';
import { AlertBanner } from '../components/AnimationUtils';
import DatasetOverview from '../components/DatasetOverview';
import ConfigPanel from '../components/ConfigPanel';
import { runAnalysis } from '../api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

export default function DashboardOverview() {
  const { 
    analysisResult, alerts, addAlert,
    datasetInfo, sessionId, kaggleMeta,
    selectedAttrs, targetColumn, favorableOutcome, 
    setSelectedAttrs, setTargetColumn, setFavorableOutcome,
    isLoading, setIsLoading, setAnalysisResult
  } = useAppStore();

  // Auto-configure from Kaggle metadata
  useEffect(() => {
    if (kaggleMeta && !analysisResult) {
      if (kaggleMeta.suggested_sensitive && selectedAttrs.length === 0) {
        setSelectedAttrs(kaggleMeta.suggested_sensitive);
      }
      if (kaggleMeta.suggested_target && !targetColumn) {
        setTargetColumn(kaggleMeta.suggested_target);
      }
      if (kaggleMeta.suggested_favorable && !favorableOutcome) {
        setFavorableOutcome(kaggleMeta.suggested_favorable);
      }
    }
  }, [kaggleMeta, analysisResult, selectedAttrs.length, targetColumn, favorableOutcome, setSelectedAttrs, setTargetColumn, setFavorableOutcome]);

  // Simulate bias alerts based on analysis
  useEffect(() => {
    if (analysisResult) {
      const newAlerts = [];

      // Check for high bias metrics
      analysisResult.fairness_metrics?.forEach((metric) => {
        if (metric.is_biased && metric.metric_name.includes('Disparate Impact')) {
          const value = metric.value;
          if (value < 0.8 || value > 1.25) {
            newAlerts.push({
              id: Date.now() + Math.random(),
              severity: value < 0.7 ? 'high' : 'medium',
              title: `${metric.metric_name} Alert`,
              message: `Disparate Impact ratio of ${value.toFixed(2)} indicates potential bias.`,
              timestamp: new Date(),
            });
          }
        }
      });

      // Check for group disparities
      analysisResult.group_comparisons?.forEach((comp) => {
        if (Math.abs(comp.difference) > 0.2) {
          newAlerts.push({
            id: Date.now() + Math.random(),
            severity: 'medium',
            title: 'Group Disparity Detected',
            message: `${comp.group_a} vs ${comp.group_b}: ${(comp.difference * 100).toFixed(1)}% difference in selection rate`,
            timestamp: new Date(),
          });
        }
      });

      // Add alerts to store
      newAlerts.forEach(alert => addAlert(alert));
    }
  }, [analysisResult]);

  if (!analysisResult) {
    if (!datasetInfo) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center">
              <svg className="w-12 h-12 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-300 mb-2">No Dataset Found</h3>
            <p className="text-slate-500">Please upload a dataset to continue.</p>
          </motion.div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <DatasetOverview info={datasetInfo} />
        <ConfigPanel 
          columns={datasetInfo.column_names || []}
          selectedAttrs={selectedAttrs}
          onToggleAttr={(attr) => {
            if (selectedAttrs.includes(attr)) {
              setSelectedAttrs(selectedAttrs.filter(a => a !== attr));
            } else {
              setSelectedAttrs([...selectedAttrs, attr]);
            }
          }}
          targetColumn={targetColumn}
          onSetTarget={setTargetColumn}
          favorableOutcome={favorableOutcome}
          onSetFavorableOutcome={setFavorableOutcome}
          datasetInfo={datasetInfo}
          loading={isLoading}
          onRunAnalysis={async () => {
            setIsLoading(true);
            try {
              const result = await runAnalysis(sessionId, selectedAttrs, targetColumn, favorableOutcome);
              setAnalysisResult(result);
            } catch (err) {
              console.error(err);
              addAlert({
                id: Date.now(),
                severity: 'high',
                title: 'Analysis Failed',
                message: err.response?.data?.error || 'An error occurred during analysis.',
                timestamp: new Date()
              });
            } finally {
              setIsLoading(false);
            }
          }}
        />
      </div>
    );
  }

  const metrics = analysisResult.fairness_metrics || [];
  const kpiData = [
    {
      title: 'Model Accuracy',
      value: analysisResult.accuracy || 0,
      unit: '%',
      trend: 2.5,
      status: analysisResult.accuracy >= 90 ? 'good' : analysisResult.accuracy >= 75 ? 'warning' : 'critical',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Overall model performance on test data',
    },
    {
      title: 'Bias Risk Score',
      value: analysisResult.bias_score || 0,
      unit: '',
      trend: -15,
      status: analysisResult.bias_score <= 30 ? 'good' : analysisResult.bias_score <= 60 ? 'warning' : 'critical',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      description: 'Composite score measuring potential bias risk',
    },
    {
      title: 'Disparate Impact',
      value: metrics.find(m => m.metric_name === 'Disparate Impact')?.value || 0,
      trend: 0.2,
      status: 'good',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      description: 'Ratio of positive outcomes between groups',
    },
    {
      title: 'Selection Rate Gap',
      value: Math.abs(metrics.find(m => m.metric_name === 'Selection Rate Difference')?.value || 0) * 100,
      unit: '%',
      trend: -5.3,
      status: 'good',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      ),
      description: 'Difference in positive prediction rates',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Alerts */}
      <AlertSystem />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-black text-slate-100 mb-2">Executive Overview</h1>
          <p className="text-slate-400">
            Real-time fairness insights and model performance at a glance
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Report
        </motion.button>
      </motion.div>

      {/* KPI Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {kpiData.map((kpi, index) => (
          <KPICard key={kpi.title} {...kpi} delay={index * 0.1} />
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Fairness Score Gauge */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1"
        >
          <div className="glass-card p-8">
            <h3 className="text-lg font-bold text-slate-100 mb-6 text-center">
              Overall Fairness Assessment
            </h3>
            <FairnessScoreGauge />
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Demographic Parity</span>
                <span className={`font-semibold ${
                  (metrics.find(m => m.metric_name === 'Demographic Parity Difference')?.value || 0) < 0.1
                    ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {((metrics.find(m => m.metric_name === 'Demographic Parity Difference')?.value || 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Equal Opportunity</span>
                <span className={`font-semibold ${
                  (metrics.find(m => m.metric_name === 'Equal Opportunity Difference')?.value || 0) < 0.1
                    ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {((metrics.find(m => m.metric_name === 'Equal Opportunity Difference')?.value || 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Disparate Impact</span>
                <span className={`font-semibold ${
                  (metrics.find(m => m.metric_name === 'Disparate Impact')?.value || 0) >= 0.8
                    ? 'text-green-400' : 'text-red-400'
                }`}>
                  {(metrics.find(m => m.metric_name === 'Disparate Impact')?.value || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Alerts & Insights */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Bias Alerts & Insights
            </h3>

            {alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-lg border ${
                      alert.severity === 'high'
                        ? 'bg-red-500/10 border-red-500/20'
                        : alert.severity === 'medium'
                        ? 'bg-yellow-500/10 border-yellow-500/20'
                        : 'bg-blue-500/10 border-blue-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="text-lg">
                          {alert.severity === 'high' ? '' : alert.severity === 'medium' ? '' : ''}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-200">{alert.title}</p>
                          <p className="text-sm text-slate-400 mt-1">{alert.message}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-slate-300 mb-2">No Bias Detected</h4>
                <p className="text-slate-500 text-sm">
                  Your model appears to be fair across all measured dimensions
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="glass-card p-6 text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-linear-to-br from-blue-500/20 to-cyan-500/20 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-colors">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 group-hover:text-blue-300 transition-colors">
                View Detailed Metrics
              </h4>
              <p className="text-sm text-slate-400">Explore all fairness metrics</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="glass-card p-6 text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-linear-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-colors">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 group-hover:text-purple-300 transition-colors">
                Try Mitigation
              </h4>
              <p className="text-sm text-slate-400">Apply bias reduction techniques</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="glass-card p-6 text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 group-hover:from-emerald-500/30 group-hover:to-teal-500/30 transition-colors">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors">
                Generate Report
              </h4>
              <p className="text-sm text-slate-400">Download PDF with findings</p>
            </div>
          </div>
        </motion.button>
      </motion.div>
    </div>
  );
}