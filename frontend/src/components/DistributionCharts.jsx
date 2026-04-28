import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { ChartSkeleton } from './Skeleton';

const COLORS = ['#6366f1', '#818cf8', '#a78bfa', '#c4b5fd', '#ddd6fe', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#ec4899'];

export default function DistributionCharts({ distributions, loading = false }) {
  const [zoomedChart, setZoomedChart] = useState(null);
  const [chartType, setChartType] = useState('both'); // 'bar', 'pie', 'both'
  const [filteredAttrs, setFilteredAttrs] = useState(new Set());

  const handleExport = (attribute, format = 'png') => {
    const chartElement = document.querySelector(`[data-chart="${attribute}"]`);
    if (chartElement && window.html2canvas) {
      window.html2canvas(chartElement).then(canvas => {
        const link = document.createElement('a');
        link.download = `${attribute}-distribution.${format}`;
        link.href = canvas.toDataURL(`image/${format}`);
        link.click();
      });
    }
  };

  const toggleFilter = (attribute) => {
    const newFiltered = new Set(filteredAttrs);
    if (newFiltered.has(attribute)) {
      newFiltered.delete(attribute);
    } else {
      newFiltered.add(attribute);
    }
    setFilteredAttrs(newFiltered);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up" id="distribution-charts">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  if (!distributions || distributions.length === 0) return null;

  const filteredDistributions = distributions.filter(dist => !filteredAttrs.has(dist.attribute));

  return (
    <div className="space-y-6 animate-fade-in-up" id="distribution-charts">
      {/* Chart Controls */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-300">Chart Type:</span>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-1 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="both">Bar & Pie</option>
              <option value="bar">Bar Chart Only</option>
              <option value="pie">Pie Chart Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-300">Filter Attributes:</span>
            <div className="flex gap-1 flex-wrap">
              {distributions.map((dist) => (
                <button
                  key={dist.attribute}
                  onClick={() => toggleFilter(dist.attribute)}
                  className={`px-2 py-1 text-xs rounded-full transition-colors ${
                    filteredAttrs.has(dist.attribute)
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  {dist.attribute}
                  {filteredAttrs.has(dist.attribute) && (
                    <span className="ml-1">×</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {filteredDistributions.map((dist) => {
        const data = Object.entries(dist.distribution).map(([name, value], i) => ({
          name,
          value,
          percentage: dist.percentages[name],
          fill: COLORS[i % COLORS.length],
        }));

        return (
          <div key={dist.attribute} className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-bold text-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-400" />
                {dist.attribute} Distribution
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomedChart(zoomedChart === dist.attribute ? null : dist.attribute)}
                  className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
                  title={zoomedChart === dist.attribute ? 'Minimize chart' : 'Maximize chart'}
                >
                  {zoomedChart === dist.attribute ? (
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4m6 6l-6-6m6-6l-6 6" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => handleExport(dist.attribute, 'png')}
                  className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
                  title="Export as PNG"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
            <div
              data-chart={dist.attribute}
              className={`grid gap-6 ${
                chartType === 'both' ? 'grid-cols-1 lg:grid-cols-2' :
                chartType === 'bar' ? 'grid-cols-1' : 'grid-cols-1'
              } ${zoomedChart === dist.attribute ? 'h-96' : 'h-64'}`}
            >
              {/* Bar Chart */}
              {(chartType === 'bar' || chartType === 'both') && (
                <div className={chartType === 'both' ? '' : 'col-span-full'}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.3)" />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', color: '#e2e8f0' }}
                        formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, 'Count']}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {data.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Pie Chart */}
              {(chartType === 'pie' || chartType === 'both') && (
                <div className={chartType === 'both' ? '' : 'col-span-full'}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%" cy="50%"
                        innerRadius={zoomedChart === dist.attribute ? 60 : 50}
                        outerRadius={zoomedChart === dist.attribute ? 100 : 80}
                        dataKey="value"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                      >
                        {data.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', color: '#e2e8f0' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
