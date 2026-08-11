import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit3, Trash2, Calendar, Film, Star, Building2, Tv } from 'lucide-react';
import { mediaApi } from '@/api/mediaApi';
import { genreApi } from '@/api/genreApi';
import { studioApi } from '@/api/studioApi';
import ScoreBadge from '@/components/ScoreBadge';
import GenreBadge from '@/components/GenreBadge';
import Modal from '@/components/Modal';
import MediaForm from '@/components/MediaForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/contexts/ToastContext';
import type { Media } from '@/types';

function MediaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Fetch Media Detail
  const { data: mediaResponse, isLoading, isError } = useQuery({
    queryKey: ['media-detail', id],
    queryFn: () => mediaApi.getById(id!),
    enabled: !!id,
  });

  const { data: genresResult } = useQuery({
    queryKey: ['genres-list'],
    queryFn: () => genreApi.getAll(),
  });

  const { data: studiosResult } = useQuery({
    queryKey: ['studios-list'],
    queryFn: () => studioApi.getAll(),
  });

  const media: Media | undefined = mediaResponse?.data;
  const genres = genresResult?.data || [];
  const studios = studiosResult?.data || [];

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => mediaApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['media'] });
      setIsEditOpen(false);
      showToast('Media updated successfully', 'success');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to update media', 'error');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: () => mediaApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
      showToast('Media deleted successfully', 'success');
      navigate('/watchlist');
    },
    onError: (err: any) => {
      showToast(err.message || 'Failed to delete media', 'error');
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <LoadingSkeleton rows={4} />
      </div>
    );
  }

  if (isError || !media) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/watchlist')}
          className="flex items-center gap-2 text-sm font-semibold mb-4 cursor-pointer"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={16} /> Back to Watchlist
        </button>
        <EmptyState title="Media Not Found" description="The requested anime or TV series does not exist." emoji="🔍" />
      </div>
    );
  }

  const genreList = media.media_genres
    ? media.media_genres.map((mg: any) => mg.genre).filter(Boolean)
    : media.genres || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ─── Back Button & Actions ─── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/watchlist')}
          className="flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer px-3 py-1.5 rounded-xl border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <ArrowLeft size={16} /> Back to Watchlist
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <Edit3 size={14} /> Edit
          </button>
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-red-500 border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 transition-colors cursor-pointer"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* ─── Hero Section with Backdrop / Poster ─── */}
      <div
        className="relative rounded-3xl border overflow-hidden shadow-xl"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        {/* Backdrop Banner */}
        <div className="h-48 sm:h-64 lg:h-80 w-full relative bg-slate-900 overflow-hidden">
          {media.backdrop_url ? (
            <img src={media.backdrop_url} alt={media.title} className="w-full h-full object-cover opacity-60 filter blur-xs scale-105" />
          ) : media.poster_url ? (
            <img src={media.poster_url} alt={media.title} className="w-full h-full object-cover opacity-30 filter blur-md" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-purple-900 via-indigo-900 to-cyan-900 opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-transparent to-black/20" />
        </div>

        {/* Content Info Overlapping Hero */}
        <div className="p-6 sm:p-8 -mt-24 sm:-mt-32 relative z-10 flex flex-col sm:flex-row gap-6">
          {/* Poster Frame */}
          <div
            className="w-36 sm:w-48 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-4 shrink-0 mx-auto sm:mx-0"
            style={{ borderColor: 'var(--bg-card)', background: 'var(--border-subtle)' }}
          >
            {media.poster_url ? (
              <img src={media.poster_url} alt={media.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">🎬</div>
            )}
          </div>

          {/* Title & Metadata */}
          <div className="flex-1 space-y-4 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider text-white"
                style={{
                  background: media.media_type === 'anime' ? 'var(--color-primary-600)' : 'var(--color-secondary-600)',
                }}
              >
                {media.media_type === 'anime' ? 'Anime' : 'TV Series'}
              </span>
              <ScoreBadge score={media.score} size="md" showStars />
            </div>

            <h1
              className="text-2xl sm:text-4xl font-extrabold tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              {media.title}
            </h1>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl border" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                <span className="flex items-center gap-1.5 font-semibold text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                  <Calendar size={12} /> Release Year
                </span>
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {media.release_date ? new Date(media.release_date).getFullYear() : 'Unknown'}
                </p>
              </div>

              <div className="p-3 rounded-xl border" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                <span className="flex items-center gap-1.5 font-semibold text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                  <Tv size={12} /> Episodes
                </span>
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {media.episodes ? `${media.episodes} eps` : '—'}
                </p>
              </div>

              <div className="p-3 rounded-xl border" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                <span className="flex items-center gap-1.5 font-semibold text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                  <Building2 size={12} /> Studio
                </span>
                <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                  {media.studio?.name || '—'}
                </p>
              </div>

              <div className="p-3 rounded-xl border" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                <span className="flex items-center gap-1.5 font-semibold text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                  <Film size={12} /> Watched Date
                </span>
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {media.watched_date ? new Date(media.watched_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </p>
              </div>
            </div>

            {/* Genres */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold block" style={{ color: 'var(--text-muted)' }}>Genres</span>
              <div className="flex flex-wrap gap-1.5">
                {genreList.map((g: any) => (
                  <GenreBadge key={g.id} name={g.name} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Description / Personal Review Section ─── */}
      <div className="rounded-3xl border p-6 sm:p-8 space-y-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <h3 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
          <Star size={18} className="text-amber-400 fill-amber-400" /> Description & Review Notes
        </h3>
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
          {media.description || 'No detailed description or review added for this title yet.'}
        </p>
      </div>

      {/* ─── Edit Modal ─── */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Media Title" maxWidth="xl">
        <MediaForm
          initialData={media}
          genres={genres}
          studios={studios}
          onSubmit={async (data) => {
            await updateMutation.mutateAsync(data);
          }}
          onCancel={() => setIsEditOpen(false)}
          isLoading={updateMutation.isPending}
        />
      </Modal>

      {/* ─── Delete Confirmation Modal ─── */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={async () => {
          await deleteMutation.mutateAsync();
        }}
        title={`Delete "${media.title}"?`}
        message="Are you sure you want to remove this title from your watchlist? This action cannot be undone."
        confirmText="Delete Media"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default MediaDetailPage;
