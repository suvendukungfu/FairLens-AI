export default function Skeleton({ className = '', variant = 'default' }) {
  const baseClasses = 'bg-slate-700/50 rounded-lg animate-pulse';

  const variants = {
    default: 'h-4',
    text: 'h-4',
    title: 'h-6',
    card: 'h-32',
    button: 'h-10 w-24',
    avatar: 'h-10 w-10 rounded-full',
    chart: 'h-64',
    table: 'h-8',
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`} />
  );
}

// Pre-built skeleton components for common use cases
export function CardSkeleton() {
  return (
    <div className="glass-card p-6 space-y-4">
      <Skeleton variant="title" className="w-3/4" />
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-5/6" />
      <div className="flex gap-2">
        <Skeleton variant="button" />
        <Skeleton variant="button" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="glass-card p-6">
      <Skeleton variant="title" className="w-1/2 mb-4" />
      <Skeleton variant="chart" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="glass-card p-6">
      <Skeleton variant="title" className="w-1/3 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} variant="table" className="flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card p-6 text-center">
          <Skeleton variant="avatar" className="mx-auto mb-4" />
          <Skeleton variant="title" className="w-3/4 mx-auto mb-2" />
          <Skeleton variant="text" className="w-1/2 mx-auto" />
        </div>
      ))}
    </div>
  );
}