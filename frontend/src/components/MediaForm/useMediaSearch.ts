import { useState, useEffect, useRef, useCallback } from 'react';
import type { MediaType } from '@/types';
import type { SearchResult, AniListMedia, OmdbSearchItem } from './types';
import { ANILIST_QUERY, OMDB_API_KEY } from './types';

export function useMediaSearch(debounceMs = 500) {
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
      `https://www.omdbapi.com?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(keyword)}&type=series&page=${page}`,
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
