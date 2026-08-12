import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  Crown,
  Medal,
  Star,
  Film,
  Tv,
  Filter,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { analyticsApi } from '@/api/analyticsApi';
import { genreApi } from '@/api/genreApi';
import { studioApi } from '@/api/studioApi';
import ScoreBadge from '@/components/ScoreBadge';
import GenreBadge from '@/components/GenreBadge';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import { useTheme } from '@/contexts/ThemeContext';
import type { Top10QueryParams, Top10Item } from '@/types';

// ─── Rank Visual Config ─────────────────────────────────

function getRankStyle(rank: number): {
  gradient: string;
  accent: string;
  icon: React.ReactNode;
  label: string;
  glow: string;
} {
  if (rank === 1) return {
    gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)',
    accent: '#fbbf24',
    icon: <Crown size={24} strokeWidth={2.5} />,
    label: 'CHAMPION',
    glow: '0 0 30px rgba(251,191,36,0.4)',
  };
  if (rank === 2) return {
    gradient: 'linear-gradient(135deg, #22d3ee, #06b6d4, #0891b2)',
    accent: '#06b6d4',
    icon: <Medal size={22} strokeWidth={2.5} />,
    label: 'RUNNER-UP',
    glow: '0 0 25px rgba(6,182,212,0.35)',
  };
  if (rank === 3) return {
    gradient: 'linear-gradient(135deg, #c084fc, #a855f7, #7c3aed)',
    accent: '#a855f7',
    icon: <Trophy size={22} strokeWidth={2.5} />,
    label: 'THIRD PLACE',
    glow: '0 0 25px rgba(168,85,247,0.35)',
  };
  return {
    gradient: 'var(--bg-card)',
    accent: 'var(--text-muted)',
    icon: <Star size={18} />,
    label: '',
    glow: 'none',
  };
}

// ─── Year Range Generator ───────────────────────────────

function getYearOptions(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear; y >= 2000; y--) {
    years.push(y);
  }
  return years;
}

// ─── Main Component ─────────────────────────────────────

function Top10Page() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<Top10QueryParams>({
    sort: 'score',
  });

  // Fetch genres & studios for filter dropdowns
  const { data: genresRes } = useQuery({
    queryKey: ['genres-list'],
    queryFn: () => genreApi.getAll(),
  });
  const { data: studiosRes } = useQuery({
    queryKey: ['studios-list'],
    queryFn: () => studioApi.getAll(),
  });

  const genres = genresRes?.data || [];
  const studios = studiosRes?.data || [];

  // Fetch Top 10
  const { data: top10Res, isLoading, isError } = useQuery({
    queryKey: ['top10', filters],
    queryFn: () => analyticsApi.getTop10(filters),
  });

  const top10: Top10Item[] = top10Res?.data || [];

  const updateFilter = (key: keyof Top10QueryParams, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  // ─── Render ─────────────────────────────────────────

  return (
    <div className="space-y-6 pb-10">
      {/* ─── Header ─── */}
      <div className="relative overflow-hidden rounded-3xl border p-6 sm:p-8"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #1e1b4b, #312e81, #1e1b4b)'
            : 'linear-gradient(135deg, #faf5ff, #fef3c7, #ecfeff)',
          borderColor: 'var(--color-primary-300)',
        }}
      >
        {/* Decorative starburst */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #facc15, transparent 70%)' }}
        />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)' }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)', boxShadow: '0 0 20px rgba(251,191,36,0.3)' }}
            >
              <Trophy size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
              >
                TOP 10 WATCHLIST
              </h1>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Your highest rated anime & TV series
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Filter Toggle ─── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all hover:shadow-md cursor-pointer"
          style={{
            background: showFilters ? 'var(--color-primary-600)' : 'var(--bg-card)',
            color: showFilters ? 'white' : 'var(--text-primary)',
            borderColor: showFilters ? 'var(--color-primary-600)' : 'var(--border)',
          }}
        >
          <Filter size={16} />
          Filters
          <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* Active sort label */}
        <span className="text-xs font-semibold px-3 py-1 rounded-full border"
          style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
        >
          Sorted by: {filters.sort === 'score' ? '⭐ Highest Score' : filters.sort === 'episodes' ? '📺 Most Episodes' : '📅 Recently Watched'}
        </span>
      </div>

      {/* ─── Filter Panel ─── */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-2xl border p-5 space-y-4"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Year Filter */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                Release Year
              </label>
              <select
                value={filters.year ?? ''}
                onChange={(e) => updateFilter('year', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none cursor-pointer"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                <option value="">All Years</option>
                {getYearOptions().map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                Media Type
              </label>
              <select
                value={filters.type ?? ''}
                onChange={(e) => updateFilter('type', e.target.value || undefined)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none cursor-pointer"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                <option value="">All Types</option>
                <option value="anime">Anime</option>
                <option value="tv_series">TV Series</option>
              </select>
            </div>

            {/* Genre Filter */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                Genre
              </label>
              <select
                value={filters.genre ?? ''}
                onChange={(e) => updateFilter('genre', e.target.value || undefined)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none cursor-pointer"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                <option value="">All Genres</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            {/* Studio Filter */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                Studio
              </label>
              <select
                value={filters.studio ?? ''}
                onChange={(e) => updateFilter('studio', e.target.value || undefined)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none cursor-pointer"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                <option value="">All Studios</option>
                {studios.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                Sort By
              </label>
              <select
                value={filters.sort ?? 'score'}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none cursor-pointer"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                <option value="score">Highest Score</option>
                <option value="episodes">Most Episodes</option>
                <option value="watched_date">Recently Watched</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setFilters({ sort: 'score' })}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20"
              style={{ color: '#ef4444' }}
            >
              Reset Filters
            </button>
          </div>
        </motion.div>
      )}

      {/* ─── Loading ─── */}
      {isLoading && <LoadingSkeleton rows={5} />}

      {/* ─── Error ─── */}
      {isError && (
        <EmptyState
          title="Failed to load rankings"
          description="Check your backend connection and try again."
          emoji="⚠️"
        />
      )}

      {/* ─── Empty State ─── */}
      {!isLoading && !isError && top10.length === 0 && (
        <EmptyState
          title="No rankings found"
          description="Try changing your filters or add more titles to your watchlist."
          emoji="🏆"
          action={
            <button
              onClick={() => setFilters({ sort: 'score' })}
              className="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
              style={{ background: 'var(--color-primary-600)', color: 'white' }}
            >
              Clear Filters
            </button>
          }
        />
      )}

      {/* ─── Ranking Cards ─── */}
      {!isLoading && !isError && top10.length > 0 && (
        <div className="space-y-4">
          {top10.map((item, idx) => {
            const rank = idx + 1;
            const style = getRankStyle(rank);
            const isTopThree = rank <= 3;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-0.5 cursor-pointer ${isTopThree ? 'hover:shadow-xl' : 'hover:shadow-lg'}`}
                style={{
                  background: 'var(--bg-card)',
                  borderColor: isTopThree ? style.accent : 'var(--border)',
                  boxShadow: isTopThree ? style.glow : undefined,
                }}
                onClick={() => navigate(`/watchlist/${item.id}`)}
              >
                {/* Top 3 gradient border accent */}
                {isTopThree && (
                  <div className="absolute inset-x-0 top-0 h-1" style={{ background: style.gradient }} />
                )}

                <div className={`flex items-center gap-4 sm:gap-6 ${isTopThree ? 'p-4 sm:p-5' : 'p-3 sm:p-4'}`}>
                  {/* ─── Rank Number ─── */}
                  <div
                    className={`flex flex-col items-center justify-center shrink-0 rounded-xl ${isTopThree ? 'w-14 h-14 sm:w-16 sm:h-16' : 'w-10 h-10 sm:w-12 sm:h-12'}`}
                    style={{
                      background: isTopThree ? style.gradient : 'var(--bg)',
                      color: isTopThree ? 'white' : 'var(--text-muted)',
                    }}
                  >
                    {isTopThree && <span className="mb-0.5">{style.icon}</span>}
                    <span className={`font-black ${isTopThree ? 'text-lg sm:text-xl' : 'text-base'}`} style={{ fontFamily: 'var(--font-heading)' }}>
                      #{String(rank).padStart(2, '0')}
                    </span>
                  </div>

                  {/* ─── Poster ─── */}
                  <div
                    className={`shrink-0 rounded-xl overflow-hidden border-2 transition-transform group-hover:scale-105 ${isTopThree ? 'w-16 h-22 sm:w-20 sm:h-28' : 'w-12 h-17 sm:w-14 sm:h-20'}`}
                    style={{ borderColor: isTopThree ? style.accent : 'var(--border)' }}
                  >
                    {item.poster_url ? (
                      <img
                        src={item.poster_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--border-subtle)' }}>
                        <Film size={20} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}
                  </div>

                  {/* ─── Info ─── */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <h3
                      className={`font-bold truncate ${isTopThree ? 'text-base sm:text-lg' : 'text-sm sm:text-base'}`}
                      style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
                    >
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Type badge */}
                      <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-md border"
                        style={{
                          background: item.media_type === 'anime' ? 'rgba(168,85,247,0.1)' : 'rgba(6,182,212,0.1)',
                          color: item.media_type === 'anime' ? '#a855f7' : '#06b6d4',
                          borderColor: item.media_type === 'anime' ? 'rgba(168,85,247,0.3)' : 'rgba(6,182,212,0.3)',
                        }}
                      >
                        {item.media_type === 'anime' ? <Sparkles size={10} /> : <Tv size={10} />}
                        {item.media_type === 'anime' ? 'Anime' : 'TV Series'}
                      </span>

                      {/* Release year */}
                      {item.release_date && (
                        <span className="text-[10px] sm:text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                          {new Date(item.release_date).getFullYear()}
                        </span>
                      )}

                      {/* Studio */}
                      {item.studio && (
                        <span className="text-[10px] sm:text-[11px] font-medium px-1.5 py-0.5 rounded border"
                          style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-subtle)' }}
                        >
                          {item.studio.name}
                        </span>
                      )}
                    </div>

                    {/* Genre badges */}
                    {item.genres.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {item.genres.slice(0, 4).map((g) => (
                          <GenreBadge key={g.id} name={g.name} />
                        ))}
                        {item.genres.length > 4 && (
                          <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                            +{item.genres.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ─── Score ─── */}
                  <div className="shrink-0 text-right">
                    <ScoreBadge score={item.score} size={isTopThree ? 'lg' : 'md'} showStars={isTopThree} />
                    {item.episodes && (
                      <p className="text-[10px] font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
                        {item.episodes} eps
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ─── Dynamic Title Summary ─── */}
      {!isLoading && !isError && top10.length > 0 && (
        <div className="text-center pt-4">
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            {filters.type ? (filters.type === 'anime' ? 'Top 10 Anime' : 'Top 10 TV Series') : 'Top 10 Overall'}
            {filters.year ? ` · ${filters.year}` : ''}
            {filters.genre ? ` · ${genres.find((g) => g.id === filters.genre)?.name || 'Genre'}` : ''}
            {filters.studio ? ` · ${studios.find((s) => s.id === filters.studio)?.name || 'Studio'}` : ''}
          </p>
        </div>
      )}
    </div>
  );
}

export default Top10Page;
