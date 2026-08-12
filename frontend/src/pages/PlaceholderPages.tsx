interface PlaceholderPageProps {
  title: string;
  description: string;
  emoji: string;
  phase: string;
}

function PlaceholderPage({ title, description, emoji, phase }: PlaceholderPageProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border p-12 text-center"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border)',
        minHeight: 'calc(100svh - 200px)',
      }}
    >
      <span className="text-6xl mb-4">{emoji}</span>
      <h2
        className="text-2xl font-bold"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
      >
        {title}
      </h2>
      <p className="text-sm mt-2 max-w-md" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>
      <span
        className="mt-4 text-xs px-3 py-1.5 rounded-full font-semibold"
        style={{
          background: 'var(--color-primary-100)',
          color: 'var(--color-primary-700)',
        }}
      >
        Coming in {phase}
      </span>
    </div>
  );
}

export function WatchlistPage() {
  return (
    <PlaceholderPage
      title="Watchlist"
      description="Browse, search, filter, and sort your anime & TV series collection."
      emoji="🎬"
      phase="Phase 5"
    />
  );
}



export function GenresPage() {
  return (
    <PlaceholderPage
      title="Genres"
      description="Manage and explore your genre categories."
      emoji="🏷️"
      phase="Phase 5"
    />
  );
}

export function StudiosPage() {
  return (
    <PlaceholderPage
      title="Studios"
      description="Manage and explore anime & TV studios."
      emoji="🏢"
      phase="Phase 5"
    />
  );
}

export function InsightsPage() {
  return (
    <PlaceholderPage
      title="Insights"
      description="Deep analytics about your watching personality and trends."
      emoji="📊"
      phase="Phase 9"
    />
  );
}

export function NotFoundPage() {
  return (
    <PlaceholderPage
      title="Page Not Found"
      description="The page you're looking for doesn't exist. Head back to the dashboard!"
      emoji="🔍"
      phase="—"
    />
  );
}
