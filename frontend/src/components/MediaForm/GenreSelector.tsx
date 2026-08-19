import type { Genre } from '@/types';

interface GenreSelectorProps {
  genres: Genre[];
  selectedGenreIds: string[];
  onToggle: (genreId: string) => void;
  error?: string;
}

export function GenreSelector({ genres, selectedGenreIds, onToggle, error }: GenreSelectorProps) {
  return (
    <div>
      <label className="text-xs font-bold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
        Genres <span className="text-red-500">* (Select at least 1)</span>
      </label>
      <div
        className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 rounded-xl border"
        style={{ background: 'var(--bg)', borderColor: error ? '#fca5a5' : 'var(--border)' }}
      >
        {genres.map((genre) => {
          const isSelected = selectedGenreIds.includes(genre.id);
          return (
            <button
              key={genre.id}
              type="button"
              onClick={() => onToggle(genre.id)}
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
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
