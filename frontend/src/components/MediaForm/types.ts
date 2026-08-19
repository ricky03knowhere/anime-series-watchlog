import { z } from 'zod';
import type { Media, Genre, Studio, MediaType } from '@/types';

// ─── AniList GraphQL Types ───────────────────────────────
export interface AniListMedia {
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
export interface OmdbSearchItem {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface OmdbDetailResponse {
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

export interface OmdbSeasonResponse {
  Title: string;
  Season: string;
  totalSeasons: string;
  Episodes: Array<{
    Title: string;
    Released: string;
    Episode: string;
    imdbRating: string;
    imdbID: string;
  }>;
  Response: string;
}

// ─── Unified search result type ──────────────────────────
export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  thumbnail: string | null;
  raw: AniListMedia | OmdbSearchItem;
  source: 'anilist' | 'omdb';
}

// ─── Schema ──────────────────────────────────────────────

export const mediaSchema = z.object({
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

export interface MediaFormProps {
  initialData?: Media | null;
  genres: Genre[];
  studios: Studio[];
  onSubmit: (data: MediaFormData & { poster_url?: string | null; backdrop_url?: string | null }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

// ─── AniList GraphQL query ───────────────────────────────
export const ANILIST_QUERY = `
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

// ─── OMDB API Key ────────────────────────────────────────
export const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY || '';
