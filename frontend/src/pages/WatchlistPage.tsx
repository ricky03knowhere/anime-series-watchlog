import { useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, X, LayoutGrid, LayoutList, ArrowUpDown, ArrowUp, ArrowDown, Plus, Edit3, Trash2, Eye, Film, Tag, Building2, Calendar, Star, ChevronDown, RotateCcw,
} from 'lucide-react';
import { mediaApi } from '@/api/mediaApi';
import { genreApi } from '@/api/genreApi';
import { studioApi } from '@/api/studioApi';
import { useDebounce } from '@/hooks/useDebounce';
import ScoreBadge from '@/components/ScoreBadge';
import GenreBadge from '@/components/GenreBadge';
import Pagination from '@/components/Pagination';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';
import MediaForm from '@/components/MediaForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/contexts/ToastContext';
import type { Media, Genre, Studio, MediaQueryParams } from '@/types';

type ViewMode = 'table' | 'grid';
type SortField = 'title' | 'release_date' | 'score' | 'watched_date' | 'created_at';
type SortOrder = 'asc' | 'desc';

function WatchlistPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  // ─── State ───
  const [searchText, setSearchText] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [limit, setLimit] = useState(Number(searchParams.get('limit')) || 10);
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  const [genreFilter, setGenreFilter] = useState(searchParams.get('genre') || '');
  const [studioFilter, setStudioFilter] = useState(searchParams.get('studio') || '');
  const [yearFilter, setYearFilter] = useState(searchParams.get('releaseYear') || '');
  const [minScoreFilter, setMinScoreFilter] = useState(searchParams.get('minScore') || '');
  const [sortBy, setSortBy] = useState<SortField>((searchParams.get('sortBy') as SortField) || 'watched_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>((searchParams.get('sortOrder') as SortOrder) || 'desc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const hasActiveFilters = Boolean(
    searchText || typeFilter || genreFilter || studioFilter || yearFilter || minScoreFilter
  );
  const activeFilterCount = [
    Boolean(searchText),
    Boolean(typeFilter),
    Boolean(genreFilter),
    Boolean(studioFilter),
    Boolean(yearFilter),
    Boolean(minScoreFilter),
  ].filter(Boolean).length;

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);
  const [deletingMedia, setDeletingMedia] = useState<Media | null>(null);

  const debouncedSearch = useDebounce(searchText, 400);

  // Build query params
  const queryParams: MediaQueryParams = {
    page,
    limit,
    search: debouncedSearch || undefined,
    type: (typeFilter as MediaQueryParams['type']) || undefined,
    genre: genreFilter || undefined,
    studio: studioFilter || undefined,
    releaseYear: yearFilter ? Number(yearFilter) : undefined,
    minScore: minScoreFilter ? Number(minScoreFilter) : undefined,
    sortBy,
    sortOrder,
  };

  // Fetch data
  const { data: mediaResult, isLoading, isError } = useQuery({
    queryKey: ['media', queryParams],
    queryFn: () => mediaApi.getAll(queryParams),
  });

  const { data: genresResult } = useQuery({
    queryKey: ['genres-list'],
    queryFn: () => genreApi.getAll(),
    staleTime: 10 * 60 * 1000,
  });

  const { data: studiosResult } = useQuery({
    queryKey: ['studios-list'],
    queryFn: () => studioApi.getAll(),
    staleTime: 10 * 60 * 1000,
  });

  const mediaItems: Media[] = mediaResult?.data || [];
  const pagination = mediaResult?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const genres: Genre[] = genresResult?.data || [];
  const studios: Studio[] = studiosResult?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => mediaApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      setIsAddOpen(false);
      showToast('Media added to watchlist', 'success');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to add media', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => mediaApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      setEditingMedia(null);
      showToast('Media updated successfully', 'success');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to update media', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mediaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      setDeletingMedia(null);
      showToast('Media removed from watchlist', 'success');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to delete media', 'error');
    },
  });

  const seedMutation = useMutation({
    mutationFn: () => mediaApi.seedDatabase(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['genres-list'] });
      queryClient.invalidateQueries({ queryKey: ['studios-list'] });
      showToast(res.message || 'Initial sample dataset applied successfully!', 'success');
    },
    onError: (err: any) => {
      showToast(err.message || 'Seed failed', 'error');
    },
  });

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortBy === field) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(field);
        setSortOrder('desc');
      }
      setPage(1);
    },
    [sortBy]
  );

  const handleResetFilters = () => {
    setSearchText('');
    setTypeFilter('');
    setGenreFilter('');
    setStudioFilter('');
    setYearFilter('');
    setMinScoreFilter('');
    setSortBy('watched_date');
    setSortOrder('desc');
    setPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return <ArrowUpDown size={14} className="opacity-30" />;
    return sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  return (
    <div className="space-y-5">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
            Watchlist
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {pagination.total} title{pagination.total !== 1 ? 's' : ''} in your collection
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Media Button */}
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-white shadow-md transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700))',
              boxShadow: 'var(--shadow-glow-primary)',
            }}
          >
            <Plus size={16} /> Add Media
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => setViewMode('table')}
              className="flex items-center justify-center w-9 h-9 transition-colors cursor-pointer"
              style={{
                background: viewMode === 'table' ? 'var(--color-primary-600)' : 'var(--bg-card)',
                color: viewMode === 'table' ? 'white' : 'var(--text-muted)',
              }}
              aria-label="Table view"
            >
              <LayoutList size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className="flex items-center justify-center w-9 h-9 transition-colors cursor-pointer"
              style={{
                background: viewMode === 'grid' ? 'var(--color-primary-600)' : 'var(--bg-card)',
                color: viewMode === 'grid' ? 'white' : 'var(--text-muted)',
              }}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Unified Search & Inline Filter Bar ─── */}
      <div
        className="p-2 sm:p-2.5 rounded-2xl border transition-all shadow-xs"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* ── Search Input ── */}
          <div className="relative flex-1 min-w-[200px] sm:min-w-[220px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
              style={{ color: searchText ? 'var(--color-primary-500)' : 'var(--text-muted)' }}
            />
            <input
              type="text"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPage(1);
              }}
              placeholder="Search anime, series, studio..."
              className="w-full h-9.5 pl-8.5 pr-8 text-xs sm:text-sm font-medium rounded-xl border outline-none transition-all duration-200"
              style={{
                background: 'var(--bg)',
                borderColor: searchText ? 'var(--color-primary-500)' : 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            {searchText && (
              <button
                type="button"
                onClick={() => {
                  setSearchText('');
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md hover:opacity-75 transition-opacity cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* ── Filter: Type ── */}
          <div className="relative flex-1 sm:flex-initial min-w-[115px]">
            <div
              className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
              style={{ color: typeFilter ? 'var(--color-primary-500)' : 'var(--text-muted)' }}
            >
              <Film size={13} />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by media type"
              className="w-full h-9.5 pl-7.5 pr-7 text-xs font-medium rounded-xl border outline-none appearance-none cursor-pointer transition-all duration-200"
              style={{
                background: typeFilter ? 'var(--color-primary-50)' : 'var(--bg)',
                borderColor: typeFilter ? 'var(--color-primary-500)' : 'var(--border)',
                color: typeFilter ? 'var(--color-primary-700)' : 'var(--text-primary)',
                fontWeight: typeFilter ? 600 : 500,
              }}
            >
              <option value="" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>All Types</option>
              <option value="anime" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>Anime</option>
              <option value="tv_series" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>TV Series</option>
            </select>
            <ChevronDown
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
              style={{ color: typeFilter ? 'var(--color-primary-500)' : 'var(--text-muted)' }}
            />
          </div>

          {/* ── Filter: Genre ── */}
          <div className="relative flex-1 sm:flex-initial min-w-[125px]">
            <div
              className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
              style={{ color: genreFilter ? 'var(--color-primary-500)' : 'var(--text-muted)' }}
            >
              <Tag size={13} />
            </div>
            <select
              value={genreFilter}
              onChange={(e) => {
                setGenreFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by genre"
              className="w-full h-9.5 pl-7.5 pr-7 text-xs font-medium rounded-xl border outline-none appearance-none cursor-pointer transition-all duration-200"
              style={{
                background: genreFilter ? 'var(--color-primary-50)' : 'var(--bg)',
                borderColor: genreFilter ? 'var(--color-primary-500)' : 'var(--border)',
                color: genreFilter ? 'var(--color-primary-700)' : 'var(--text-primary)',
                fontWeight: genreFilter ? 600 : 500,
              }}
            >
              <option value="" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>All Genres</option>
              {genres.map((g) => (
                <option key={g.id} value={g.id} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                  {g.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
              style={{ color: genreFilter ? 'var(--color-primary-500)' : 'var(--text-muted)' }}
            />
          </div>

          {/* ── Filter: Studio ── */}
          <div className="relative flex-1 sm:flex-initial min-w-[125px]">
            <div
              className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
              style={{ color: studioFilter ? 'var(--color-primary-500)' : 'var(--text-muted)' }}
            >
              <Building2 size={13} />
            </div>
            <select
              value={studioFilter}
              onChange={(e) => {
                setStudioFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by studio"
              className="w-full h-9.5 pl-7.5 pr-7 text-xs font-medium rounded-xl border outline-none appearance-none cursor-pointer transition-all duration-200"
              style={{
                background: studioFilter ? 'var(--color-primary-50)' : 'var(--bg)',
                borderColor: studioFilter ? 'var(--color-primary-500)' : 'var(--border)',
                color: studioFilter ? 'var(--color-primary-700)' : 'var(--text-primary)',
                fontWeight: studioFilter ? 600 : 500,
              }}
            >
              <option value="" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>All Studios</option>
              {studios.map((s) => (
                <option key={s.id} value={s.id} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
              style={{ color: studioFilter ? 'var(--color-primary-500)' : 'var(--text-muted)' }}
            />
          </div>

          {/* ── Filter: Year ── */}
          <div className="relative flex-1 sm:flex-initial min-w-[110px]">
            <div
              className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
              style={{ color: yearFilter ? 'var(--color-primary-500)' : 'var(--text-muted)' }}
            >
              <Calendar size={13} />
            </div>
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by release year"
              className="w-full h-9.5 pl-7.5 pr-7 text-xs font-medium rounded-xl border outline-none appearance-none cursor-pointer transition-all duration-200"
              style={{
                background: yearFilter ? 'var(--color-primary-50)' : 'var(--bg)',
                borderColor: yearFilter ? 'var(--color-primary-500)' : 'var(--border)',
                color: yearFilter ? 'var(--color-primary-700)' : 'var(--text-primary)',
                fontWeight: yearFilter ? 600 : 500,
              }}
            >
              <option value="" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>All Years</option>
              {Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
              style={{ color: yearFilter ? 'var(--color-primary-500)' : 'var(--text-muted)' }}
            />
          </div>

          {/* ── Filter: Rating ── */}
          <div className="relative flex-1 sm:flex-initial min-w-[115px]">
            <div
              className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
              style={{ color: minScoreFilter ? '#eab308' : 'var(--text-muted)' }}
            >
              <Star size={13} className={minScoreFilter ? 'fill-amber-400 text-amber-400' : ''} />
            </div>
            <select
              value={minScoreFilter}
              onChange={(e) => {
                setMinScoreFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by minimum score"
              className="w-full h-9.5 pl-7.5 pr-7 text-xs font-medium rounded-xl border outline-none appearance-none cursor-pointer transition-all duration-200"
              style={{
                background: minScoreFilter ? 'var(--color-accent-50)' : 'var(--bg)',
                borderColor: minScoreFilter ? 'var(--color-accent-400)' : 'var(--border)',
                color: minScoreFilter ? 'var(--color-accent-800)' : 'var(--text-primary)',
                fontWeight: minScoreFilter ? 600 : 500,
              }}
            >
              <option value="" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>All Ratings</option>
              <option value="9" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>9+ ★★★★★</option>
              <option value="8" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>8+ ★★★★</option>
              <option value="7" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>7+ ★★★</option>
              <option value="6" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>&lt;7 ★</option>
            </select>
            <ChevronDown
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
              style={{ color: minScoreFilter ? 'var(--color-accent-600)' : 'var(--text-muted)' }}
            />
          </div>

          {/* ── Clear / Reset Filters Button ── */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center justify-center gap-1.5 h-9.5 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer hover:opacity-90 active:scale-98 shrink-0"
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
              }}
              title="Clear all filters & search"
            >
              <RotateCcw size={12} />
              <span>Clear</span>
              <span
                className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white shadow-xs"
                style={{ background: '#ef4444' }}
              >
                {activeFilterCount}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Main List Content ─── */}
      {isLoading ? (
        <LoadingSkeleton rows={limit > 10 ? 10 : limit} />
      ) : isError ? (
        <EmptyState title="Failed to load watchlist" description="Check backend API connection and try again." emoji="⚠️" />
      ) : mediaItems.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? 'No titles found.' : 'Your watchlist is empty.'}
          description={
            hasActiveFilters
              ? 'Try adjusting your filters or search terms.'
              : 'Start adding anime & TV series to your collection!'
          }
          emoji={hasActiveFilters ? '🔍' : '🎞️'}
          action={
            hasActiveFilters ? (
              <button
                onClick={handleResetFilters}
                className="text-sm font-semibold px-4 py-2 rounded-xl text-white cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: 'var(--color-primary-600)' }}
              >
                Clear Filters
              </button>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="text-sm font-semibold px-4 py-2 rounded-xl text-white cursor-pointer"
                  style={{ background: 'var(--color-primary-600)' }}
                >
                  + Add First Title
                </button>
                <button
                  onClick={() => seedMutation.mutate()}
                  disabled={seedMutation.isPending}
                  className="text-sm font-semibold px-4 py-2 rounded-xl border transition-colors cursor-pointer disabled:opacity-50"
                  style={{
                    background: 'var(--bg-card)',
                    borderColor: 'var(--color-secondary-400)',
                    color: 'var(--color-secondary-600)',
                  }}
                >
                  {seedMutation.isPending ? 'Seeding...' : '🌱 Seed Sample Data'}
                </button>
              </div>
            )
          }
        />
      ) : viewMode === 'table' ? (
        /* ─── TABLE VIEW ─── */
        <div className="overflow-x-auto rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
          <table className="w-full text-sm" style={{ background: 'var(--bg-card)' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid var(--border)` }}>
                <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  #
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Poster
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold cursor-pointer select-none"
                  style={{ color: 'var(--text-muted)' }}
                  onClick={() => handleSort('title')}
                >
                  <span className="flex items-center gap-1">
                    Title <SortIcon field="title" />
                  </span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Type
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold cursor-pointer select-none"
                  style={{ color: 'var(--text-muted)' }}
                  onClick={() => handleSort('release_date')}
                >
                  <span className="flex items-center gap-1">
                    Release <SortIcon field="release_date" />
                  </span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Genre
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Studio
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold cursor-pointer select-none"
                  style={{ color: 'var(--text-muted)' }}
                  onClick={() => handleSort('score')}
                >
                  <span className="flex items-center gap-1">
                    Score <SortIcon field="score" />
                  </span>
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold cursor-pointer select-none"
                  style={{ color: 'var(--text-muted)' }}
                  onClick={() => handleSort('watched_date')}
                >
                  <span className="flex items-center gap-1">
                    Watched <SortIcon field="watched_date" />
                  </span>
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {mediaItems.map((item, idx) => (
                <tr
                  key={item.id}
                  className="transition-colors"
                  style={{ borderBottom: `1px solid var(--border-subtle)` }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--border-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {(page - 1) * limit + idx + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div
                      onClick={() => navigate(`/watchlist/${item.id}`)}
                      className="w-[50px] h-[70px] rounded-lg overflow-hidden border cursor-pointer group"
                      style={{ borderColor: 'var(--border)', background: 'var(--border-subtle)' }}
                    >
                      {item.poster_url ? (
                        <img
                          src={item.poster_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg">🎬</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold max-w-[200px]" style={{ color: 'var(--text-primary)' }}>
                    <span
                      onClick={() => navigate(`/watchlist/${item.id}`)}
                      className="hover:underline cursor-pointer"
                    >
                      {item.title}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-md font-medium border"
                      style={{
                        background: item.media_type === 'anime' ? 'var(--color-primary-50)' : 'var(--color-secondary-50)',
                        color: item.media_type === 'anime' ? 'var(--color-primary-700)' : 'var(--color-secondary-700)',
                        borderColor: item.media_type === 'anime' ? 'var(--color-primary-200)' : 'var(--color-secondary-200)',
                      }}
                    >
                      {item.media_type === 'anime' ? 'Anime' : 'TV Series'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {item.release_date ? new Date(item.release_date).getFullYear() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {(item.media_genres
                        ? item.media_genres.map((mg: any) => mg.genre).filter(Boolean)
                        : item.genres || []
                      )
                        .slice(0, 3)
                        .map((g: any) => (
                          <GenreBadge key={g.id} name={g.name} />
                        ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {item.studio?.name || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <ScoreBadge score={item.score} showStars />
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {item.watched_date
                      ? new Date(item.watched_date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(`/watchlist/${item.id}`)}
                        className="p-1.5 rounded-lg transition-colors cursor-pointer"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--border)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                        title="View Details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => setEditingMedia(item)}
                        className="p-1.5 rounded-lg transition-colors cursor-pointer"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--border)';
                          e.currentTarget.style.color = 'var(--color-primary-600)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                        title="Edit Media"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => setDeletingMedia(item)}
                        className="p-1.5 rounded-lg transition-colors cursor-pointer"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#fef2f2';
                          e.currentTarget.style.color = '#dc2626';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                        title="Delete Media"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* ─── GRID VIEW ─── */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border overflow-hidden transition-all duration-200 cursor-pointer group flex flex-col"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                onClick={() => navigate(`/watchlist/${item.id}`)}
                className="aspect-[2/3] overflow-hidden relative"
                style={{ background: 'var(--border-subtle)' }}
              >
                {item.poster_url ? (
                  <img
                    src={item.poster_url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🎬</div>
                )}
                <div className="absolute top-2 right-2">
                  <ScoreBadge score={item.score} />
                </div>
                <div className="absolute bottom-2 left-2">
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-bold text-white"
                    style={{
                      background: item.media_type === 'anime' ? 'var(--color-primary-600)' : 'var(--color-secondary-600)',
                    }}
                  >
                    {item.media_type === 'anime' ? 'ANIME' : 'TV'}
                  </span>
                </div>
              </div>

              <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    onClick={() => navigate(`/watchlist/${item.id}`)}
                    className="text-sm font-bold leading-tight line-clamp-2 hover:underline"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    {item.studio?.name || 'Unknown Studio'} • {item.release_date ? new Date(item.release_date).getFullYear() : '—'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t mt-2" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex flex-wrap gap-1">
                    {(item.media_genres
                      ? item.media_genres.map((mg: any) => mg.genre).filter(Boolean)
                      : item.genres || []
                    )
                      .slice(0, 2)
                      .map((g: any) => (
                        <GenreBadge key={g.id} name={g.name} />
                      ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingMedia(item)}
                      className="p-1 rounded transition-colors cursor-pointer"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => setDeletingMedia(item)}
                      className="p-1 rounded text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Pagination ─── */}
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        limit={limit}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
      />

      {/* ─── Add Modal ─── */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Title to Watchlist" maxWidth="xl">
        <MediaForm
          genres={genres}
          studios={studios}
          onSubmit={async (data) => {
            await createMutation.mutateAsync(data);
          }}
          onCancel={() => setIsAddOpen(false)}
          isLoading={createMutation.isPending}
        />
      </Modal>

      {/* ─── Edit Modal ─── */}
      <Modal isOpen={!!editingMedia} onClose={() => setEditingMedia(null)} title="Edit Media Title" maxWidth="xl">
        <MediaForm
          initialData={editingMedia}
          genres={genres}
          studios={studios}
          onSubmit={async (data) => {
            if (editingMedia) {
              await updateMutation.mutateAsync({ id: editingMedia.id, data });
            }
          }}
          onCancel={() => setEditingMedia(null)}
          isLoading={updateMutation.isPending}
        />
      </Modal>

      {/* ─── Delete Confirmation Modal ─── */}
      <ConfirmDialog
        isOpen={!!deletingMedia}
        onClose={() => setDeletingMedia(null)}
        onConfirm={async () => {
          if (deletingMedia) {
            await deleteMutation.mutateAsync(deletingMedia.id);
          }
        }}
        title={`Delete "${deletingMedia?.title}"?`}
        message="Are you sure you want to delete this media item from your watchlist? This action cannot be undone."
        confirmText="Delete Media"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default WatchlistPage;
