function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
        >
          Welcome to Your Watchlog
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Track. Rate. Discover. Repeat.
        </p>
      </div>

      {/* Placeholder stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Watched', value: '—', emoji: '🎬' },
          { label: 'Anime', value: '—', emoji: '🍥' },
          { label: 'TV Series', value: '—', emoji: '📺' },
          { label: 'Avg Score', value: '—', emoji: '⭐' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-5 border transition-shadow hover:shadow-lg"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
            }}
          >
            <span className="text-2xl">{stat.emoji}</span>
            <p
              className="text-2xl font-bold mt-2"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              {stat.value}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div
        className="rounded-2xl border p-8 text-center"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <p className="text-4xl mb-3">🎞️</p>
        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
          Dashboard charts coming in Phase 7
        </p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Charts, analytics, and personality insights will appear here.
        </p>
      </div>
    </div>
  );
}

export default DashboardPage;
