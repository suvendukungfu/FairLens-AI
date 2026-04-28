export default function ConfigPanel({ columns, selectedAttrs, onToggleAttr, targetColumn, onSetTarget, onRunAnalysis, loading }) {
  const categoricalCols = columns || [];
  const canRun = selectedAttrs.length > 0 && targetColumn;

  return (
    <div className="glass-card p-6 animate-fade-in-up" id="config-panel">
      <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
        Configuration
      </h3>

      {/* Sensitive Attributes */}
      <div className="mb-5">
        <label className="text-sm text-slate-400 font-medium block mb-2">
          Select Sensitive Attributes
        </label>
        <div className="flex flex-wrap gap-2">
          {categoricalCols.map((col) => (
            <button
              key={col}
              onClick={() => onToggleAttr(col)}
              className={`chip ${selectedAttrs.includes(col) ? 'chip-selected' : 'chip-unselected'}`}
              id={`attr-chip-${col}`}
            >
              {selectedAttrs.includes(col) && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
              {col}
            </button>
          ))}
        </div>
      </div>

      {/* Target Column */}
      <div className="mb-5">
        <label className="text-sm text-slate-400 font-medium block mb-2">
          Target / Outcome Column
        </label>
        <select
          value={targetColumn}
          onChange={(e) => onSetTarget(e.target.value)}
          className="w-full p-3 rounded-xl bg-slate-800/60 border border-slate-600/40 text-slate-200 focus:border-primary-500 focus:outline-none transition-colors"
          id="target-column-select"
        >
          <option value="">Select target column...</option>
          {categoricalCols.map((col) => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>
      </div>

      {/* Run Button */}
      <button
        onClick={onRunAnalysis}
        disabled={!canRun || loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
        id="run-analysis-btn"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Detect Bias
          </>
        )}
      </button>
    </div>
  );
}
