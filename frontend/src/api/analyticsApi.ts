import api from './client';
import type { ApiResponse } from '@/types';

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
};
