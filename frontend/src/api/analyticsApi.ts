import api from './client';
import type {
  ApiResponse,
  Top10QueryParams,
  Top10Item,
  HistoryQueryParams,
  HistoryData,
  TimelineQueryParams,
  TimelineData,
  InsightsData,
  GenreExplorerItem,
  StudioExplorerItem,
} from '@/types';

export interface DashboardAnalyticsData {
  stats: {
    totalWatched: number;
    animeWatched: number;
    tvSeriesWatched: number;
    totalEpisodes: number;
    averageScore: number;
    favoriteGenre: string;
    favoriteStudio: string;
    totalWatchTimeHours: number;
    totalWatchTimeDays: number;
  };
  personality: {
    title: string;
    description: string;
    ratingSnobText: string;
    studioLoyaltyText: string;
    primeMonthText: string;
  };
  charts: {
    watchedOverTimeYearly: Array<{ year: string; count: number }>;
    watchedOverTimeMonthly: Array<{ monthYear: string; count: number }>;
    typeDistribution: Array<{ name: string; value: number; color: string }>;
    genreDistribution: Array<{ genre: string; count: number }>;
    scoreDistribution: Array<{ range: string; count: number }>;
    releaseYearDistribution: Array<{ year: string; count: number }>;
    watchedByMonth: Array<{ month: string; count: number }>;
    topStudios: Array<{ studio: string; count: number }>;
    averageScoreByGenre: Array<{ genre: string; averageScore: number }>;
  };
}

export const analyticsApi = {
  async getDashboardAnalytics(): Promise<ApiResponse<DashboardAnalyticsData>> {
    const { data } = await api.get('/analytics/dashboard');
    return data;
  },

  async getTop10(params?: Top10QueryParams): Promise<ApiResponse<Top10Item[]>> {
    const { data } = await api.get('/analytics/top10', { params });
    return data;
  },

  async getHistory(params?: HistoryQueryParams): Promise<ApiResponse<HistoryData>> {
    const { data } = await api.get('/analytics/history', { params });
    return data;
  },

  async getTimeline(params?: TimelineQueryParams): Promise<ApiResponse<TimelineData>> {
    const { data } = await api.get('/analytics/timeline', { params });
    return data;
  },

  async getInsights(): Promise<ApiResponse<InsightsData>> {
    const { data } = await api.get('/analytics/insights');
    return data;
  },

  async getGenreExplorer(): Promise<ApiResponse<GenreExplorerItem[]>> {
    const { data } = await api.get('/analytics/genre-explorer');
    return data;
  },

  async getStudioExplorer(): Promise<ApiResponse<StudioExplorerItem[]>> {
    const { data } = await api.get('/analytics/studio-explorer');
    return data;
  },
};

