import { supabase } from '../config/supabase';

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

export const analyticsRepository = {
  async getDashboardAnalytics(): Promise<DashboardAnalyticsData> {
    // 1. Fetch all media with studios & genres
    const { data: mediaList, error: mediaErr } = await supabase
      .from('media')
      .select(`
        *,
        studio:studios(id, name),
        media_genres(genre:genres(id, name))
      `);

    if (mediaErr) {
      throw new Error(`Failed to fetch media for analytics: ${mediaErr.message}`);
    }

    const allMedia = mediaList || [];
    const totalWatched = allMedia.length;

    let animeWatched = 0;
    let tvSeriesWatched = 0;
    let totalEpisodes = 0;
    let totalScoreSum = 0;
    let scoredCount = 0;
    let animeEpisodes = 0;
    let tvEpisodes = 0;

    const genreCounts: Record<string, number> = {};
    const genreScoreSums: Record<string, { sum: number; count: number }> = {};
    const studioCounts: Record<string, number> = {};
    const yearlyCounts: Record<string, number> = {};
    const monthlyCounts: Record<string, number> = {};
    const releaseYearCounts: Record<string, number> = {};
    const monthFrequency: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 };
    const scoreRanges: Record<string, number> = {
      '6.0 - 6.9': 0,
      '7.0 - 7.9': 0,
      '8.0 - 8.9': 0,
      '9.0 - 10': 0,
      '< 6.0': 0,
    };

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    allMedia.forEach((item) => {
      // Type count & episode count
      if (item.media_type === 'anime') {
        animeWatched++;
        const eps = item.episodes || 0;
        animeEpisodes += eps;
        totalEpisodes += eps;
      } else {
        tvSeriesWatched++;
        const eps = item.episodes || 0;
        tvEpisodes += eps;
        totalEpisodes += eps;
      }

      // Score
      if (item.score !== null && item.score !== undefined) {
        const s = Number(item.score);
        totalScoreSum += s;
        scoredCount++;

        if (s >= 9.0) scoreRanges['9.0 - 10']++;
        else if (s >= 8.0) scoreRanges['8.0 - 8.9']++;
        else if (s >= 7.0) scoreRanges['7.0 - 7.9']++;
        else if (s >= 6.0) scoreRanges['6.0 - 6.9']++;
        else scoreRanges['< 6.0']++;
      }

      // Studio
      if (item.studio?.name) {
        const sName = item.studio.name;
        studioCounts[sName] = (studioCounts[sName] || 0) + 1;
      }

      // Release Year
      if (item.release_date) {
        const rYear = new Date(item.release_date).getFullYear().toString();
        releaseYearCounts[rYear] = (releaseYearCounts[rYear] || 0) + 1;
      }

      // Watched Date (Yearly & Monthly distribution & Month frequency)
      if (item.watched_date) {
        const d = new Date(item.watched_date);
        const wYear = d.getFullYear().toString();
        const mIdx = d.getMonth();
        const mYear = `${monthNames[mIdx]} ${wYear}`;

        yearlyCounts[wYear] = (yearlyCounts[wYear] || 0) + 1;
        monthlyCounts[mYear] = (monthlyCounts[mYear] || 0) + 1;
        monthFrequency[mIdx] = (monthFrequency[mIdx] || 0) + 1;
      }

      // Genres
      const genres = item.media_genres ? item.media_genres.map((mg: any) => mg.genre).filter(Boolean) : [];
      genres.forEach((g: any) => {
        if (g?.name) {
          genreCounts[g.name] = (genreCounts[g.name] || 0) + 1;
          if (item.score !== null && item.score !== undefined) {
            if (!genreScoreSums[g.name]) genreScoreSums[g.name] = { sum: 0, count: 0 };
            genreScoreSums[g.name].sum += Number(item.score);
            genreScoreSums[g.name].count++;
          }
        }
      });
    });

    // Averages & Time Calculations
    const averageScore = scoredCount > 0 ? Number((totalScoreSum / scoredCount).toFixed(1)) : 0;
    // Default assumptions: 24 mins per anime episode, 45 mins per TV episode
    const totalMinutes = animeEpisodes * 24 + tvEpisodes * 45;
    const totalWatchTimeHours = Number((totalMinutes / 60).toFixed(1));
    const totalWatchTimeDays = Number((totalWatchTimeHours / 24).toFixed(1));

    // Favorite Genre (most watched)
    let favoriteGenre = 'None';
    let maxGenreCount = 0;
    Object.entries(genreCounts).forEach(([gName, count]) => {
      if (count > maxGenreCount) {
        maxGenreCount = count;
        favoriteGenre = gName;
      }
    });

    // Favorite Studio (most watched)
    let favoriteStudio = 'None';
    let maxStudioCount = 0;
    Object.entries(studioCounts).forEach(([sName, count]) => {
      if (count > maxStudioCount) {
        maxStudioCount = count;
        favoriteStudio = sName;
      }
    });

    // Prime Watching Month
    let primeMonthName = 'None';
    let maxMonthCount = 0;
    Object.entries(monthFrequency).forEach(([mIdx, count]) => {
      if (count > maxMonthCount) {
        maxMonthCount = count;
        primeMonthName = monthNames[Number(mIdx)];
      }
    });

    // Formatting Charts Data
    const watchedOverTimeYearly = Object.entries(yearlyCounts)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year));

    const watchedOverTimeMonthly = Object.entries(monthlyCounts)
      .map(([monthYear, count]) => ({ monthYear, count }))
      .slice(-12);

    const typeDistribution = [
      { name: 'Anime', value: animeWatched, color: '#a855f7' },
      { name: 'TV Series', value: tvSeriesWatched, color: '#06b6d4' },
    ];

    const genreDistribution = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const scoreDistribution = Object.entries(scoreRanges)
      .filter(([range]) => range !== '< 6.0' || scoreRanges['< 6.0'] > 0)
      .map(([range, count]) => ({ range, count }));

    const releaseYearDistribution = Object.entries(releaseYearCounts)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year));

    const watchedByMonth = monthNames.map((month, idx) => ({
      month,
      count: monthFrequency[idx] || 0,
    }));

    const topStudios = Object.entries(studioCounts)
      .map(([studio, count]) => ({ studio, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const averageScoreByGenre = Object.entries(genreScoreSums)
      .map(([genre, data]) => ({
        genre,
        averageScore: Number((data.sum / data.count).toFixed(1)),
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 10);

    // Watch Personality Generator
    const personalityTitle = maxGenreCount > 0 ? `THE ${favoriteGenre.toUpperCase()} EXPLORER` : 'THE WATCHER';
    const personalityDesc = maxGenreCount > 0
      ? `You watched ${maxGenreCount} ${favoriteGenre} titles, making it your most watched genre.`
      : 'Start watching more titles to discover your watch personality!';

    const ratingSnobText = averageScore >= 8.5
      ? `Your average rating is a high ${averageScore}/10 — You have strict taste!`
      : `Your average rating is ${averageScore}/10 — Balanced critic.`;

    const studioLoyaltyText = maxStudioCount > 0
      ? `You watched ${maxStudioCount} titles from ${favoriteStudio}, making it your favorite studio.`
      : 'No favorite studio yet.';

    const primeMonthText = maxMonthCount > 0
      ? `${primeMonthName} is your most active month with ${maxMonthCount} titles watched.`
      : 'No active watching month recorded yet.';

    return {
      stats: {
        totalWatched,
        animeWatched,
        tvSeriesWatched,
        totalEpisodes,
        averageScore,
        favoriteGenre,
        favoriteStudio,
        totalWatchTimeHours,
        totalWatchTimeDays,
      },
      personality: {
        title: personalityTitle,
        description: personalityDesc,
        ratingSnobText,
        studioLoyaltyText,
        primeMonthText,
      },
      charts: {
        watchedOverTimeYearly,
        watchedOverTimeMonthly,
        typeDistribution,
        genreDistribution,
        scoreDistribution,
        releaseYearDistribution,
        watchedByMonth,
        topStudios,
        averageScoreByGenre,
      },
    };
  },
};
