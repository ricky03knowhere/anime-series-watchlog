import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Search, Loader2, ChevronDown } from 'lucide-react';
import { uploadApi } from '@/api/uploadApi';
import { useToast } from '@/contexts/ToastContext';
import type { Media, Genre, Studio, MediaType } from '@/types';

// ─── AniList GraphQL Types ───────────────────────────────
interface AniListMedia {
  id: number;
  idMal: number | null;
  title: {
    romaji: string | null;
    english: string | null;
    native: string | null;
  };
  startDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  } | null;
  episodes: number | null;
  averageScore: number | null;
  description: string | null;
  genres: string[];
  coverImage: {
    large: string | null;
    extraLarge: string | null;
  } | null;
  studios: {
    nodes: Array<{ id: number; name: string }>;
  } | null;
}

// ─── OMDB API Types ──────────────────────────────────────
interface OmdbSearchItem {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

interface OmdbDetailResponse {
  Title: string;
  Year: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Plot: string;
  Poster: string;
  imdbRating: string;
  totalSeasons: string;
  Type: string;
  Response: string;
}

// ─── Unified search result type ──────────────────────────
interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  thumbnail: string | null;
  raw: AniListMedia | OmdbSearchItem;
  source: 'anilist' | 'omdb';
}

// ─── Schema ──────────────────────────────────────────────

const mediaSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  media_type: z.enum(['anime', 'tv_series']),
  release_date: z.string().optional(),
  episodes: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().int().min(0, 'Episodes must be >= 0').optional()
  ),
  score: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
    z.number().min(0, 'Score must be between 0 and 10').max(10, 'Score must be between 0 and 10').optional()
  ),
  watched_date: z.string().optional(),
  studio_id: z.string().optional(),
  description: z.string().optional(),
  genre_ids: z.array(z.string()).min(1, 'Select at least 1 genre'),
});

export type MediaFormData = {
  title: string;
  media_type: MediaType;
  release_date?: string;
  episodes?: number;
  score?: number;
  watched_date?: string;
  studio_id?: string;
  description?: string;
  genre_ids: string[];
};

interface MediaFormProps {
  initialData?: Media | null;
  genres: Genre[];
  studios: Studio[];
  onSubmit: (data: MediaFormData & { poster_url?: string | null; backdrop_url?: string | null }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

// ─── AniList GraphQL query ───────────────────────────────
const ANILIST_QUERY = `
query ($search: String, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
    }
    media(search: $search, type: ANIME) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      startDate {
        year
        month
        day
      }
      episodes
      averageScore
      description
      genres
      coverImage {
        large
        extraLarge
      }
      studios {
        nodes {
          id
          name
        }
      }
    }
  }
}
`;

// ─── Custom Hook: useMediaSearch ─────────────────────────

function useMediaSearch(debounceMs = 500) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<MediaType>('anime');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ─── AniList fetch ───────────────────────────────────
  const fetchAniList = useCallback(async (keyword: string, page: number, signal: AbortSignal): Promise<{
    results: SearchResult[];
    hasNext: boolean;
    total: number;
    currentPage: number;
  }> => {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        query: ANILIST_QUERY,
        variables: { search: keyword, page, perPage: 10 },
      }),
      signal,
    });
    if (!res.ok) throw new Error('AniList API error');
    const json = await res.json();
    const pageData = json.data.Page;

    const mapped: SearchResult[] = (pageData.media as AniListMedia[]).map((m) => ({
      id: `anilist-${m.id}`,
      title: m.title.english || m.title.romaji || m.title.native || 'Unknown',
      subtitle: [
        m.episodes ? `${m.episodes} eps` : null,
        m.startDate?.year,
        m.averageScore ? `★ ${(m.averageScore / 10).toFixed(1)}` : null,
      ].filter(Boolean).join(' · '),
      thumbnail: m.coverImage?.large || null,
      raw: m,
      source: 'anilist' as const,
    }));

    return {
      results: mapped,
      hasNext: pageData.pageInfo.hasNextPage,
      total: pageData.pageInfo.total,
      currentPage: pageData.pageInfo.currentPage,
    };
  }, []);

  // ─── OMDB fetch ──────────────────────────────────────
  const fetchOmdb = useCallback(async (keyword: string, page: number, signal: AbortSignal): Promise<{
    results: SearchResult[];
    hasNext: boolean;
    total: number;
    currentPage: number;
  }> => {
    const res = await fetch(
      `https://www.omdbapi.com?apikey=d65f434e&s=${encodeURIComponent(keyword)}&type=series&page=${page}`,
      { signal }
    );
    if (!res.ok) throw new Error('OMDB API error');
    const json = await res.json();

    if (json.Response === 'False') {
      return { results: [], hasNext: false, total: 0, currentPage: page };
    }

    const totalNum = parseInt(json.totalResults || '0', 10);
    const mapped: SearchResult[] = (json.Search as OmdbSearchItem[]).map((item) => ({
      id: `omdb-${item.imdbID}`,
      title: item.Title,
      subtitle: [item.Year, item.Type].filter(Boolean).join(' · '),
      thumbnail: item.Poster !== 'N/A' ? item.Poster : null,
      raw: item,
      source: 'omdb' as const,
    }));

    return {
      results: mapped,
      hasNext: page * 10 < totalNum,
      total: totalNum,
      currentPage: page,
    };
  }, []);

  // ─── Main fetch dispatcher ───────────────────────────
  const fetchResults = useCallback(async (keyword: string, page: number, mode: MediaType, append = false) => {
    if (!keyword.trim()) {
      setResults([]);
      setHasNextPage(false);
      setTotalResults(0);
      setIsOpen(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsSearching(true);

    try {
      const data = mode === 'anime'
        ? await fetchAniList(keyword, page, controller.signal)
        : await fetchOmdb(keyword, page, controller.signal);

      setResults((prev) => (append ? [...prev, ...data.results] : data.results));
      setHasNextPage(data.hasNext);
      setCurrentPage(data.currentPage);
      setTotalResults(data.total);
      setIsOpen(true);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Search error:', err);
      }
    } finally {
      setIsSearching(false);
    }
  }, [fetchAniList, fetchOmdb]);

  const debouncedSearch = useCallback(
    (keyword: string, mode: MediaType) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setQuery(keyword);
      setSearchMode(mode);
      if (!keyword.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }
      debounceRef.current = setTimeout(() => {
        fetchResults(keyword, 1, mode);
      }, debounceMs);
    },
    [fetchResults, debounceMs]
  );

  const loadMore = useCallback(() => {
    if (hasNextPage && !isSearching && query.trim()) {
      fetchResults(query, currentPage + 1, searchMode, true);
    }
  }, [fetchResults, query, currentPage, hasNextPage, isSearching, searchMode]);

  const close = useCallback(() => setIsOpen(false), []);

  const reset = useCallback(() => {
    setResults([]);
    setIsOpen(false);
    setQuery('');
    setTotalResults(0);
    setHasNextPage(false);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, []);

  return { query, results, isSearching, hasNextPage, totalResults, isOpen, searchMode, debouncedSearch, loadMore, close, reset };
}

// ─── Component ───────────────────────────────────────────

function MediaForm({ initialData, genres, studios, onSubmit, onCancel, isLoading = false }: MediaFormProps) {
  const { showToast } = useToast();

  const initialGenreIds = initialData?.media_genres
    ? initialData.media_genres.map((mg: any) => mg.genre_id || mg.genre?.id).filter(Boolean)
    : initialData?.genres
      ? initialData.genres.map((g) => g.id)
      : [];

  const [posterUrl, setPosterUrl] = useState<string | null>(initialData?.poster_url || null);
  const [backdropUrl, setBackdropUrl] = useState<string | null>(initialData?.backdrop_url || null);
  const [posterMode, setPosterMode] = useState<'file' | 'url'>('file');
  const [backdropMode, setBackdropMode] = useState<'file' | 'url'>('file');
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [isUploadingBackdrop, setIsUploadingBackdrop] = useState(false);

  // Unified media search
  const mediaSearch = useMediaSearch(500);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        mediaSearch.close();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mediaSearch.close]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MediaFormData>({
    resolver: zodResolver(mediaSchema) as any,
    defaultValues: {
      title: initialData?.title || '',
      media_type: (initialData?.media_type as MediaType) || 'anime',
      release_date: initialData?.release_date ? initialData.release_date.substring(0, 10) : '',
      episodes: initialData?.episodes ?? 12,
      score: initialData?.score ?? 8.0,
      watched_date: initialData?.watched_date ? initialData.watched_date.substring(0, 10) : '',
      studio_id: initialData?.studio_id || '',
      description: initialData?.description || '',
      genre_ids: initialGenreIds,
    },
  });

  const selectedGenreIds = watch('genre_ids') || [];
  const currentMediaType = watch('media_type');

  // Reset search when media type changes
  useEffect(() => {
    mediaSearch.reset();
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  }, [currentMediaType]);

  const handleGenreToggle = (genreId: string) => {
    const current = selectedGenreIds;
    if (current.includes(genreId)) {
      setValue(
        'genre_ids',
        current.filter((id) => id !== genreId),
        { shouldValidate: true }
      );
    } else {
      setValue('genre_ids', [...current, genreId], { shouldValidate: true });
    }
  };

  // ─── Auto-fill from AniList result ─────────────────────
  const handleAniListSelect = (anime: AniListMedia) => {
    // Title — prefer English, fallback to romaji
    setValue('title', anime.title.english || anime.title.romaji || anime.title.native || '', { shouldValidate: true });

    // Media type
    setValue('media_type', 'anime', { shouldValidate: true });

    // Release date
    if (anime.startDate?.year) {
      const y = anime.startDate.year;
      const m = String(anime.startDate.month || 1).padStart(2, '0');
      const d = String(anime.startDate.day || 1).padStart(2, '0');
      setValue('release_date', `${y}-${m}-${d}`, { shouldValidate: true });
    }

    // Episodes
    if (anime.episodes) {
      setValue('episodes', anime.episodes, { shouldValidate: true });
    }

    // Description — strip HTML tags from AniList description
    if (anime.description) {
      const cleanDesc = anime.description.replace(/<[^>]*>/g, '').replace(/\n{3,}/g, '\n\n');
      setValue('description', cleanDesc, { shouldValidate: true });
    }

    // Poster image
    const posterImg = anime.coverImage?.extraLarge || anime.coverImage?.large || null;
    if (posterImg) {
      setPosterUrl(posterImg);
      setPosterMode('url');
    }

    // Try to match studio
    if (anime.studios?.nodes?.length) {
      const anilistStudioName = anime.studios.nodes[0].name.toLowerCase();
      const matchedStudio = studios.find(
        (s) => s.name.toLowerCase() === anilistStudioName
      );
      if (matchedStudio) {
        setValue('studio_id', matchedStudio.id, { shouldValidate: true });
      }
    }

    // Try to match genres (AniList genres are plain strings)
    if (anime.genres?.length) {
      const matchedGenreIds = anime.genres
        .map((gName) => {
          const match = genres.find(
            (g) => g.name.toLowerCase() === gName.toLowerCase()
          );
          return match?.id;
        })
        .filter(Boolean) as string[];

      if (matchedGenreIds.length > 0) {
        setValue('genre_ids', matchedGenreIds, { shouldValidate: true });
      }
    }

    mediaSearch.close();
    const displayTitle = anime.title.english || anime.title.romaji || 'Anime';
    showToast(`"${displayTitle}" data loaded! Fill in your Score & Watched Date.`, 'success');
  };

  // ─── Auto-fill from OMDB result (needs detail fetch) ──
  const handleOmdbSelect = async (item: OmdbSearchItem) => {
    mediaSearch.close();
    showToast('Fetching series details...', 'info');

    try {
      const res = await fetch(`https://www.omdbapi.com?apikey=d65f434e&i=${item.imdbID}&plot=full`);
      const detail: OmdbDetailResponse = await res.json();

      if (detail.Response === 'False') {
        showToast('Could not fetch series details', 'error');
        return;
      }

      // Title
      setValue('title', detail.Title, { shouldValidate: true });

      // Media type
      setValue('media_type', 'tv_series', { shouldValidate: true });

      // Release date
      if (detail.Released && detail.Released !== 'N/A') {
        const date = new Date(detail.Released);
        if (!isNaN(date.getTime())) {
          setValue('release_date', date.toISOString().substring(0, 10), { shouldValidate: true });
        }
      }

      // Episodes — use totalSeasons as a rough proxy (OMDB doesn't give total episodes in search)
      if (detail.totalSeasons && detail.totalSeasons !== 'N/A') {
        setValue('episodes', parseInt(detail.totalSeasons, 10), { shouldValidate: true });
      }

      // Description
      if (detail.Plot && detail.Plot !== 'N/A') {
        setValue('description', detail.Plot, { shouldValidate: true });
      }

      // Poster image
      if (detail.Poster && detail.Poster !== 'N/A') {
        setPosterUrl(detail.Poster);
        setPosterMode('url');
      }

      // Try to match genres
      if (detail.Genre && detail.Genre !== 'N/A') {
        const genreNames = detail.Genre.split(',').map((g) => g.trim().toLowerCase());
        const matchedGenreIds = genreNames
          .map((gName) => {
            const match = genres.find((g) => g.name.toLowerCase() === gName);
            return match?.id;
          })
          .filter(Boolean) as string[];

        if (matchedGenreIds.length > 0) {
          setValue('genre_ids', matchedGenreIds, { shouldValidate: true });
        }
      }

      showToast(`"${detail.Title}" data loaded! Fill in your Score & Watched Date.`, 'success');
    } catch (err: any) {
      showToast('Failed to fetch series details', 'error');
      console.error('OMDB detail error:', err);
    }
  };

  // ─── Unified select handler ────────────────────────────
  const handleSearchResultSelect = (result: SearchResult) => {
    if (result.source === 'anilist') {
      handleAniListSelect(result.raw as AniListMedia);
    } else {
      handleOmdbSelect(result.raw as OmdbSearchItem);
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    bucket: 'media-posters' | 'media-backdrops'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      showToast('Maximum image size is 1MB', 'error');
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      showToast('Only JPG, PNG, and WEBP images are allowed', 'error');
      return;
    }

    if (bucket === 'media-posters') setIsUploadingPoster(true);
    else setIsUploadingBackdrop(true);

    try {
      const res = await uploadApi.uploadImage(file, bucket);
      if (res.data?.url) {
        if (bucket === 'media-posters') setPosterUrl(res.data.url);
        else setBackdropUrl(res.data.url);
        showToast('Image uploaded successfully', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Image upload failed', 'error');
    } finally {
      if (bucket === 'media-posters') setIsUploadingPoster(false);
      else setIsUploadingBackdrop(false);
    }
  };

  const onFormSubmit: SubmitHandler<MediaFormData> = async (data) => {
    await onSubmit({
      ...data,
      poster_url: posterUrl,
      backdrop_url: backdropUrl,
    });
  };

  const searchLabel = currentMediaType === 'anime'
    ? '🔍 Search Anime (Auto-fill from AniList)'
    : '🔍 Search TV Series (Auto-fill from OMDB)';

  const searchPlaceholder = currentMediaType === 'anime'
    ? 'Type anime name to search... e.g. Naruto, One Piece'
    : 'Type series name to search... e.g. Breaking Bad, The Office';

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* ─── Type Selector (moved above search) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          {/* Search will go here, but we need Type first */}
        </div>
        <div>
          <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Type <span className="text-red-500">*</span>
          </label>
          <select
            {...register('media_type')}
            className="w-full h-10 px-3 text-sm rounded-xl border outline-none cursor-pointer"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="anime">Anime</option>
            <option value="tv_series">TV Series</option>
          </select>
        </div>
      </div>

      {/* ─── Media Search (AniList / OMDB) ─── */}
      <div ref={searchContainerRef} className="relative">
        <label className="text-xs font-bold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
          {searchLabel}
        </label>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => mediaSearch.debouncedSearch(e.target.value, currentMediaType)}
            className="w-full h-11 pl-9 pr-10 text-sm rounded-xl border outline-none transition-all"
            style={{
              background: 'var(--bg)',
              borderColor: mediaSearch.isOpen ? 'var(--color-primary-500)' : 'var(--border)',
              color: 'var(--text-primary)',
              boxShadow: mediaSearch.isOpen ? '0 0 0 3px rgba(var(--color-primary-rgb, 99,102,241), 0.15)' : 'none',
            }}
          />
          {mediaSearch.isSearching && (
            <Loader2
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin"
              style={{ color: 'var(--color-primary-500)' }}
            />
          )}
        </div>

        {/* Search Results Dropdown */}
        {mediaSearch.isOpen && mediaSearch.results.length > 0 && (
          <div
            className="absolute z-50 left-0 right-0 mt-1.5 rounded-xl border overflow-hidden"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
              maxHeight: '320px',
              overflowY: 'auto',
            }}
          >
            {/* Results count header */}
            <div
              className="px-3 py-2 text-[11px] font-semibold border-b sticky top-0"
              style={{
                color: 'var(--text-muted)',
                borderColor: 'var(--border)',
                background: 'var(--bg-card)',
              }}
            >
              {mediaSearch.totalResults} results found — click to auto-fill
            </div>

            {mediaSearch.results.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => handleSearchResultSelect(result)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer"
                style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover, rgba(99,102,241,0.08))';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-9 h-12 rounded-md overflow-hidden" style={{ background: 'var(--bg)' }}>
                  {result.thumbnail ? (
                    <img
                      src={result.thumbnail}
                      alt={result.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {result.title}
                  </p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                    {result.subtitle}
                  </p>
                </div>
              </button>
            ))}

            {/* Load More Button */}
            {mediaSearch.hasNextPage && (
              <button
                type="button"
                onClick={mediaSearch.loadMore}
                disabled={mediaSearch.isSearching}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                style={{ color: 'var(--color-primary-500)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover, rgba(99,102,241,0.08))';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                {mediaSearch.isSearching ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    Load More Results
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* No results state */}
        {mediaSearch.isOpen && !mediaSearch.isSearching && mediaSearch.results.length === 0 && (
          <div
            className="absolute z-50 left-0 right-0 mt-1.5 rounded-xl border px-4 py-6 text-center"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
            }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              No {currentMediaType === 'anime' ? 'anime' : 'series'} found
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Try a different search keyword
            </p>
          </div>
        )}
      </div>

      {/* ─── Poster & Backdrop Options Row ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Poster Image (Upload or URL link) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold block" style={{ color: 'var(--text-muted)' }}>
              Poster Image
            </label>
            {/* Mode Selector */}
            <div className="flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setPosterMode('file')}
                className="px-2 py-0.5 rounded font-medium transition-colors cursor-pointer"
                style={{
                  background: posterMode === 'file' ? 'var(--color-primary-600)' : 'transparent',
                  color: posterMode === 'file' ? 'white' : 'var(--text-muted)',
                }}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setPosterMode('url')}
                className="px-2 py-0.5 rounded font-medium transition-colors cursor-pointer"
                style={{
                  background: posterMode === 'url' ? 'var(--color-primary-600)' : 'transparent',
                  color: posterMode === 'url' ? 'white' : 'var(--text-muted)',
                }}
              >
                Image URL
              </button>
            </div>
          </div>

          {posterUrl ? (
            <div className="relative aspect-[2/3] max-h-[180px] rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <img src={posterUrl} alt="Poster preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setPosterUrl(null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white cursor-pointer hover:bg-black"
                title="Remove Image"
              >
                <X size={14} />
              </button>
            </div>
          ) : posterMode === 'url' ? (
            <div className="space-y-2">
              <div className="relative">
                <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="url"
                  placeholder="https://example.com/poster.jpg"
                  value={posterUrl || ''}
                  onChange={(e) => setPosterUrl(e.target.value || null)}
                  className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border outline-none"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Paste a direct image URL link (e.g. from MyAnimeList or Unsplash)
              </p>
            </div>
          ) : (
            <div
              className="relative aspect-[2/3] max-h-[180px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center overflow-hidden transition-colors"
              style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
            >
              <label className="cursor-pointer flex flex-col items-center gap-1.5 w-full h-full justify-center">
                <ImageIcon size={24} style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  {isUploadingPoster ? 'Uploading...' : 'Upload Poster File'}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  JPG, PNG, WEBP &lt; 1MB
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, 'media-posters')}
                  disabled={isUploadingPoster}
                />
              </label>
            </div>
          )}
        </div>

        {/* Backdrop Image (Upload or URL link) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold block" style={{ color: 'var(--text-muted)' }}>
              Backdrop Image (Optional)
            </label>
            {/* Mode Selector */}
            <div className="flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setBackdropMode('file')}
                className="px-2 py-0.5 rounded font-medium transition-colors cursor-pointer"
                style={{
                  background: backdropMode === 'file' ? 'var(--color-primary-600)' : 'transparent',
                  color: backdropMode === 'file' ? 'white' : 'var(--text-muted)',
                }}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setBackdropMode('url')}
                className="px-2 py-0.5 rounded font-medium transition-colors cursor-pointer"
                style={{
                  background: backdropMode === 'url' ? 'var(--color-primary-600)' : 'transparent',
                  color: backdropMode === 'url' ? 'white' : 'var(--text-muted)',
                }}
              >
                Image URL
              </button>
            </div>
          </div>

          {backdropUrl ? (
            <div className="relative aspect-video max-h-[180px] rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <img src={backdropUrl} alt="Backdrop preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setBackdropUrl(null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white cursor-pointer hover:bg-black"
                title="Remove Image"
              >
                <X size={14} />
              </button>
            </div>
          ) : backdropMode === 'url' ? (
            <div className="space-y-2">
              <div className="relative">
                <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="url"
                  placeholder="https://example.com/backdrop.jpg"
                  value={backdropUrl || ''}
                  onChange={(e) => setBackdropUrl(e.target.value || null)}
                  className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border outline-none"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Paste a direct hero backdrop image URL link
              </p>
            </div>
          ) : (
            <div
              className="relative aspect-video max-h-[180px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center overflow-hidden transition-colors"
              style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
            >
              <label className="cursor-pointer flex flex-col items-center gap-1.5 w-full h-full justify-center">
                <Upload size={24} style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  {isUploadingBackdrop ? 'Uploading...' : 'Upload Backdrop File'}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Hero backdrop image
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, 'media-backdrops')}
                  disabled={isUploadingBackdrop}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* ─── Title ─── */}
      <div>
        <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--text-muted)' }}>
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('title')}
          placeholder="e.g. Shingeki no Kyojin"
          className="w-full h-10 px-3 text-sm rounded-xl border outline-none transition-colors"
          style={{ background: 'var(--bg)', borderColor: errors.title ? '#fca5a5' : 'var(--border)', color: 'var(--text-primary)' }}
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      {/* ─── Release Date, Episodes, Score, Watched Date ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Release Date
          </label>
          <input
            type="date"
            {...register('release_date')}
            className="w-full h-10 px-3 text-xs rounded-xl border outline-none"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </div>

        <div>
          <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Episodes
          </label>
          <input
            type="number"
            {...register('episodes')}
            placeholder="12"
            className="w-full h-10 px-3 text-sm rounded-xl border outline-none"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
          {errors.episodes && <p className="text-xs text-red-500 mt-1">{errors.episodes.message}</p>}
        </div>

        <div>
          <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Score (0 - 10)
          </label>
          <input
            type="number"
            step="0.1"
            {...register('score')}
            placeholder="8.5"
            className="w-full h-10 px-3 text-sm rounded-xl border outline-none"
            style={{ background: 'var(--bg)', borderColor: errors.score ? '#fca5a5' : 'var(--border)', color: 'var(--text-primary)' }}
          />
          {errors.score && <p className="text-xs text-red-500 mt-1">{errors.score.message}</p>}
        </div>

        <div>
          <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Watched Date
          </label>
          <input
            type="date"
            {...register('watched_date')}
            className="w-full h-10 px-3 text-xs rounded-xl border outline-none"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* ─── Studio ─── */}
      <div>
        <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--text-muted)' }}>
          Studio
        </label>
        <select
          {...register('studio_id')}
          className="w-full h-10 px-3 text-sm rounded-xl border outline-none cursor-pointer"
          style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          <option value="">Select Studio (Optional)</option>
          {studios.map((studio) => (
            <option key={studio.id} value={studio.id}>
              {studio.name}
            </option>
          ))}
        </select>
      </div>

      {/* ─── Genres Selection (Multi-select) ─── */}
      <div>
        <label className="text-xs font-bold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
          Genres <span className="text-red-500">* (Select at least 1)</span>
        </label>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 rounded-xl border" style={{ background: 'var(--bg)', borderColor: errors.genre_ids ? '#fca5a5' : 'var(--border)' }}>
          {genres.map((genre) => {
            const isSelected = selectedGenreIds.includes(genre.id);
            return (
              <button
                key={genre.id}
                type="button"
                onClick={() => handleGenreToggle(genre.id)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer select-none"
                style={{
                  background: isSelected ? 'var(--color-primary-600)' : 'var(--bg-card)',
                  borderColor: isSelected ? 'var(--color-primary-500)' : 'var(--border)',
                  color: isSelected ? 'white' : 'var(--text-secondary)',
                }}
              >
                {genre.name}
              </button>
            );
          })}
        </div>
        {errors.genre_ids && <p className="text-xs text-red-500 mt-1">{errors.genre_ids.message}</p>}
      </div>

      {/* ─── Description / Review ─── */}
      <div>
        <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--text-muted)' }}>
          Description / Review
        </label>
        <textarea
          rows={3}
          {...register('description')}
          placeholder="Brief description or personal review thoughts..."
          className="w-full p-3 text-sm rounded-xl border outline-none resize-none"
          style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        />
      </div>

      {/* ─── Action Buttons ─── */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-semibold rounded-xl border cursor-pointer disabled:opacity-50"
          style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2 text-sm font-semibold rounded-xl text-white transition-all cursor-pointer disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700))',
            boxShadow: 'var(--shadow-glow-primary)',
          }}
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Media' : 'Add Media'}
        </button>
      </div>
    </form>
  );
}

export default MediaForm;

