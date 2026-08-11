interface EmptyStateProps {
  title?: string;
  description?: string;
  emoji?: string;
  action?: React.ReactNode;
}

function EmptyState({
  title = 'Your watchlist is empty.',
  description = 'Start tracking your anime & TV series journey!',
  emoji = '🎞️',
  action,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border p-12 text-center"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <span className="text-6xl mb-4">{emoji}</span>
      <h3
        className="text-lg font-bold"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
      >
        {title}
      </h3>
      <p className="text-sm mt-2 max-w-sm" style={{ color: 'var(--text-muted)' }}>
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default EmptyState;
