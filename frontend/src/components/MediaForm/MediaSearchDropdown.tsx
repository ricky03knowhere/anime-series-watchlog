import { useRef, useEffect } from 'react';
import { Search, Loader2, ChevronDown, Image as ImageIcon } from 'lucide-react';
import type { MediaType } from '@/types';
import type { SearchResult } from './types';

interface MediaSearchDropdownProps {
  currentMediaType: MediaType;
  mediaSearch: {
    query: string;
    results: SearchResult[];
    isSearching: boolean;
    hasNextPage: boolean;
    totalResults: number;
    isOpen: boolean;
    debouncedSearch: (keyword: string, mode: MediaType) => void;
    loadMore: () => void;
    close: () => void;
    reset: () => void;
  };
  onSelect: (result: SearchResult) => void;
}

export function MediaSearchDropdown({ currentMediaType, mediaSearch, onSelect }: MediaSearchDropdownProps) {
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

  // Reset search when media type changes
  useEffect(() => {
    mediaSearch.reset();
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
  }, [currentMediaType]);

  const searchLabel = currentMediaType === 'anime'
    ? '🔍 Search Anime (Auto-fill from AniList)'
    : '🔍 Search TV Series (Auto-fill from OMDB)';

  const searchPlaceholder = currentMediaType === 'anime'
    ? 'Type anime name to search... e.g. Naruto, One Piece'
    : 'Type series name to search... e.g. Breaking Bad, The Office';

  return (
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
              onClick={() => onSelect(result)}
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
  );
}
