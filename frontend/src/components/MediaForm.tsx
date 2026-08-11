import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { uploadApi } from '@/api/uploadApi';
import { useToast } from '@/contexts/ToastContext';
import type { Media, Genre, Studio, MediaType } from '@/types';

const mediaSchema = z.object({
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

interface MediaFormProps {
  initialData?: Media | null;
  genres: Genre[];
  studios: Studio[];
  onSubmit: (data: MediaFormData & { poster_url?: string | null; backdrop_url?: string | null }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

function MediaForm({ initialData, genres, studios, onSubmit, onCancel, isLoading = false }: MediaFormProps) {
  const { showToast } = useToast();

  const initialGenreIds = initialData?.media_genres
    ? initialData.media_genres.map((mg: any) => mg.genre_id || mg.genre?.id).filter(Boolean)
    : initialData?.genres
    ? initialData.genres.map((g) => g.id)
    : [];

  const [posterUrl, setPosterUrl] = useState<string | null>(initialData?.poster_url || null);
  const [backdropUrl, setBackdropUrl] = useState<string | null>(initialData?.backdrop_url || null);
  const [posterMode, setPosterMode] = useState<'file' | 'url'>('file');
  const [backdropMode, setBackdropMode] = useState<'file' | 'url'>('file');
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [isUploadingBackdrop, setIsUploadingBackdrop] = useState(false);

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

  const handleGenreToggle = (genreId: string) => {
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
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    bucket: 'media-posters' | 'media-backdrops'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      showToast('Maximum image size is 1MB', 'error');
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      showToast('Only JPG, PNG, and WEBP images are allowed', 'error');
      return;
    }

    if (bucket === 'media-posters') setIsUploadingPoster(true);
    else setIsUploadingBackdrop(true);

    try {
      const res = await uploadApi.uploadImage(file, bucket);
      if (res.data?.url) {
        if (bucket === 'media-posters') setPosterUrl(res.data.url);
        else setBackdropUrl(res.data.url);
        showToast('Image uploaded successfully', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Image upload failed', 'error');
    } finally {
      if (bucket === 'media-posters') setIsUploadingPoster(false);
      else setIsUploadingBackdrop(false);
    }
  };

  const onFormSubmit: SubmitHandler<MediaFormData> = async (data) => {
    await onSubmit({
      ...data,
      poster_url: posterUrl,
      backdrop_url: backdropUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* ─── Poster & Backdrop Options Row ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Poster Image (Upload or URL link) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold block" style={{ color: 'var(--text-muted)' }}>
              Poster Image
            </label>
            {/* Mode Selector */}
            <div className="flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setPosterMode('file')}
                className="px-2 py-0.5 rounded font-medium transition-colors cursor-pointer"
                style={{
                  background: posterMode === 'file' ? 'var(--color-primary-600)' : 'transparent',
                  color: posterMode === 'file' ? 'white' : 'var(--text-muted)',
                }}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setPosterMode('url')}
                className="px-2 py-0.5 rounded font-medium transition-colors cursor-pointer"
                style={{
                  background: posterMode === 'url' ? 'var(--color-primary-600)' : 'transparent',
                  color: posterMode === 'url' ? 'white' : 'var(--text-muted)',
                }}
              >
                Image URL
              </button>
            </div>
          </div>

          {posterUrl ? (
            <div className="relative aspect-[2/3] max-h-[180px] rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <img src={posterUrl} alt="Poster preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setPosterUrl(null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white cursor-pointer hover:bg-black"
                title="Remove Image"
              >
                <X size={14} />
              </button>
            </div>
          ) : posterMode === 'url' ? (
            <div className="space-y-2">
              <div className="relative">
                <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="url"
                  placeholder="https://example.com/poster.jpg"
                  value={posterUrl || ''}
                  onChange={(e) => setPosterUrl(e.target.value || null)}
                  className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border outline-none"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Paste a direct image URL link (e.g. from MyAnimeList or Unsplash)
              </p>
            </div>
          ) : (
            <div
              className="relative aspect-[2/3] max-h-[180px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center overflow-hidden transition-colors"
              style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
            >
              <label className="cursor-pointer flex flex-col items-center gap-1.5 w-full h-full justify-center">
                <ImageIcon size={24} style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  {isUploadingPoster ? 'Uploading...' : 'Upload Poster File'}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  JPG, PNG, WEBP &lt; 1MB
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, 'media-posters')}
                  disabled={isUploadingPoster}
                />
              </label>
            </div>
          )}
        </div>

        {/* Backdrop Image (Upload or URL link) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold block" style={{ color: 'var(--text-muted)' }}>
              Backdrop Image (Optional)
            </label>
            {/* Mode Selector */}
            <div className="flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setBackdropMode('file')}
                className="px-2 py-0.5 rounded font-medium transition-colors cursor-pointer"
                style={{
                  background: backdropMode === 'file' ? 'var(--color-primary-600)' : 'transparent',
                  color: backdropMode === 'file' ? 'white' : 'var(--text-muted)',
                }}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setBackdropMode('url')}
                className="px-2 py-0.5 rounded font-medium transition-colors cursor-pointer"
                style={{
                  background: backdropMode === 'url' ? 'var(--color-primary-600)' : 'transparent',
                  color: backdropMode === 'url' ? 'white' : 'var(--text-muted)',
                }}
              >
                Image URL
              </button>
            </div>
          </div>

          {backdropUrl ? (
            <div className="relative aspect-video max-h-[180px] rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <img src={backdropUrl} alt="Backdrop preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setBackdropUrl(null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white cursor-pointer hover:bg-black"
                title="Remove Image"
              >
                <X size={14} />
              </button>
            </div>
          ) : backdropMode === 'url' ? (
            <div className="space-y-2">
              <div className="relative">
                <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="url"
                  placeholder="https://example.com/backdrop.jpg"
                  value={backdropUrl || ''}
                  onChange={(e) => setBackdropUrl(e.target.value || null)}
                  className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border outline-none"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Paste a direct hero backdrop image URL link
              </p>
            </div>
          ) : (
            <div
              className="relative aspect-video max-h-[180px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center overflow-hidden transition-colors"
              style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
            >
              <label className="cursor-pointer flex flex-col items-center gap-1.5 w-full h-full justify-center">
                <Upload size={24} style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  {isUploadingBackdrop ? 'Uploading...' : 'Upload Backdrop File'}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Hero backdrop image
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, 'media-backdrops')}
                  disabled={isUploadingBackdrop}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* ─── Title & Type ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
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
      </div>

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
      <div>
        <label className="text-xs font-bold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
          Genres <span className="text-red-500">* (Select at least 1)</span>
        </label>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 rounded-xl border" style={{ background: 'var(--bg)', borderColor: errors.genre_ids ? '#fca5a5' : 'var(--border)' }}>
          {genres.map((genre) => {
            const isSelected = selectedGenreIds.includes(genre.id);
            return (
              <button
                key={genre.id}
                type="button"
                onClick={() => handleGenreToggle(genre.id)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer select-none"
                style={{
                  background: isSelected ? 'var(--color-primary-600)' : 'var(--bg-card)',
                  borderColor: isSelected ? 'var(--color-primary-500)' : 'var(--border)',
                  color: isSelected ? 'white' : 'var(--text-secondary)',
                }}
              >
                {genre.name}
              </button>
            );
          })}
        </div>
        {errors.genre_ids && <p className="text-xs text-red-500 mt-1">{errors.genre_ids.message}</p>}
      </div>

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
      <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-semibold rounded-xl border cursor-pointer disabled:opacity-50"
          style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2 text-sm font-semibold rounded-xl text-white transition-all cursor-pointer disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700))',
            boxShadow: 'var(--shadow-glow-primary)',
          }}
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Media' : 'Add Media'}
        </button>
      </div>
    </form>
  );
}

export default MediaForm;
