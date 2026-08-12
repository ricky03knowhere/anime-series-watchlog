import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Film,
  X,
  ExternalLink,
  BarChart3,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { analyticsApi } from '@/api/analyticsApi';
import ScoreBadge from '@/components/ScoreBadge';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import { useTheme } from '@/contexts/ThemeContext';
import type { StudioExplorerItem } from '@/types';

function StudioExplorerPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [selectedStudio, setSelectedStudio] = useState<StudioExplorerItem | null>(null);

  const { data: explorerRes, isLoading, isError } = useQuery({
    queryKey: ['studio-explorer-data'],
    queryFn: () => analyticsApi.getStudioExplorer(),
  });

  const studios: StudioExplorerItem[] = explorerRes?.data || [];

  // Recharts styling
  const tooltipBg = isDark ? '#1a1d2e' : '#ffffff';
  const tooltipBorder = isDark ? '#2e3347' : '#e5e7eb';
  const tooltipText = isDark ? '#f1f5f9' : '#1a1a2e';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#94a3b8' : '#6b7280';

  const chartData = studios.map((s) => ({
    name: s.name,
    count: s.totalWatched,
    avgScore: s.averageScore,
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8 pb-10">
      {/* ─── Header ─── */}
      <div
        className="relative overflow-hidden rounded-3xl border p-6 sm:p-8"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #1f1035, #2e174d, #101e35)'
            : 'linear-gradient(135deg, #fae8ff, #f3e8ff, #e0e7ff)',
          borderColor: 'var(--color-primary-300)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              color: 'white',
            }}
          >
            <Building2 size={24} />
          </div>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-black tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              STUDIO EXPLORER
            </h1>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Deep dive into production studios, animation houses, and networks
            </p>
          </div>
        </div>
      </div>

      {/* ─── Loading / Error ─── */}
      {isLoading && <LoadingSkeleton rows={6} />}

      {isError && (
        <EmptyState
          title="Failed to load studio explorer"
          description="Check backend server connection and try again."
          emoji="⚠️"
        />
      )}

      {/* ─── Studio Cards Grid ─── */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {studios.map((studio, idx) => (
            <motion.div
              key={studio.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              onClick={() => setSelectedStudio(studio)}
              className="rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer relative overflow-hidden group flex flex-col justify-between"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border)',
              }}
            >
              {/* Top Accent */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-60 group-hover:opacity-100 transition-opacity" />

              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3
                    className="text-lg font-black truncate group-hover:text-purple-500 transition-colors"
                    style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
                  >
                    {studio.name}
                  </h3>
                  <ScoreBadge score={studio.averageScore} size="sm" />
                </div>

                <p className="text-xs font-semibold text-gray-500 mb-4 line-clamp-2">
                  {studio.description || 'No studio description available.'}
                </p>
              </div>

              {/* Top Title Preview Thumbnail */}
              {studio.topTitle ? (
                <div className="flex items-center gap-3 p-2 rounded-xl border bg-black/5 dark:bg-white/5">
                  <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0">
                    {studio.topTitle.poster_url ? (
                      <img src={studio.topTitle.poster_url} alt={studio.topTitle.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                        <Film size={14} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-purple-500">Highest Rated</p>
                    <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                      {studio.topTitle.title}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] font-medium text-gray-400 italic">No titles produced yet</div>
              )}

              <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs font-bold" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{studio.totalWatched} titles</span>
                <span className="text-purple-500 group-hover:underline">Explore →</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ─── Studio Charts ─── */}
      {!isLoading && !isError && chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border p-6 space-y-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              <BarChart3 size={18} className="text-indigo-500" /> Titles Produced Per Studio
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" stroke={textColor} fontSize={11} tickLine={false} />
                  <YAxis stroke={textColor} fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', color: tooltipText, fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border p-6 space-y-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              <Award size={18} className="text-purple-500" /> Studio Average Score
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.slice().sort((a, b) => b.avgScore - a.avgScore)}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" stroke={textColor} fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 10]} stroke={textColor} fontSize={11} />
                  <Tooltip contentStyle={{ background: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', color: tooltipText, fontSize: '12px' }} />
                  <Bar dataKey="avgScore" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ─── Studio Detail Modal / Drawer ─── */}
      <AnimatePresence>
        {selectedStudio && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[85vh] rounded-3xl border p-6 overflow-y-auto flex flex-col shadow-2xl relative"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between pb-4 border-b mb-4" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                      {selectedStudio.name}
                    </h2>
                    <ScoreBadge score={selectedStudio.averageScore} size="md" />
                  </div>
                  {selectedStudio.website_url && (
                    <a
                      href={selectedStudio.website_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-purple-500 hover:underline flex items-center gap-1 mt-1"
                    >
                      Visit Website <ExternalLink size={12} />
                    </a>
                  )}
                </div>
                <button
                  onClick={() => setSelectedStudio(null)}
                  className="p-2 rounded-full border cursor-pointer hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              {selectedStudio.mediaList.length === 0 ? (
                <p className="text-center py-8 text-sm text-gray-400 italic">No media produced by this studio yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedStudio.mediaList.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedStudio(null);
                        navigate(`/watchlist/${m.id}`);
                      }}
                      className="flex items-center gap-3 p-3 rounded-2xl border transition-all hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <div className="w-12 h-16 rounded-xl overflow-hidden shrink-0">
                        {m.poster_url ? (
                          <img src={m.poster_url} alt={m.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                            <Film size={16} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                          {m.title}
                        </p>
                        <p className="text-[11px] font-semibold text-gray-500">
                          {m.media_type === 'anime' ? 'Anime' : 'TV Series'} {m.episodes ? `· ${m.episodes} eps` : ''}
                        </p>
                      </div>
                      <ScoreBadge score={m.score} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default StudioExplorerPage;
