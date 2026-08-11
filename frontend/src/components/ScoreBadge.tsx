import { Star } from 'lucide-react';

interface ScoreBadgeProps {
  score: number | null;
  size?: 'sm' | 'md' | 'lg';
  showStars?: boolean;
}

function getScoreColor(score: number): { bg: string; text: string; border: string } {
  if (score >= 9.0) return { bg: 'var(--color-primary-100)', text: 'var(--color-primary-700)', border: 'var(--color-primary-300)' };
  if (score >= 8.0) return { bg: 'var(--color-accent-100)', text: 'var(--color-accent-700)', border: 'var(--color-accent-300)' };
  if (score >= 7.0) return { bg: '#fff7ed', text: '#c2410c', border: '#fdba74' };
  return { bg: '#fef2f2', text: '#b91c1c', border: '#fca5a5' };
}

function getStarCount(score: number): number {
  return Math.round(score / 2);
}

function ScoreBadge({ score, size = 'sm', showStars = false }: ScoreBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
        style={{ background: 'var(--border-subtle)', color: 'var(--text-muted)' }}
      >
        N/A
      </span>
    );
  }

  const colors = getScoreColor(score);
  const starCount = getStarCount(score);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const starSize = size === 'lg' ? 14 : size === 'md' ? 12 : 10;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg font-bold border ${sizeClasses[size]}`}
      style={{ background: colors.bg, color: colors.text, borderColor: colors.border }}
    >
      {showStars && (
        <span className="flex items-center gap-px">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={starSize}
              fill={i < starCount ? colors.text : 'transparent'}
              stroke={i < starCount ? colors.text : colors.border}
              strokeWidth={1.5}
            />
          ))}
        </span>
      )}
      {score.toFixed(1)}
    </span>
  );
}

export default ScoreBadge;
