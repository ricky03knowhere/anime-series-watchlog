import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { analyticsApi } from '@/api/analyticsApi';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import { useTheme } from '@/contexts/ThemeContext';
import type { InsightsData } from '@/types';

function InsightsPage() {
  const { isDark } = useTheme();

  const { data: insightsRes, isLoading, isError } = useQuery({
    queryKey: ['insights-analytics'],
    queryFn: () => analyticsApi.getInsights(),
  });

  const data: InsightsData | undefined = insightsRes?.data;
  const personality = data?.personality;
  const insights = data?.insights || [];
  const ratingOverTime = data?.ratingOverTime || [];

  // Theme chart styling
  const tooltipBg = isDark ? '#1a1d2e' : '#ffffff';
  const tooltipBorder = isDark ? '#2e3347' : '#e5e7eb';
  const tooltipText = isDark ? '#f1f5f9' : '#1a1a2e';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#94a3b8' : '#6b7280';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load insights"
        description="Check backend server connection and try again."
        emoji="⚠️"
      />
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* ─── Header ─── */}
      <div
        className="relative overflow-hidden rounded-3xl border p-6 sm:p-8"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #1e1035, #2d184d, #101530)'
            : 'linear-gradient(135deg, #fae8ff, #f3e8ff, #e0f2fe)',
          borderColor: 'var(--color-primary-300)',
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
              color: 'white',
            }}
          >
            <BarChart3 size={24} />
          </div>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-black tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              DEEP INSIGHTS
            </h1>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Behavioral analytics and personalized trends from your watchlog
            </p>
          </div>
        </div>
      </div>

      {/* ─── Personality Banner ─── */}
      {personality && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border p-6 sm:p-8 relative overflow-hidden"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #1a1638, #0f172a)'
              : 'linear-gradient(135deg, #faf5ff, #f0fdf4)',
            borderColor: 'var(--color-primary-400)',
            boxShadow: 'var(--shadow-glow-primary)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-amber-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">
              Your Watching Personality
            </span>
          </div>

          <h2
            className="text-2xl sm:text-4xl font-black tracking-tight mb-2"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            {personality.title}
          </h2>

          <p className="text-sm font-medium max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            {personality.description}
          </p>
        </motion.div>
      )}

      {/* ─── 12 Insight Cards Grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {insights.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.04 }}
            className="rounded-2xl border p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
            }}
          >
            {/* Retro Card Top Accent */}
            <div
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-500 to-amber-400 opacity-60 group-hover:opacity-100 transition-opacity"
            />

            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{item.emoji}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                Insight #{item.id}
              </span>
            </div>

            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {item.label}
            </p>

            <h3
              className="text-lg sm:text-xl font-black mt-1 truncate"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              {item.value}
            </h3>

            <p className="text-xs font-semibold mt-1" style={{ color: 'var(--color-primary-600)' }}>
              {item.detail}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ─── Chart: Average Rating Over Time ─── */}
      {ratingOverTime.length > 0 && (
        <div className="rounded-3xl border p-6 space-y-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              <TrendingUp size={18} className="text-purple-500" /> Average Rating Over Time
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Tracking how your average score changes across completed watch periods
            </p>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ratingOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="period" stroke={textColor} fontSize={12} tickLine={false} />
                <YAxis domain={[0, 10]} stroke={textColor} fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', color: tooltipText, fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="averageScore" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, fill: '#a855f7' }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default InsightsPage;
