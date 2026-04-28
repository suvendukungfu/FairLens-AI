export default function BiasFlags({ flags }) {
  if (!flags || flags.length === 0) return null;

  const severityIcons = {
    high: '🔴',
    medium: '🟡',
    low: '🟢',
  };

  return (
    <div className="glass-card p-6 animate-fade-in-up" id="bias-flags">
      <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        Bias Flags
        <span className="ml-auto text-sm font-normal text-slate-500">{flags.length} detected</span>
      </h3>
      <div className="space-y-3">
        {flags.map((flag, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl border transition-all hover:scale-[1.01] ${
              flag.severity === 'high' ? 'bg-red-500/5 border-red-500/20' :
              flag.severity === 'medium' ? 'bg-amber-500/5 border-amber-500/20' :
              'bg-green-500/5 border-green-500/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg">{severityIcons[flag.severity]}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold badge-${flag.severity}`}>
                    {flag.severity.toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold text-slate-200">{flag.bias_type}</span>
                  <span className="text-xs text-slate-500">in {flag.attribute}</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{flag.description}</p>
                {flag.affected_groups.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {flag.affected_groups.map((g) => (
                      <span key={g} className="text-xs px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-400 border border-slate-600/30">
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
