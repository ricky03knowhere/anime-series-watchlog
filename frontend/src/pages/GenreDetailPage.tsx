import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Tags,
  Film,
  ArrowLeft,
  Tv,
  Sparkles,
} from 'lucide-react';
import { genreApi } from '@/api/genreApi';
import { mediaApi } from '@/api/mediaApi';
import ScoreBadge from '@/components/ScoreBadge';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import { useTheme } from '@/contexts/ThemeContext';
import type { Media } from '@/types';

function GenreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const { data: genreRes, isLoading: isGenreLoading, isError: isGenreError } = useQuery({
    queryKey: ['genre-detail', id],
    queryFn: () => genreApi.getById(id!),
    enabled: !!id,
  });

  // Fetch media filtered by this genre
  const { data: mediaRes, isLoading: isMediaLoading } = useQuery({
    queryKey: ['genre-media-list', id],
    queryFn: () => mediaApi.getAll({ genre: id, limit: 100 }),
    enabled: !!id,
  });

  const genre = genreRes?.data;
  const mediaList: Media[] = mediaRes?.data || [];

  // Calculate average score
  let scoreSum = 0;
  let scoredCount = 0;
  mediaList.forEach((m) => {
    if (m.score != null) {
      scoreSum += Number(m.score);
      scoredCount++;
    }
  });
  const avgScore = scoredCount > 0 ? Number((scoreSum / scoredCount).toFixed(1)) : null;

  if (isGenreLoading || isMediaLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  if (isGenreError || !genre) {
    return (
      <EmptyState
        title="Genre not found"
        description="The genre you are looking for does not exist."
        emoji="⚠️"
        action={
          <button
            onClick={() => navigate('/genres')}
            className="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer"
            style={{ background: 'var(--color-primary-600)', color: 'white' }}
          >
            Back to Genres
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* ─── Back Button ─── */}
      <button
        onClick={() => navigate('/genres')}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:shadow cursor-pointer"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
      >
        <ArrowLeft size={14} /> Back to Genres
      </button>

      {/* ─── Genre Banner ─── */}
      <div
        className="rounded-3xl border p-6 sm:p-8 relative overflow-hidden"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #101e35, #211538, #101e35)'
            : 'linear-gradient(135deg, #ecfeff, #fae8ff, #fefce8)',
          borderColor: 'var(--color-secondary-300)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #a855f7)',
                color: 'white',
              }}
            >
              <Tags size={24} />
            </div>
            <div>
              <h1
                className="text-2xl sm:text-3xl font-black tracking-tight"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
              >
                {genre.name}
              </h1>
              <p className="text-sm font-medium mt-1 max-w-xl" style={{ color: 'var(--text-secondary)' }}>
                {genre.description || 'No detailed description available for this genre.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Media</p>
              <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
                {mediaList.length} titles
              </p>
            </div>
            {avgScore !== null && (
              <div className="text-right pl-4 border-l" style={{ borderColor: 'var(--border)' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Avg Score</p>
                <ScoreBadge score={avgScore} size="md" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Media List Grid ─── */}
      {mediaList.length === 0 ? (
        <EmptyState
          title={`No titles under "${genre.name}" yet`}
          description="Edit titles in your watchlist to assign them to this genre!"
          emoji="🎬"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaList.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/watchlist/${item.id}`)}
              className="rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer group flex flex-col justify-between"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <div className="flex gap-3.5">
                <div className="w-14 h-20 rounded-xl overflow-hidden shrink-0 border border-black/10 dark:border-white/10">
                  {item.poster_url ? (
                    <img src={item.poster_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                      <Film size={18} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className="text-sm font-bold truncate group-hover:text-cyan-500 transition-colors"
                    style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
                  >
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border"
                      style={{
                        background: item.media_type === 'anime' ? 'rgba(168,85,247,0.1)' : 'rgba(6,182,212,0.1)',
                        color: item.media_type === 'anime' ? '#a855f7' : '#06b6d4',
                        borderColor: item.media_type === 'anime' ? 'rgba(168,85,247,0.3)' : 'rgba(6,182,212,0.3)',
                      }}
                    >
                      {item.media_type === 'anime' ? <Sparkles size={10} /> : <Tv size={10} />}
                      {item.media_type === 'anime' ? 'Anime' : 'TV Series'}
                    </span>
                  </div>

                  {item.release_date && (
                    <p className="text-[11px] font-semibold text-gray-400 mt-1">
                      Released {new Date(item.release_date).getFullYear()}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <span className="text-[11px] font-semibold text-gray-400">
                  {item.episodes ? `${item.episodes} eps` : ''}
                </span>
                <ScoreBadge score={item.score} size="sm" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GenreDetailPage;
