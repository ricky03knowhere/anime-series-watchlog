// ─── Media Types ───────────────────────────────────────

export type MediaType = 'anime' | 'tv_series';

export interface Media {
  id: string;
  title: string;
  media_type: MediaType;
  release_date: string | null;
  episodes: number | null;
  description: string | null;
  score: number | null;
  watched_date: string | null;
  poster_url: string | null;
  backdrop_url: string | null;
  studio_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  studio?: Studio;
  genres?: Genre[];
}

// ─── Genre Types ───────────────────────────────────────

export interface Genre {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Studio Types ──────────────────────────────────────

export interface Studio {
  id: string;
  name: string;
  description: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}

// ─── API Response Types ────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Query Parameter Types ─────────────────────────────

export interface MediaQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: MediaType;
  genre?: string;
  studio?: string;
  releaseYear?: number;
  minScore?: number;
  maxScore?: number;
  watchedFrom?: string;
  watchedTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Dashboard Types ───────────────────────────────────

export interface DashboardSummary {
  totalMedia: number;
  totalAnime: number;
  totalTvSeries: number;
  totalEpisodes: number;
  averageScore: number;
  highestScore: number;
  totalStudios: number;
  totalGenres: number;
}
