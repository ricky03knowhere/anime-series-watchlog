import { useState, useEffect, useCallback } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/contexts/ToastContext';
import type { MediaType } from '@/types';

import {
  mediaSchema,
  OMDB_API_KEY,
  type MediaFormData,
  type MediaFormProps,
  type AniListMedia,
  type OmdbSearchItem,
  type OmdbDetailResponse,
  type SearchResult,
} from './types';
import { useMediaSearch } from './useMediaSearch';
import { useSeasonEpisodes } from './useSeasonEpisodes';
import { MediaSearchDropdown } from './MediaSearchDropdown';
import { ImageUploader } from './ImageUploader';
import { SeasonPicker } from './SeasonPicker';
import { GenreSelector } from './GenreSelector';
import { FormActions } from './FormActions';

export type { MediaFormData } from './types';

// ─── Component ───────────────────────────────────────────

function MediaForm({ initialData, genres, studios, onSubmit, onCancel, isLoading = false }: MediaFormProps) {
  const { showToast } = useToast();

  const initialGenreIds = initialData?.media_genres
    ? initialData.media_genres.map((mg: any) => mg.genre_id || mg.genre?.id).filter(Boolean)
    : initialData?.genres
      ? initialData.genres.map((g) => g.id)
      : [];

  const [posterUrl, setPosterUrl] = useState<string | null>(initialData?.poster_url || null);
  const [backdropUrl, setBackdropUrl] = useState<string | null>(initialData?.backdrop_url || null);

  // OMDB imdbID state — stored when an OMDB series is selected
  const [omdbImdbID, setOmdbImdbID] = useState<string | null>(null);

  // Unified media search
  const mediaSearch = useMediaSearch(500);

  // Season / episode picker for TV Series
  const seasonEpisodes = useSeasonEpisodes();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MediaFormData>({
    resolver: zodResolver(mediaSchema) as any,
    defaultValues: {
      title: initialData?.title || '',
      media_type: (initialData?.media_type as MediaType) || 'anime',
      release_date: initialData?.release_date ? initialData.release_date.substring(0, 10) : '',
      episodes: initialData?.episodes ?? 12,
      score: initialData?.score ?? 8.0,
      watched_date: initialData?.watched_date ? initialData.watched_date.substring(0, 10) : '',
      studio_id: initialData?.studio_id || '',
      description: initialData?.description || '',
      genre_ids: initialGenreIds,
    },
  });

  const selectedGenreIds = watch('genre_ids') || [];
  const currentMediaType = watch('media_type');

  // When season episode count changes, auto-fill episodes
  useEffect(() => {
    if (seasonEpisodes.episodeCount !== null) {
      setValue('episodes', seasonEpisodes.episodeCount, { shouldValidate: true });
    }
  }, [seasonEpisodes.episodeCount, setValue]);

  // Reset season picker when media type changes
  useEffect(() => {
    seasonEpisodes.reset();
    setOmdbImdbID(null);
  }, [currentMediaType]);

  const handleGenreToggle = useCallback((genreId: string) => {
    const current = selectedGenreIds;
    if (current.includes(genreId)) {
      setValue(
        'genre_ids',
        current.filter((id) => id !== genreId),
        { shouldValidate: true }
      );
    } else {
      setValue('genre_ids', [...current, genreId], { shouldValidate: true });
    }
  }, [selectedGenreIds, setValue]);

  // ─── Auto-fill from AniList result ─────────────────────
  const handleAniListSelect = useCallback((anime: AniListMedia) => {
    // Title — prefer English, fallback to romaji
    setValue('title', anime.title.english || anime.title.romaji || anime.title.native || '', { shouldValidate: true });

    // Media type
    setValue('media_type', 'anime', { shouldValidate: true });

    // Release date
    if (anime.startDate?.year) {
      const y = anime.startDate.year;
      const m = String(anime.startDate.month || 1).padStart(2, '0');
      const d = String(anime.startDate.day || 1).padStart(2, '0');
      setValue('release_date', `${y}-${m}-${d}`, { shouldValidate: true });
    }

    // Episodes
    if (anime.episodes) {
      setValue('episodes', anime.episodes, { shouldValidate: true });
    }

    // Description — strip HTML tags from AniList description
    if (anime.description) {
      const cleanDesc = anime.description.replace(/<[^>]*>/g, '').replace(/\\n{3,}/g, '\\n\\n');
      setValue('description', cleanDesc, { shouldValidate: true });
    }

    // Poster image
    const posterImg = anime.coverImage?.extraLarge || anime.coverImage?.large || null;
    if (posterImg) {
      setPosterUrl(posterImg);
    }

    // Try to match studio
    if (anime.studios?.nodes?.length) {
      const anilistStudioName = anime.studios.nodes[0].name.toLowerCase();
      const matchedStudio = studios.find(
        (s) => s.name.toLowerCase() === anilistStudioName
      );
      if (matchedStudio) {
        setValue('studio_id', matchedStudio.id, { shouldValidate: true });
      }
    }

    // Try to match genres (AniList genres are plain strings)
    if (anime.genres?.length) {
      const matchedGenreIds = anime.genres
        .map((gName) => {
          const match = genres.find(
            (g) => g.name.toLowerCase() === gName.toLowerCase()
          );
          return match?.id;
        })
        .filter(Boolean) as string[];

      if (matchedGenreIds.length > 0) {
        setValue('genre_ids', matchedGenreIds, { shouldValidate: true });
      }
    }

    // Reset season state for anime
    seasonEpisodes.reset();
    setOmdbImdbID(null);

    mediaSearch.close();
    const displayTitle = anime.title.english || anime.title.romaji || 'Anime';
    showToast(`"${displayTitle}" data loaded! Fill in your Score & Watched Date.`, 'success');
  }, [setValue, studios, genres, mediaSearch, seasonEpisodes, showToast]);

  // ─── Auto-fill from OMDB result (needs detail fetch) ──
  const handleOmdbSelect = useCallback(async (item: OmdbSearchItem) => {
    mediaSearch.close();
    showToast('Fetching series details...', 'info');

    try {
      const res = await fetch(`https://www.omdbapi.com?apikey=${OMDB_API_KEY}&i=${item.imdbID}&plot=full`);
      const detail: OmdbDetailResponse = await res.json();

      if (detail.Response === 'False') {
        showToast('Could not fetch series details', 'error');
        return;
      }

      // Title
      setValue('title', detail.Title, { shouldValidate: true });

      // Media type
      setValue('media_type', 'tv_series', { shouldValidate: true });

      // Release date
      if (detail.Released && detail.Released !== 'N/A') {
        const date = new Date(detail.Released);
        if (!isNaN(date.getTime())) {
          setValue('release_date', date.toISOString().substring(0, 10), { shouldValidate: true });
        }
      }

      // Store imdbID and totalSeasons for season picker
      setOmdbImdbID(item.imdbID);
      const totalSeasonsNum = detail.totalSeasons && detail.totalSeasons !== 'N/A'
        ? parseInt(detail.totalSeasons, 10)
        : 0;
      seasonEpisodes.setTotalSeasons(totalSeasonsNum);

      // Don't auto-fill episodes anymore — let season picker handle it
      // Clear episodes so user picks a season first
      setValue('episodes', undefined, { shouldValidate: true });

      // Description
      if (detail.Plot && detail.Plot !== 'N/A') {
        setValue('description', detail.Plot, { shouldValidate: true });
      }

      // Poster image
      if (detail.Poster && detail.Poster !== 'N/A') {
        setPosterUrl(detail.Poster);
      }

      // Try to match genres
      if (detail.Genre && detail.Genre !== 'N/A') {
        const genreNames = detail.Genre.split(',').map((g) => g.trim().toLowerCase());
        const matchedGenreIds = genreNames
          .map((gName) => {
            const match = genres.find((g) => g.name.toLowerCase() === gName);
            return match?.id;
          })
          .filter(Boolean) as string[];

        if (matchedGenreIds.length > 0) {
          setValue('genre_ids', matchedGenreIds, { shouldValidate: true });
        }
      }

      showToast(`"${detail.Title}" data loaded! Select a Season to get episode count.`, 'success');
    } catch (err: any) {
      showToast('Failed to fetch series details', 'error');
      console.error('OMDB detail error:', err);
    }
  }, [setValue, genres, mediaSearch, seasonEpisodes, showToast]);

  // ─── Unified select handler ────────────────────────────
  const handleSearchResultSelect = useCallback((result: SearchResult) => {
    if (result.source === 'anilist') {
      handleAniListSelect(result.raw as AniListMedia);
    } else {
      handleOmdbSelect(result.raw as OmdbSearchItem);
    }
  }, [handleAniListSelect, handleOmdbSelect]);

  const onFormSubmit: SubmitHandler<MediaFormData> = async (data) => {
    await onSubmit({
      ...data,
      poster_url: posterUrl,
      backdrop_url: backdropUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* ─── Type Selector (full row) ─── */}
      <div>
        <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--text-muted)' }}>
          Type <span className="text-red-500">*</span>
        </label>
        <select
          {...register('media_type')}
          className="w-full h-10 px-3 text-sm rounded-xl border outline-none cursor-pointer"
          style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          <option value="anime">Anime</option>
          <option value="tv_series">TV Series</option>
        </select>
      </div>

      {/* ─── Media Search (AniList / OMDB) ─── */}
      <MediaSearchDropdown
        currentMediaType={currentMediaType}
        mediaSearch={mediaSearch}
        onSelect={handleSearchResultSelect}
      />

      {/* ─── Poster & Backdrop Options Row ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ImageUploader
          label="Poster Image"
          imageUrl={posterUrl}
          onImageChange={setPosterUrl}
          bucket="media-posters"
          aspectClass="aspect-[2/3]"
        />
        <ImageUploader
          label="Backdrop Image"
          imageUrl={backdropUrl}
          onImageChange={setBackdropUrl}
          bucket="media-backdrops"
          aspectClass="aspect-video"
          optional
        />
      </div>

      {/* ─── Title ─── */}
      <div>
        <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--text-muted)' }}>
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('title')}
          placeholder="e.g. Shingeki no Kyojin"
          className="w-full h-10 px-3 text-sm rounded-xl border outline-none transition-colors"
          style={{ background: 'var(--bg)', borderColor: errors.title ? '#fca5a5' : 'var(--border)', color: 'var(--text-primary)' }}
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      {/* ─── Season Picker (TV Series only) ─── */}
      {currentMediaType === 'tv_series' && seasonEpisodes.totalSeasons > 0 && (
        <SeasonPicker
          totalSeasons={seasonEpisodes.totalSeasons}
          selectedSeason={seasonEpisodes.selectedSeason}
          episodeCount={seasonEpisodes.episodeCount}
          isFetchingSeason={seasonEpisodes.isFetchingSeason}
          imdbID={omdbImdbID}
          onSeasonSelect={seasonEpisodes.selectSeason}
        />
      )}

      {/* ─── Release Date, Episodes, Score, Watched Date ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Release Date
          </label>
          <input
            type="date"
            {...register('release_date')}
            className="w-full h-10 px-3 text-xs rounded-xl border outline-none"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </div>

        <div>
          <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Episodes
          </label>
          <input
            type="number"
            {...register('episodes')}
            placeholder="12"
            className="w-full h-10 px-3 text-sm rounded-xl border outline-none"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
          {errors.episodes && <p className="text-xs text-red-500 mt-1">{errors.episodes.message}</p>}
        </div>

        <div>
          <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Score (0 - 10)
          </label>
          <input
            type="number"
            step="0.1"
            {...register('score')}
            placeholder="8.5"
            className="w-full h-10 px-3 text-sm rounded-xl border outline-none"
            style={{ background: 'var(--bg)', borderColor: errors.score ? '#fca5a5' : 'var(--border)', color: 'var(--text-primary)' }}
          />
          {errors.score && <p className="text-xs text-red-500 mt-1">{errors.score.message}</p>}
        </div>

        <div>
          <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Watched Date
          </label>
          <input
            type="date"
            {...register('watched_date')}
            className="w-full h-10 px-3 text-xs rounded-xl border outline-none"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* ─── Studio ─── */}
      <div>
        <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--text-muted)' }}>
          Studio
        </label>
        <select
          {...register('studio_id')}
          className="w-full h-10 px-3 text-sm rounded-xl border outline-none cursor-pointer"
          style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          <option value="">Select Studio (Optional)</option>
          {studios.map((studio) => (
            <option key={studio.id} value={studio.id}>
              {studio.name}
            </option>
          ))}
        </select>
      </div>

      {/* ─── Genres Selection (Multi-select) ─── */}
      <GenreSelector
        genres={genres}
        selectedGenreIds={selectedGenreIds}
        onToggle={handleGenreToggle}
        error={errors.genre_ids?.message}
      />

      {/* ─── Description / Review ─── */}
      <div>
        <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--text-muted)' }}>
          Description / Review
        </label>
        <textarea
          rows={3}
          {...register('description')}
          placeholder="Brief description or personal review thoughts..."
          className="w-full p-3 text-sm rounded-xl border outline-none resize-none"
          style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        />
      </div>

      {/* ─── Action Buttons ─── */}
      <FormActions
        isLoading={isLoading}
        isEdit={!!initialData}
        onCancel={onCancel}
      />
    </form>
  );
}

export default MediaForm;
