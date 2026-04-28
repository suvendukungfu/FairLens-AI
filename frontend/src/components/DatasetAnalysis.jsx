import DistributionCharts from './DistributionCharts';

export default function DatasetAnalysis({ distributions, datasetInfo }) {
  if (!distributions || !datasetInfo) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 col-span-1">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary-500 rounded-full" />
            Dataset Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/30 border border-slate-700/20">
              <span className="text-slate-400 text-sm">Total Rows</span>
              <span className="text-white font-bold">{datasetInfo.rows.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/30 border border-slate-700/20">
              <span className="text-slate-400 text-sm">Total Features</span>
              <span className="text-white font-bold">{datasetInfo.cols}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/30 border border-slate-700/20">
              <span className="text-slate-400 text-sm">Missing Values</span>
              <span className={`font-bold ${datasetInfo.missing > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                {datasetInfo.missing}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 col-span-2">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary-500 rounded-full" />
            Feature Types
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(datasetInfo.types).map(([col, type]) => (
              <div key={col} className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/30 flex items-center gap-3">
                <span className="text-slate-200 text-sm font-semibold">{col}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-black ${
                  type === 'object' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-8">
        <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-primary-500 rounded-full" />
          Feature Distributions
        </h3>
        <DistributionCharts distributions={distributions} />
      </div>
    </div>
  );
}
