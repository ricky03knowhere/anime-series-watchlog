import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Film,
  Tv,
  ChevronDown,
  Sparkles,
  Clapperboard,
  Clock,
  Filter,
} from 'lucide-react';
import { analyticsApi } from '@/api/analyticsApi';
import ScoreBadge from '@/components/ScoreBadge';
import GenreBadge from '@/components/GenreBadge';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import { useTheme } from '@/contexts/ThemeContext';
import type { HistoryQueryParams, HistoryData } from '@/types';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function HistoryPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({});

  const filterParams: HistoryQueryParams = {
    year: selectedYear,
    month: selectedMonth,
  };

  const { data: historyRes, isLoading, isError } = useQuery({
    queryKey: ['watch-history', filterParams],
    queryFn: () => analyticsApi.getHistory(filterParams),
  });

  const historyData: HistoryData | undefined = historyRes?.data;
  const historyGroups = historyData?.history || [];
  const availableYears = historyData?.availableYears || [];

  const toggleYearExpand = (year: number) => {
    setExpandedYears((prev) => ({
      ...prev,
      [year]: prev[year] === undefined ? false : !prev[year],
    }));
  };

  const clearFilters = () => {
    setSelectedYear(undefined);
    setSelectedMonth(undefined);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* ─── Header ─── */}
      <div
        className="relative overflow-hidden rounded-3xl border p-6 sm:p-8"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #181825, #261e35, #181825)'
            : 'linear-gradient(135deg, #fdf4ff, #fae8ff, #f0fdf4)',
          borderColor: 'var(--color-primary-300)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))',
                color: 'white',
              }}
            >
              <Clapperboard size={24} />
            </div>
            <div>
              <h1
                className="text-2xl sm:text-3xl font-black tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
              >
                Watch History
              </h1>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Timeline of your media journey organized by completed date
              </p>
            </div>
          </div>

          {/* Stats Pill */}
          {historyData && (
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold shrink-0 self-start sm:self-auto"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              <Clock size={16} className="text-purple-500" />
              <span>{historyData.totalItems} titles logged in history</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Filter Controls ─── */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            <Filter size={14} /> Filter History:
          </div>

          {/* Year Select */}
          <select
            value={selectedYear ?? ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined;
              setSelectedYear(val);
              if (!val) setSelectedMonth(undefined);
            }}
            className="px-3 py-1.5 rounded-xl border text-sm font-semibold outline-none cursor-pointer"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="">All Years</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          {/* Month Select */}
          <select
            value={selectedMonth ?? ''}
            onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : undefined)}
            disabled={!selectedYear}
            className="px-3 py-1.5 rounded-xl border text-sm font-semibold outline-none cursor-pointer disabled:opacity-50"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="">All Months</option>
            {monthNames.map((mName, idx) => (
              <option key={idx} value={idx + 1}>
                {mName}
              </option>
            ))}
          </select>
        </div>

        {(selectedYear !== undefined || selectedMonth !== undefined) && (
          <button
            onClick={clearFilters}
            className="text-xs font-bold text-red-500 hover:underline cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* ─── Loading / Error / Empty ─── */}
      {isLoading && <LoadingSkeleton rows={6} />}

      {isError && (
        <EmptyState
          title="Failed to load watch history"
          description="Check backend server connection and try again."
          emoji="⚠️"
        />
      )}

      {!isLoading && !isError && historyGroups.length === 0 && (
        <EmptyState
          title="No history entries found"
          description={selectedYear ? "No items watched during this timeframe." : "Start logging watched dates on your anime and TV series!"}
          emoji="📅"
          action={
            (selectedYear || selectedMonth) ? (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
                style={{ background: 'var(--color-primary-600)', color: 'white' }}
              >
                Reset Filters
              </button>
            ) : undefined
          }
        />
      )}

      {/* ─── History Timeline Groups ─── */}
      {!isLoading && !isError && historyGroups.length > 0 && (
        <div className="space-y-8 relative">
          {/* Vertical Film Reel Line */}
          <div
            className="absolute left-4 sm:left-8 top-4 bottom-4 w-1 rounded-full pointer-events-none hidden sm:block opacity-30"
            style={{
              background: 'repeating-linear-gradient(to bottom, var(--color-primary-500) 0px, var(--color-primary-500) 12px, transparent 12px, transparent 20px)',
            }}
          />

          {historyGroups.map((yearGroup) => {
            const isCollapsed = expandedYears[yearGroup.year] === false;

            return (
              <div key={yearGroup.year} className="space-y-6">
                {/* Year Header Marker */}
                <div className="sticky top-16 z-20 flex items-center gap-3 bg-opacity-95 backdrop-blur-md py-2">
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl border shadow-md font-black text-lg sm:text-xl"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-800))',
                      color: 'white',
                      borderColor: 'var(--color-primary-400)',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    <Calendar size={20} />
                    <span>{yearGroup.year}</span>
                  </div>

                  <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent" />

                  <button
                    onClick={() => toggleYearExpand(yearGroup.year)}
                    className="p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  >
                    <span>{isCollapsed ? 'Expand' : 'Collapse'}</span>
                    <ChevronDown size={14} className={`transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
                  </button>
                </div>

                {/* Months under this year */}
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-6 pl-0 sm:pl-12"
                    >
                      {yearGroup.months.map((monthGroup) => (
                        <div key={monthGroup.month} className="space-y-3">
                          {/* Month Badge */}
                          <div className="flex items-center gap-2">
                            <span
                              className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-lg border inline-flex items-center gap-1.5"
                              style={{
                                background: 'var(--color-secondary-50)',
                                color: 'var(--color-secondary-800)',
                                borderColor: 'var(--color-secondary-300)',
                              }}
                            >
                              <Film size={12} />
                              {monthGroup.monthName} ({monthGroup.items.length})
                            </span>
                          </div>

                          {/* Items Grid/List */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {monthGroup.items.map((item, idx) => (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.04 }}
                                onClick={() => navigate(`/watchlist/${item.id}`)}
                                className="flex items-center gap-3.5 p-3 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer group relative overflow-hidden"
                                style={{
                                  background: 'var(--bg-card)',
                                  borderColor: 'var(--border)',
                                }}
                              >
                                {/* Left Film Perforation Accent */}
                                <div
                                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                />

                                {/* Poster Thumbnail */}
                                <div className="w-12 h-16 rounded-xl overflow-hidden shrink-0 border border-black/10 dark:border-white/10">
                                  {item.poster_url ? (
                                    <img
                                      src={item.poster_url}
                                      alt={item.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                                      <Film size={16} className="text-gray-400" />
                                    </div>
                                  )}
                                </div>

                                {/* Media Details */}
                                <div className="flex-1 min-w-0">
                                  <h4
                                    className="text-sm font-bold truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
                                    style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
                                  >
                                    {item.title}
                                  </h4>

                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span
                                      className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border"
                                      style={{
                                        background: item.media_type === 'anime' ? 'rgba(168,85,247,0.1)' : 'rgba(6,182,212,0.1)',
                                        color: item.media_type === 'anime' ? '#a855f7' : '#06b6d4',
                                        borderColor: item.media_type === 'anime' ? 'rgba(168,85,247,0.3)' : 'rgba(6,182,212,0.3)',
                                      }}
                                    >
                                      {item.media_type === 'anime' ? <Sparkles size={10} /> : <Tv size={10} />}
                                      {item.media_type === 'anime' ? 'Anime' : 'TV Series'}
                                    </span>

                                    {item.watched_date && (
                                      <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                                        Finished {new Date(item.watched_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                      </span>
                                    )}
                                  </div>

                                  {item.genres && item.genres.length > 0 && (
                                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                                      {item.genres.slice(0, 3).map((g) => (
                                        <GenreBadge key={g.id} name={g.name} />
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Score */}
                                <div className="shrink-0">
                                  <ScoreBadge score={item.score} size="sm" showStars={false} />
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
