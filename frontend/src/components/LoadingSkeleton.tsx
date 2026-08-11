interface LoadingSkeletonProps {
  rows?: number;
}

function LoadingSkeleton({ rows = 5 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-xl border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="w-[50px] h-[70px] rounded-lg shrink-0" style={{ background: 'var(--border)' }} />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/5 rounded" style={{ background: 'var(--border)' }} />
            <div className="h-3 w-3/5 rounded" style={{ background: 'var(--border-subtle)' }} />
            <div className="flex gap-2">
              <div className="h-5 w-12 rounded" style={{ background: 'var(--border-subtle)' }} />
              <div className="h-5 w-16 rounded" style={{ background: 'var(--border-subtle)' }} />
            </div>
          </div>
          <div className="h-6 w-10 rounded-lg" style={{ background: 'var(--border)' }} />
        </div>
      ))}
    </div>
  );
}

export default LoadingSkeleton;
