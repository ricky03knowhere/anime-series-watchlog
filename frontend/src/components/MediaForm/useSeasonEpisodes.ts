import { useState, useCallback } from 'react';
import type { OmdbSeasonResponse } from './types';
import { OMDB_API_KEY } from './types';

interface UseSeasonEpisodesReturn {
  totalSeasons: number;
  selectedSeason: number | null;
  episodeCount: number | null;
  isFetchingSeason: boolean;
  setTotalSeasons: (total: number) => void;
  selectSeason: (season: number, imdbID: string) => void;
  reset: () => void;
}

export function useSeasonEpisodes(): UseSeasonEpisodesReturn {
  const [totalSeasons, setTotalSeasons] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [episodeCount, setEpisodeCount] = useState<number | null>(null);
  const [isFetchingSeason, setIsFetchingSeason] = useState(false);

  const selectSeason = useCallback(async (season: number, imdbID: string) => {
    setSelectedSeason(season);
    setIsFetchingSeason(true);
    setEpisodeCount(null);

    try {
      const res = await fetch(
        `https://www.omdbapi.com?apikey=${OMDB_API_KEY}&i=${imdbID}&Season=${season}`
      );
      const data: OmdbSeasonResponse = await res.json();

      if (data.Response === 'False' || !data.Episodes) {
        setEpisodeCount(null);
      } else {
        setEpisodeCount(data.Episodes.length);
      }
    } catch (err) {
      console.error('Failed to fetch season episodes:', err);
      setEpisodeCount(null);
    } finally {
      setIsFetchingSeason(false);
    }
  }, []);

  const reset = useCallback(() => {
    setTotalSeasons(0);
    setSelectedSeason(null);
    setEpisodeCount(null);
    setIsFetchingSeason(false);
  }, []);

  return {
    totalSeasons,
    selectedSeason,
    episodeCount,
    isFetchingSeason,
    setTotalSeasons,
    selectSeason,
    reset,
  };
}
