import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Film,
  Tv,
  Calendar,
  Sparkles,
  ZoomIn,
  Play,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { analyticsApi } from '@/api/analyticsApi';
import ScoreBadge from '@/components/ScoreBadge';
import GenreBadge from '@/components/GenreBadge';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import { useTheme } from '@/contexts/ThemeContext';
import type { TimelineQueryParams, TimelineData } from '@/types';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function TimelinePage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);

  const filterParams: TimelineQueryParams = {
    year: selectedYear,
    month: selectedMonth,
  };

  const { data: timelineRes, isLoading, isError } = useQuery({
    queryKey: ['watching-timeline', filterParams],
    queryFn: () => analyticsApi.getTimeline(filterParams),
  });

  const timelineData: TimelineData | undefined = timelineRes?.data;
  const items = timelineData?.items || [];
  const availableYears = timelineData?.availableYears || [];

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
            ? 'linear-gradient(135deg, #0b1329, #1a2238, #0b1329)'
            : 'linear-gradient(135deg, #ecfeff, #cffafe, #e0e7ff)',
          borderColor: 'var(--color-secondary-400)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(135deg, var(--color-secondary-500), var(--color-secondary-700))',
                color: 'white',
              }}
            >
              <Film size={24} />
            </div>
            <div>
              <h1
                className="text-2xl sm:text-3xl font-black tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
              >
                Watching Timeline
              </h1>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Visual chronological reel of your watched titles
              </p>
            </div>
          </div>

          {timelineData && (
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold shrink-0 self-start sm:self-auto"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              <Clock size={16} className="text-cyan-500" />
              <span>{timelineData.totalItems} events logged</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Zoom & Filter Controls ─── */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            <ZoomIn size={14} /> Zoom Level:
          </div>

          {/* Year Zoom */}
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
                Year {yr}
              </option>
            ))}
          </select>

          {/* Month Zoom */}
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
            className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 hover:underline cursor-pointer"
          >
            <RotateCcw size={12} /> Reset Zoom
          </button>
        )}
      </div>

      {/* ─── Loading / Error / Empty ─── */}
      {isLoading && <LoadingSkeleton rows={6} />}

      {isError && (
        <EmptyState
          title="Failed to load timeline"
          description="Check backend server connection and try again."
          emoji="⚠️"
        />
      )}

      {!isLoading && !isError && items.length === 0 && (
        <EmptyState
          title="No timeline events found"
          description={selectedYear ? "No titles completed during this timeframe." : "Log watched dates on titles to build your reel!"}
          emoji="🎞️"
          action={
            (selectedYear || selectedMonth) ? (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
                style={{ background: 'var(--color-secondary-600)', color: 'white' }}
              >
                Reset Zoom
              </button>
            ) : undefined
          }
        />
      )}

      {/* ─── Film Reel Vertical Timeline ─── */}
      {!isLoading && !isError && items.length > 0 && (
        <div className="relative py-4">
          {/* Center Vertical Film Strip Track (Desktop) */}
          <div
            className="absolute left-4 md:left-1/2 top-0 bottom-0 w-2 -ml-1 rounded-full pointer-events-none"
            style={{
              background: isDark
                ? 'linear-gradient(to bottom, var(--color-primary-500), var(--color-secondary-500), var(--color-accent-400))'
                : 'linear-gradient(to bottom, var(--color-primary-400), var(--color-secondary-400), var(--color-accent-500))',
            }}
          />

          <div className="space-y-8">
            {items.map((item, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  className={`relative flex flex-col md:flex-row items-start ${
                    isEven ? 'md:flex-row-reverse' : ''
                  } group`}
                >
                  {/* Timeline Reel Node Pin */}
                  <div
                    className="absolute left-4 md:left-1/2 -ml-3 top-6 w-6 h-6 rounded-full border-4 shadow-lg z-10 flex items-center justify-center transition-transform group-hover:scale-125 cursor-pointer"
                    style={{
                      background: item.media_type === 'anime' ? '#a855f7' : '#06b6d4',
                      borderColor: 'var(--bg)',
                    }}
                    onClick={() => navigate(`/watchlist/${item.id}`)}
                  >
                    <Play size={8} fill="white" className="text-white ml-0.5" />
                  </div>

                  {/* Content Box */}
                  <div className="ml-12 md:ml-0 md:w-[calc(50%-2rem)] w-[calc(100%-3rem)]">
                    <div
                      onClick={() => navigate(`/watchlist/${item.id}`)}
                      className="p-4 sm:p-5 rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer relative overflow-hidden group/card"
                      style={{
                        background: 'var(--bg-card)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      {/* Top Accent Strip */}
                      <div
                        className="absolute inset-x-0 top-0 h-1 transition-opacity opacity-70 group-hover/card:opacity-100"
                        style={{
                          background: item.media_type === 'anime'
                            ? 'linear-gradient(90deg, #a855f7, #ec4899)'
                            : 'linear-gradient(90deg, #06b6d4, #3b82f6)',
                        }}
                      />

                      <div className="flex gap-4">
                        {/* Poster */}
                        <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-2xl overflow-hidden shrink-0 border border-black/10 dark:border-white/10 shadow-md">
                          {item.poster_url ? (
                            <img
                              src={item.poster_url}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                              <Film size={20} className="text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Watched Date */}
                          {item.watched_date && (
                            <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-cyan-600 dark:text-cyan-400">
                              <Calendar size={12} />
                              {new Date(item.watched_date).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                          )}

                          <h3
                            className="text-base sm:text-lg font-extrabold truncate group-hover/card:text-purple-600 dark:group-hover/card:text-purple-400 transition-colors"
                            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
                          >
                            {item.title}
                          </h3>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border"
                              style={{
                                background: item.media_type === 'anime' ? 'rgba(168,85,247,0.1)' : 'rgba(6,182,212,0.1)',
                                color: item.media_type === 'anime' ? '#a855f7' : '#06b6d4',
                                borderColor: item.media_type === 'anime' ? 'rgba(168,85,247,0.3)' : 'rgba(6,182,212,0.3)',
                              }}
                            >
                              {item.media_type === 'anime' ? <Sparkles size={10} /> : <Tv size={10} />}
                              {item.media_type === 'anime' ? 'Anime' : 'TV Series'}
                            </span>

                            {item.studio && (
                              <span className="text-[10px] font-semibold text-gray-500">
                                {item.studio.name}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <ScoreBadge score={item.score} size="sm" showStars={false} />

                            {item.genres && item.genres.length > 0 && (
                              <div className="hidden sm:flex items-center gap-1">
                                {item.genres.slice(0, 2).map((g) => (
                                  <GenreBadge key={g.id} name={g.name} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default TimelinePage;
