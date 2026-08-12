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
  media_genres?: Array<{ genre?: Genre; genre_id?: string }>;
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

// ─── Top 10 Types ──────────────────────────────────────

export interface Top10QueryParams {
  year?: number;
  type?: MediaType;
  genre?: string;
  studio?: string;
  sort?: 'score' | 'episodes' | 'watched_date';
}

export interface Top10Item {
  id: string;
  title: string;
  media_type: MediaType;
  release_date: string | null;
  episodes: number | null;
  score: number | null;
  watched_date: string | null;
  poster_url: string | null;
  studio: { id: string; name: string } | null;
  genres: { id: string; name: string }[];
}

// ─── History Types ─────────────────────────────────────

export interface HistoryQueryParams {
  year?: number;
  month?: number;
}

export interface HistoryMonthGroup {
  month: number;
  monthName: string;
  items: Top10Item[];
}

export interface HistoryYearGroup {
  year: number;
  months: HistoryMonthGroup[];
}

export interface HistoryData {
  history: HistoryYearGroup[];
  availableYears: number[];
  totalItems: number;
}

// ─── Timeline Types ────────────────────────────────────

export interface TimelineQueryParams {
  year?: number;
  month?: number;
}

export interface TimelineData {
  items: Top10Item[];
  availableYears: number[];
  totalItems: number;
}

// ─── Insights & Explorer Types ─────────────────────────

export interface InsightCardItem {
  id: number;
  label: string;
  value: string;
  detail: string;
  emoji: string;
}

export interface RatingOverTimeItem {
  period: string;
  averageScore: number;
}

export interface InsightsData {
  personality: {
    title: string;
    description: string;
  };
  insights: InsightCardItem[];
  ratingOverTime: RatingOverTimeItem[];
}

export interface ExplorerMediaItem {
  id: string;
  title: string;
  media_type: MediaType;
  release_date: string | null;
  episodes: number | null;
  score: number | null;
  poster_url: string | null;
}

export interface GenreExplorerItem {
  id: string;
  name: string;
  description: string | null;
  totalWatched: number;
  averageScore: number;
  topMedia: {
    id: string;
    title: string;
    poster_url: string | null;
    score: number | null;
  } | null;
  mediaList: ExplorerMediaItem[];
}

export interface StudioExplorerItem {
  id: string;
  name: string;
  description: string | null;
  website_url: string | null;
  totalWatched: number;
  averageScore: number;
  topTitle: {
    id: string;
    title: string;
    poster_url: string | null;
    score: number | null;
  } | null;
  mediaList: ExplorerMediaItem[];
}


