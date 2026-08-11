import { useLocation } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { Menu, Moon, Sun, Search } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const pageTitles: Record<string, string> = {
  '/': '🏠 Dashboard',
  '/watchlist': '🎬 Watchlist',
  '/top-10': '🏆 Top 10',
  '/history': '📅 Watch History',
  '/genres': '🏷️ Genres',
  '/studios': '🏢 Studios',
  '/insights': '📊 Insights',
  '/settings': '⚙️ Settings',
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];

  // Check prefix matches
  for (const [path, title] of Object.entries(pageTitles)) {
    if (path !== '/' && pathname.startsWith(path)) return title;
  }

  return '🎬 AnimeSeries Watchlog';
}

function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme, isDark } = useTheme();
  const { toggleMobile } = useSidebar();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const title = getPageTitle(location.pathname);

  return (
    <header
      className="sticky top-0 z-30 backdrop-blur-xl border-b"
      style={{
        background: isDark
          ? 'rgba(15, 17, 32, 0.85)'
          : 'rgba(250, 248, 245, 0.85)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* ─── Left: Mobile hamburger + Title ─── */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobile}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl transition-colors cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--border-subtle)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <h1
            className="text-lg font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            {title}
          </h1>
        </div>

        {/* ─── Right: Search + Theme Toggle ─── */}
        <div className="flex items-center gap-2">
          {/* Search Toggle */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 240, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="hidden sm:block overflow-hidden"
              >
                <input
                  type="text"
                  placeholder="Search anime, series..."
                  autoFocus
                  className="w-full h-9 px-3 text-sm rounded-xl border outline-none transition-colors"
                  style={{
                    background: 'var(--bg-card)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  onBlur={() => setIsSearchOpen(false)}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary-400)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168,85,247,0.15)';
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl transition-colors cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            aria-label="Toggle search"
          >
            <Search size={18} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, var(--color-primary-800), var(--color-primary-900))'
                : 'linear-gradient(135deg, var(--color-accent-200), var(--color-accent-300))',
              color: isDark ? 'var(--color-accent-300)' : 'var(--color-primary-700)',
            }}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <motion.div
              key={theme}
              initial={{ y: -20, opacity: 0, rotate: -90 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 20, opacity: 0, rotate: 90 }}
              transition={{ duration: 0.3 }}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </motion.div>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
