import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}

// Temporary home page to verify setup works
function HomePage() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="text-center space-y-6">
        {/* Retro film strip accent */}
        <div className="flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full"
              style={{
                background:
                  i % 3 === 0
                    ? 'var(--color-primary-500)'
                    : i % 3 === 1
                      ? 'var(--color-secondary-400)'
                      : 'var(--color-accent-400)',
              }}
            />
          ))}
        </div>

        <h1
          className="text-5xl font-extrabold tracking-tight"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          <span style={{ color: 'var(--color-primary-500)' }}>Anime</span>
          <span style={{ color: 'var(--color-secondary-400)' }}>Series</span>
          <br />
          <span style={{ color: 'var(--color-accent-400)' }}>Watchlog</span>
        </h1>

        <p
          className="text-lg max-w-md mx-auto"
          style={{ color: 'var(--text-secondary)' }}
        >
          Your personal retro-style anime &amp; TV series tracker.
          <br />
          Phase 1 setup complete — ready to build! 🎬
        </p>

        <div className="flex justify-center gap-3">
          <span
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'var(--color-primary-600)' }}
          >
            React + Vite + TS
          </span>
          <span
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'var(--color-secondary-600)' }}
          >
            Express API
          </span>
          <span
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{
              background: 'var(--color-accent-400)',
              color: 'var(--color-accent-900)',
            }}
          >
            Supabase
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
