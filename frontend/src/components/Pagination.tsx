import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const LIMIT_OPTIONS = [10, 25, 50, 100];

function Pagination({ page, totalPages, total, limit, onPageChange, onLimitChange }: PaginationProps) {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  if (total === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      {/* Info */}
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Showing <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{start}–{end}</span> of{' '}
        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{total}</span>
      </p>

      <div className="flex items-center gap-4">
        {/* Per page selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Per page</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="h-8 px-2 text-xs rounded-lg border cursor-pointer outline-none"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            {LIMIT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Page buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <ChevronLeft size={16} />
          </button>

          {getPageNumbers().map((p, idx) =>
            p === '...' ? (
              <span key={`ellipsis-${idx}`} className="w-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className="flex items-center justify-center w-8 h-8 rounded-lg border text-xs font-semibold transition-all cursor-pointer"
                style={{
                  background: p === page
                    ? 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700))'
                    : 'var(--bg-card)',
                  borderColor: p === page ? 'var(--color-primary-500)' : 'var(--border)',
                  color: p === page ? 'white' : 'var(--text-secondary)',
                  boxShadow: p === page ? 'var(--shadow-glow-primary)' : 'none',
                }}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="flex items-center justify-center w-8 h-8 rounded-lg border transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Pagination;
