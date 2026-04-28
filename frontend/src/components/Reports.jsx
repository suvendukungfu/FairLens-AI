import { downloadReport } from '../api';

export default function Reports({ auditResults, config }) {
  const handleDownload = async () => {
    try {
      await downloadReport(config.sessionId, config.sensitiveAttributes, config.targetColumn);
    } catch (err) {
      console.error("Report download failed:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="glass-card p-12 text-center space-y-8 animate-fade-in">
        <div className="w-24 h-24 bg-primary-500/10 rounded-3xl flex items-center justify-center mx-auto ring-1 ring-primary-500/20">
          <svg className="w-12 h-12 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-white">Generate Audit Report</h2>
          <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
            Download a comprehensive PDF report containing all fairness metrics, bias flags, mitigation results, and executive summaries.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={handleDownload}
            className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-bold shadow-xl shadow-primary-900/20 transition-all active:scale-95 flex items-center gap-3 mx-auto"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download PDF Report
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-700/30">
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Status</p>
            <p className="text-green-400 font-semibold text-sm flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Ready
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Format</p>
            <p className="text-slate-300 font-semibold text-sm">PDF (A4)</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Pages</p>
            <p className="text-slate-300 font-semibold text-sm">~4-6 Pages</p>
          </div>
        </div>
      </div>
    </div>
  );
}
