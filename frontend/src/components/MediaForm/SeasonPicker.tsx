import { Loader2 } from 'lucide-react';

interface SeasonPickerProps {
  totalSeasons: number;
  selectedSeason: number | null;
  episodeCount: number | null;
  isFetchingSeason: boolean;
  imdbID: string | null;
  onSeasonSelect: (season: number, imdbID: string) => void;
}

export function SeasonPicker({
  totalSeasons,
  selectedSeason,
  episodeCount,
  isFetchingSeason,
  imdbID,
  onSeasonSelect,
}: SeasonPickerProps) {
  if (totalSeasons <= 0 || !imdbID) return null;

  return (
    <div className="flex items-start gap-4">
      {/* Season Dropdown */}
      <div className="flex-1">
        <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--text-muted)' }}>
          Season
        </label>
        <div className="relative">
          <select
            value={selectedSeason ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              if (val && imdbID) {
                onSeasonSelect(parseInt(val, 10), imdbID);
              }
            }}
            className="w-full h-10 px-3 text-sm rounded-xl border outline-none cursor-pointer appearance-none"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="">Select Season...</option>
            {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
              <option key={s} value={s}>
                Season {s}
              </option>
            ))}
          </select>
          {isFetchingSeason && (
            <Loader2
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin"
              style={{ color: 'var(--color-primary-500)' }}
            />
          )}
        </div>
      </div>

      {/* Episode Count Display */}
      {selectedSeason !== null && (
        <div className="flex-1">
          <label className="text-xs font-bold mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Episodes (Season {selectedSeason})
          </label>
          <div
            className="w-full h-10 px-3 text-sm rounded-xl border flex items-center"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            {isFetchingSeason ? (
              <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <Loader2 size={12} className="animate-spin" />
                Fetching...
              </span>
            ) : episodeCount !== null ? (
              <span className="font-semibold">{episodeCount} episodes</span>
            ) : (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
