import { NavLink, useLocation } from 'react-router-dom';
import { useSidebar } from '@/contexts/SidebarContext';
import {
  LayoutDashboard,
  Film,
  Trophy,
  History,
  Tags,
  Building2,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  X,
  Clapperboard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  group: string;
}

const navItems: NavItem[] = [
  // MAIN
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, group: 'MAIN' },
  { label: 'Watchlist', path: '/watchlist', icon: <Film size={20} />, group: 'MAIN' },
  { label: 'Top 10', path: '/top-10', icon: <Trophy size={20} />, group: 'MAIN' },
  { label: 'Watch History', path: '/history', icon: <History size={20} />, group: 'MAIN' },
  // ANALYTICS
  { label: 'Insights', path: '/insights', icon: <BarChart3 size={20} />, group: 'ANALYTICS' },
  // MANAGEMENT
  { label: 'Genres', path: '/genres', icon: <Tags size={20} />, group: 'MANAGEMENT' },
  { label: 'Studios', path: '/studios', icon: <Building2 size={20} />, group: 'MANAGEMENT' },
];

function Sidebar() {
  const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } = useSidebar();
  const location = useLocation();

  const groups = ['MAIN', 'ANALYTICS', 'MANAGEMENT'] as const;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* ─── Logo ─── */}
      <div
        className="flex items-center gap-3 px-5 py-5 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div
          className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-secondary-500))',
            boxShadow: 'var(--shadow-glow-primary)',
          }}
        >
          <Clapperboard size={18} color="white" />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <span
                className="text-lg font-bold tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
              >
                <span style={{ color: 'var(--color-primary-500)' }}>Anime</span>
                <span style={{ color: 'var(--color-secondary-400)' }}>Series</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Navigation ─── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {groups.map((group) => {
          const items = navItems.filter((item) => item.group === group);
          if (items.length === 0) return null;

          return (
            <div key={group}>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2 px-3"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {group}
                  </motion.p>
                )}
              </AnimatePresence>

              <ul className="space-y-1">
                {items.map((item) => {
                  const isActive =
                    item.path === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.path);

                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={closeMobile}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{
                          color: isActive ? 'white' : 'var(--text-secondary)',
                          background: isActive
                            ? 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700))'
                            : 'transparent',
                          boxShadow: isActive ? 'var(--shadow-glow-primary)' : 'none',
                          justifyContent: isCollapsed ? 'center' : 'flex-start',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'var(--border-subtle)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }
                        }}
                      >
                        <span className="shrink-0">{item.icon}</span>
                        <AnimatePresence>
                          {!isCollapsed && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: 'auto' }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.15 }}
                              className="overflow-hidden whitespace-nowrap"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* ─── Collapse Toggle (Desktop only) ─── */}
      <div
        className="hidden lg:flex items-center justify-center py-4 border-t"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={toggleCollapse}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200 cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--border-subtle)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* ─── Retro Film Strip Decoration ─── */}
      <div
        className="h-2 w-full"
        style={{
          background:
            'repeating-linear-gradient(90deg, var(--color-primary-600) 0px, var(--color-primary-600) 8px, transparent 8px, transparent 12px, var(--color-secondary-500) 12px, var(--color-secondary-500) 20px, transparent 20px, transparent 24px)',
          opacity: 0.6,
        }}
      />
    </div>
  );

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
      <aside
        className="hidden lg:flex flex-col fixed top-0 left-0 h-svh z-40 transition-all duration-300 border-r"
        style={{
          width: isCollapsed ? '72px' : '256px',
          background: 'var(--bg-sidebar)',
          borderColor: 'var(--border)',
        }}
      >
        {sidebarContent}
      </aside>

      {/* ─── Mobile Overlay ─── */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={closeMobile}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 h-svh w-[280px] z-50 lg:hidden flex flex-col border-r"
              style={{
                background: 'var(--bg-sidebar)',
                borderColor: 'var(--border)',
              }}
            >
              <button
                onClick={closeMobile}
                className="absolute top-4 right-4 p-1 rounded-lg transition-colors cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
