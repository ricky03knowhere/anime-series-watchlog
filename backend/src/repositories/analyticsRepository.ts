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

  // ────────────────────────────────────────────────────────
  // TOP 10 RANKING
  // ────────────────────────────────────────────────────────
  async getTop10(options: {
    year?: number;
    type?: 'anime' | 'tv_series';
    genre?: string;
    studio?: string;
    sort?: 'score' | 'episodes' | 'watched_date';
  }) {
    const { year, type, genre, studio, sort = 'score' } = options;

    // Fetch media with joins
    let query = supabase
      .from('media')
      .select(`
        *,
        studio:studios(id, name),
        media_genres(genre:genres(id, name))
      `);

    if (type) {
      query = query.eq('media_type', type);
    }

    if (studio) {
      query = query.eq('studio_id', studio);
    }

    if (year) {
      query = query.gte('release_date', `${year}-01-01`).lte('release_date', `${year}-12-31`);
    }

    // Sort order
    if (sort === 'episodes') {
      query = query.order('episodes', { ascending: false, nullsFirst: false });
    } else if (sort === 'watched_date') {
      query = query.order('watched_date', { ascending: false, nullsFirst: false });
    } else {
      query = query.order('score', { ascending: false, nullsFirst: false });
    }

    const { data, error } = await query.limit(50);

    if (error) {
      throw new Error(`Failed to fetch top 10: ${error.message}`);
    }

    let results = data || [];

    // Client-side genre filter (since Supabase can't filter on nested joins easily)
    if (genre) {
      results = results.filter((item: any) => {
        const genres = item.media_genres
          ? item.media_genres.map((mg: any) => mg.genre?.id).filter(Boolean)
          : [];
        return genres.includes(genre);
      });
    }

    // Return top 10 only
    return results.slice(0, 10).map((item: any) => ({
      id: item.id,
      title: item.title,
      media_type: item.media_type,
      release_date: item.release_date,
      episodes: item.episodes,
      score: item.score,
      watched_date: item.watched_date,
      poster_url: item.poster_url,
      studio: item.studio,
      genres: item.media_genres
        ? item.media_genres.map((mg: any) => mg.genre).filter(Boolean)
        : [],
    }));
  },

  // ────────────────────────────────────────────────────────
  // WATCH HISTORY (grouped by year/month)
  // ────────────────────────────────────────────────────────
  async getWatchHistory(options: { year?: number; month?: number }) {
    const { year, month } = options;

    let query = supabase
      .from('media')
      .select(`
        *,
        studio:studios(id, name),
        media_genres(genre:genres(id, name))
      `)
      .not('watched_date', 'is', null)
      .order('watched_date', { ascending: false });

    if (year) {
      query = query.gte('watched_date', `${year}-01-01`).lte('watched_date', `${year}-12-31`);
    }

    if (month && year) {
      const monthStr = String(month).padStart(2, '0');
      const lastDay = new Date(year, month, 0).getDate();
      query = query
        .gte('watched_date', `${year}-${monthStr}-01`)
        .lte('watched_date', `${year}-${monthStr}-${lastDay}`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch watch history: ${error.message}`);
    }

    const allMedia = data || [];

    // Group by year → month
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const grouped: Record<number, Record<number, any[]>> = {};

    allMedia.forEach((item: any) => {
      if (!item.watched_date) return;
      const d = new Date(item.watched_date);
      const y = d.getFullYear();
      const m = d.getMonth(); // 0-based

      if (!grouped[y]) grouped[y] = {};
      if (!grouped[y][m]) grouped[y][m] = [];

      grouped[y][m].push({
        id: item.id,
        title: item.title,
        media_type: item.media_type,
        release_date: item.release_date,
        episodes: item.episodes,
        score: item.score,
        watched_date: item.watched_date,
        poster_url: item.poster_url,
        studio: item.studio,
        genres: item.media_genres
          ? item.media_genres.map((mg: any) => mg.genre).filter(Boolean)
          : [],
      });
    });

    // Convert to structured array sorted descending by year then month
    const result = Object.entries(grouped)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([yearStr, months]) => ({
        year: Number(yearStr),
        months: Object.entries(months)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([monthIdx, items]) => ({
            month: Number(monthIdx),
            monthName: monthNames[Number(monthIdx)],
            items,
          })),
      }));

    // Also collect available years for filter
    const availableYears = [...new Set(allMedia.map((item: any) => {
      if (!item.watched_date) return null;
      return new Date(item.watched_date).getFullYear();
    }).filter(Boolean) as number[])].sort((a, b) => b - a);

    return { history: result, availableYears, totalItems: allMedia.length };
  },

  // ────────────────────────────────────────────────────────
  // TIMELINE (chronological list for visual timeline)
  // ────────────────────────────────────────────────────────
  async getTimeline(options: { year?: number; month?: number }) {
    const { year, month } = options;

    let query = supabase
      .from('media')
      .select(`
        *,
        studio:studios(id, name),
        media_genres(genre:genres(id, name))
      `)
      .not('watched_date', 'is', null)
      .order('watched_date', { ascending: true });

    if (year) {
      query = query.gte('watched_date', `${year}-01-01`).lte('watched_date', `${year}-12-31`);
    }

    if (month && year) {
      const monthStr = String(month).padStart(2, '0');
      const lastDay = new Date(year, month, 0).getDate();
      query = query
        .gte('watched_date', `${year}-${monthStr}-01`)
        .lte('watched_date', `${year}-${monthStr}-${lastDay}`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch timeline: ${error.message}`);
    }

    const allMedia = data || [];

    const items = allMedia.map((item: any) => ({
      id: item.id,
      title: item.title,
      media_type: item.media_type,
      release_date: item.release_date,
      episodes: item.episodes,
      score: item.score,
      watched_date: item.watched_date,
      poster_url: item.poster_url,
      studio: item.studio,
      genres: item.media_genres
        ? item.media_genres.map((mg: any) => mg.genre).filter(Boolean)
        : [],
    }));

    // Available years for zoom control
    const availableYears = [...new Set(
      allMedia
        .map((item: any) => item.watched_date ? new Date(item.watched_date).getFullYear() : null)
        .filter(Boolean) as number[]
    )].sort((a, b) => a - b);

    return { items, availableYears, totalItems: allMedia.length };
  },

  // ────────────────────────────────────────────────────────
  // DEEP INSIGHTS (Phase 9)
  // ────────────────────────────────────────────────────────
  async getInsights() {
    const { data: mediaList, error: mediaErr } = await supabase
      .from('media')
      .select(`
        *,
        studio:studios(id, name),
        media_genres(genre:genres(id, name))
      `);

    if (mediaErr) {
      throw new Error(`Failed to fetch media for insights: ${mediaErr.message}`);
    }

    const allMedia = mediaList || [];

    if (allMedia.length === 0) {
      return {
        personality: {
          title: 'THE NOVICE WATCHER',
          description: 'You haven\'t logged any media yet. Start building your watchlog!',
        },
        insights: [],
        ratingOverTime: [],
      };
    }

    // Dynamic stats computation
    const genreStats: Record<string, { count: number; totalScore: number; scoredCount: number }> = {};
    const studioStats: Record<string, { count: number; totalScore: number; scoredCount: number }> = {};
    const yearCounts: Record<string, number> = {};
    const monthCounts: Record<string, number> = {};
    const ratingByYearMonth: Record<string, { totalScore: number; count: number }> = {};

    let animeCount = 0;
    let tvCount = 0;
    let totalEpisodes = 0;
    let oldestReleaseItem: any = null;
    let newestReleaseItem: any = null;
    let longestSeriesItem: any = null;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    allMedia.forEach((item) => {
      if (item.media_type === 'anime') animeCount++;
      else tvCount++;

      const eps = item.episodes || 0;
      totalEpisodes += eps;

      if (!longestSeriesItem || eps > (longestSeriesItem.episodes || 0)) {
        longestSeriesItem = item;
      }

      if (item.release_date) {
        if (!oldestReleaseItem || new Date(item.release_date) < new Date(oldestReleaseItem.release_date)) {
          oldestReleaseItem = item;
        }
        if (!newestReleaseItem || new Date(item.release_date) > new Date(newestReleaseItem.release_date)) {
          newestReleaseItem = item;
        }
      }

      // Studio
      if (item.studio?.name) {
        const sName = item.studio.name;
        if (!studioStats[sName]) studioStats[sName] = { count: 0, totalScore: 0, scoredCount: 0 };
        studioStats[sName].count++;
        if (item.score != null) {
          studioStats[sName].totalScore += Number(item.score);
          studioStats[sName].scoredCount++;
        }
      }

      // Genres
      const genres = item.media_genres ? item.media_genres.map((mg: any) => mg.genre).filter(Boolean) : [];
      genres.forEach((g: any) => {
        if (g?.name) {
          if (!genreStats[g.name]) genreStats[g.name] = { count: 0, totalScore: 0, scoredCount: 0 };
          genreStats[g.name].count++;
          if (item.score != null) {
            genreStats[g.name].totalScore += Number(item.score);
            genreStats[g.name].scoredCount++;
          }
        }
      });

      // Watched Date stats
      if (item.watched_date) {
        const d = new Date(item.watched_date);
        const yStr = d.getFullYear().toString();
        const mName = monthNames[d.getMonth()];
        const keyYM = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

        yearCounts[yStr] = (yearCounts[yStr] || 0) + 1;
        monthCounts[mName] = (monthCounts[mName] || 0) + 1;

        if (item.score != null) {
          if (!ratingByYearMonth[keyYM]) ratingByYearMonth[keyYM] = { totalScore: 0, count: 0 };
          ratingByYearMonth[keyYM].totalScore += Number(item.score);
          ratingByYearMonth[keyYM].count++;
        }
      }
    });

    // 1. Most Watched Genre
    let mostWatchedGenre = { name: 'N/A', count: 0 };
    Object.entries(genreStats).forEach(([name, data]) => {
      if (data.count > mostWatchedGenre.count) mostWatchedGenre = { name, count: data.count };
    });

    // 2. Highest Rated Genre
    let highestRatedGenre = { name: 'N/A', avg: 0 };
    Object.entries(genreStats).forEach(([name, data]) => {
      if (data.scoredCount >= 1) {
        const avg = data.totalScore / data.scoredCount;
        if (avg > highestRatedGenre.avg) highestRatedGenre = { name, avg };
      }
    });

    // 3. Most Watched Studio
    let mostWatchedStudio = { name: 'N/A', count: 0 };
    Object.entries(studioStats).forEach(([name, data]) => {
      if (data.count > mostWatchedStudio.count) mostWatchedStudio = { name, count: data.count };
    });

    // 4. Highest Rated Studio
    let highestRatedStudio = { name: 'N/A', avg: 0 };
    Object.entries(studioStats).forEach(([name, data]) => {
      if (data.scoredCount >= 1) {
        const avg = data.totalScore / data.scoredCount;
        if (avg > highestRatedStudio.avg) highestRatedStudio = { name, avg };
      }
    });

    // 5. Most Productive Year
    let mostProductiveYear = { year: 'N/A', count: 0 };
    Object.entries(yearCounts).forEach(([year, count]) => {
      if (count > mostProductiveYear.count) mostProductiveYear = { year, count };
    });

    // 6. Rating Over Time
    const ratingOverTime = Object.entries(ratingByYearMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, data]) => ({
        period,
        averageScore: Number((data.totalScore / data.count).toFixed(1)),
      }));

    // 7. Anime vs TV Preference
    const animePct = Math.round((animeCount / allMedia.length) * 100);
    const tvPct = 100 - animePct;

    // 8. Average Episodes Per Media
    const avgEpisodes = Math.round(totalEpisodes / allMedia.length);

    // 9. Most Watched Month
    let mostWatchedMonth = { month: 'N/A', count: 0 };
    Object.entries(monthCounts).forEach(([month, count]) => {
      if (count > mostWatchedMonth.count) mostWatchedMonth = { month, count };
    });

    // Personality Archetype Determination
    let archetype = 'THE CULTIVATED WATCHER';
    let archetypeDesc = 'You have a balanced watch style across different formats and genres.';

    if (animePct >= 75) {
      archetype = 'OTAKU SUPREME';
      archetypeDesc = `With ${animePct}% anime titles watched, your soul belongs to the world of anime!`;
    } else if (tvPct >= 75) {
      archetype = 'SERIES BINGER';
      archetypeDesc = `With ${tvPct}% TV series watched, you live for episode cliffhangers and multi-season arcs!`;
    } else if (mostWatchedGenre.count >= 5) {
      archetype = `THE ${mostWatchedGenre.name.toUpperCase()} CONNOISSEUR`;
      archetypeDesc = `You've watched ${mostWatchedGenre.count} ${mostWatchedGenre.name} titles, proving your deep dedication to this genre.`;
    }

    return {
      personality: {
        title: archetype,
        description: archetypeDesc,
      },
      insights: [
        { id: 1, label: 'Most Watched Genre', value: mostWatchedGenre.name, detail: `${mostWatchedGenre.count} titles`, emoji: '🎭' },
        { id: 2, label: 'Highest Rated Genre', value: highestRatedGenre.name, detail: `Avg ${highestRatedGenre.avg.toFixed(1)} / 10`, emoji: '⭐' },
        { id: 3, label: 'Most Watched Studio', value: mostWatchedStudio.name, detail: `${mostWatchedStudio.count} titles`, emoji: '🏢' },
        { id: 4, label: 'Highest Rated Studio', value: highestRatedStudio.name, detail: `Avg ${highestRatedStudio.avg.toFixed(1)} / 10`, emoji: '🏆' },
        { id: 5, label: 'Most Productive Year', value: mostProductiveYear.year, detail: `${mostProductiveYear.count} titles watched`, emoji: '📅' },
        { id: 6, label: 'Format Preference', value: `${animePct}% Anime / ${tvPct}% TV`, detail: `${animeCount} Anime, ${tvCount} TV Shows`, emoji: '📊' },
        { id: 7, label: 'Avg Episodes Per Title', value: `${avgEpisodes} episodes`, detail: `${totalEpisodes.toLocaleString()} total episodes`, emoji: '📺' },
        { id: 8, label: 'Prime Watching Month', value: mostWatchedMonth.month, detail: `${mostWatchedMonth.count} titles completed`, emoji: '🍿' },
        { id: 9, label: 'Oldest Release Watched', value: oldestReleaseItem?.title || 'N/A', detail: oldestReleaseItem?.release_date || '', emoji: '📼' },
        { id: 10, label: 'Newest Release Watched', value: newestReleaseItem?.title || 'N/A', detail: newestReleaseItem?.release_date || '', emoji: '✨' },
        { id: 11, label: 'Longest Series Watched', value: longestSeriesItem?.title || 'N/A', detail: `${longestSeriesItem?.episodes || 0} episodes`, emoji: '📜' },
        { id: 12, label: 'Total Collection', value: `${allMedia.length} titles`, detail: 'Across all formats', emoji: '🎬' },
      ],
      ratingOverTime,
    };
  },

  // ────────────────────────────────────────────────────────
  // GENRE EXPLORER (Phase 9)
  // ────────────────────────────────────────────────────────
  async getGenreExplorerData() {
    const { data: genres, error: gErr } = await supabase.from('genres').select('*').order('name');
    if (gErr) throw new Error(`Failed to fetch genres: ${gErr.message}`);

    const { data: mediaList, error: mErr } = await supabase
      .from('media')
      .select(`
        *,
        studio:studios(id, name),
        media_genres(genre:genres(id, name))
      `);

    if (mErr) throw new Error(`Failed to fetch media list: ${mErr.message}`);

    const allMedia = mediaList || [];

    const explorerItems = (genres || []).map((genre) => {
      const matchingMedia = allMedia.filter((item: any) => {
        const itemGenres = item.media_genres ? item.media_genres.map((mg: any) => mg.genre?.id) : [];
        return itemGenres.includes(genre.id);
      });

      const totalWatched = matchingMedia.length;
      let scoreSum = 0;
      let scoredCount = 0;
      let topMedia: any = null;

      matchingMedia.forEach((item: any) => {
        if (item.score != null) {
          scoreSum += Number(item.score);
          scoredCount++;
          if (!topMedia || Number(item.score) > Number(topMedia.score || 0)) {
            topMedia = item;
          }
        }
      });

      return {
        id: genre.id,
        name: genre.name,
        description: genre.description,
        totalWatched,
        averageScore: scoredCount > 0 ? Number((scoreSum / scoredCount).toFixed(1)) : 0,
        topMedia: topMedia ? {
          id: topMedia.id,
          title: topMedia.title,
          poster_url: topMedia.poster_url,
          score: topMedia.score,
        } : null,
        mediaList: matchingMedia.map((m: any) => ({
          id: m.id,
          title: m.title,
          media_type: m.media_type,
          release_date: m.release_date,
          episodes: m.episodes,
          score: m.score,
          poster_url: m.poster_url,
        })),
      };
    });

    return explorerItems;
  },

  // ────────────────────────────────────────────────────────
  // STUDIO EXPLORER (Phase 9)
  // ────────────────────────────────────────────────────────
  async getStudioExplorerData() {
    const { data: studios, error: sErr } = await supabase.from('studios').select('*').order('name');
    if (sErr) throw new Error(`Failed to fetch studios: ${sErr.message}`);

    const { data: mediaList, error: mErr } = await supabase
      .from('media')
      .select(`
        *,
        studio:studios(id, name),
        media_genres(genre:genres(id, name))
      `);

    if (mErr) throw new Error(`Failed to fetch media list: ${mErr.message}`);

    const allMedia = mediaList || [];

    const explorerItems = (studios || []).map((studio) => {
      const matchingMedia = allMedia.filter((item: any) => item.studio_id === studio.id);

      const totalWatched = matchingMedia.length;
      let scoreSum = 0;
      let scoredCount = 0;
      let topMedia: any = null;

      matchingMedia.forEach((item: any) => {
        if (item.score != null) {
          scoreSum += Number(item.score);
          scoredCount++;
          if (!topMedia || Number(item.score) > Number(topMedia.score || 0)) {
            topMedia = item;
          }
        }
      });

      return {
        id: studio.id,
        name: studio.name,
        description: studio.description,
        website_url: studio.website_url,
        totalWatched,
        averageScore: scoredCount > 0 ? Number((scoreSum / scoredCount).toFixed(1)) : 0,
        topTitle: topMedia ? {
          id: topMedia.id,
          title: topMedia.title,
          poster_url: topMedia.poster_url,
          score: topMedia.score,
        } : null,
        mediaList: matchingMedia.map((m: any) => ({
          id: m.id,
          title: m.title,
          media_type: m.media_type,
          release_date: m.release_date,
          episodes: m.episodes,
          score: m.score,
          poster_url: m.poster_url,
        })),
      };
    });

    return explorerItems;
  },
};

