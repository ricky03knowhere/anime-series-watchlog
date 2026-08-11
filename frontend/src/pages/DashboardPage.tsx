import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Film,
  Tv,
  Star,
  Clock,
  Award,
  Building2,
  Sparkles,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Layers,
  HeartHandshake,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';
import { analyticsApi, type DashboardAnalyticsData } from '@/api/analyticsApi';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import EmptyState from '@/components/EmptyState';
import { useTheme } from '@/contexts/ThemeContext';

function DashboardPage() {
  const { isDark } = useTheme();
  const [timeToggle, setTimeToggle] = useState<'yearly' | 'monthly'>('yearly');

  const { data: analyticsResponse, isLoading, isError } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: () => analyticsApi.getDashboardAnalytics(),
  });

  const data: DashboardAnalyticsData | undefined = analyticsResponse?.data;
  const stats = data?.stats;
  const personality = data?.personality;
  const charts = data?.charts;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (isError || !stats || !charts) {
    return (
      <EmptyState
        title="Failed to load dashboard analytics"
        description="Check backend server connection and try again."
        emoji="⚠️"
      />
    );
  }

  // Theme colors for charts
  const tooltipBg = isDark ? '#1a1d2e' : '#ffffff';
  const tooltipBorder = isDark ? '#2e3347' : '#e5e7eb';
  const tooltipText = isDark ? '#f1f5f9' : '#1a1a2e';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#94a3b8' : '#6b7280';

  const overTimeData =
    timeToggle === 'yearly'
      ? charts.watchedOverTimeYearly.map((item) => ({ label: item.year, count: item.count }))
      : charts.watchedOverTimeMonthly.map((item) => ({ label: item.monthYear, count: item.count }));

  return (
    <div className="space-y-8 pb-10">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5" style={{ borderColor: 'var(--border)' }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍿</span>
            <h2
              className="text-2xl sm:text-3xl font-extrabold tracking-tight"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              Welcome to Your Watchlog
            </h2>
          </div>
          <p className="text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
            Track. Rate. Discover. Repeat.
          </p>
        </div>

        {/* Total Time Badge */}
        <div
          className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl border shadow-sm"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.2))'
              : 'linear-gradient(135deg, rgba(243,232,255,0.8), rgba(207,250,254,0.8))',
            borderColor: 'var(--color-primary-300)',
          }}
        >
          <Clock size={20} className="text-purple-600 dark:text-purple-400 shrink-0" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Estimated Watch Time
            </p>
            <p className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
              ≈ {stats.totalWatchTimeHours} hrs <span className="text-xs font-normal">({stats.totalWatchTimeDays} days)</span>
            </p>
          </div>
        </div>
      </div>

      {/* ─── 8 Retro Ticket Stat Cards ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Watched', value: stats.totalWatched, unit: 'titles', icon: <Film size={20} />, color: 'var(--color-primary-500)', bg: 'var(--color-primary-50)' },
          { label: 'Anime Watched', value: stats.animeWatched, unit: 'series', icon: <Sparkles size={20} />, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
          { label: 'TV Series', value: stats.tvSeriesWatched, unit: 'shows', icon: <Tv size={20} />, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
          { label: 'Total Episodes', value: stats.totalEpisodes.toLocaleString(), unit: 'eps', icon: <Layers size={20} />, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
          { label: 'Average Score', value: `${stats.averageScore}`, unit: '/ 10', icon: <Star size={20} />, color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
          { label: 'Favorite Genre', value: stats.favoriteGenre, unit: 'most watched', icon: <Award size={20} />, color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
          { label: 'Favorite Studio', value: stats.favoriteStudio, unit: 'loyalty', icon: <Building2 size={20} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
          { label: 'Watch Time', value: `${stats.totalWatchTimeDays}`, unit: 'days spent', icon: <Clock size={20} />, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
        ].map((card, idx) => (
          <div
            key={idx}
            className="relative rounded-2xl border p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 overflow-hidden group"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
            }}
          >
            {/* Retro Ticket Cutout Accents */}
            <div
              className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-r-0"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
            />
            <div
              className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-l-0"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
            />

            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: card.bg, color: card.color }}
              >
                {card.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                {card.unit}
              </span>
            </div>

            <p
              className="text-xl sm:text-2xl font-extrabold truncate"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              {card.value}
            </p>
            <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* ─── Watch Personality Banner ─── */}
      {personality && (
        <div
          className="rounded-3xl border p-6 sm:p-8 relative overflow-hidden"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #1e1b4b, #0f172a)'
              : 'linear-gradient(135deg, #faf5ff, #ecfeff)',
            borderColor: 'var(--color-primary-300)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🎭</span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">
              Your Watch Personality
            </span>
          </div>

          <h3
            className="text-2xl sm:text-4xl font-black tracking-tight mb-2"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
          >
            {personality.title}
          </h3>

          <p className="text-sm font-medium mb-5 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            {personality.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2.5">
              <Star size={16} className="text-amber-500 shrink-0" />
              <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                {personality.ratingSnobText}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <HeartHandshake size={16} className="text-purple-500 shrink-0" />
              <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                {personality.studioLoyaltyText}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar size={16} className="text-cyan-500 shrink-0" />
              <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                {personality.primeMonthText}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── CHARTS GRID SECTION ─── */}

      {/* Chart 1: Watched Media Over Time */}
      <div className="rounded-3xl border p-6 space-y-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              <TrendingUp size={18} className="text-purple-500" /> Watched Media Over Time
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Total anime & TV series finished per timeline
            </p>
          </div>

          <div className="flex items-center rounded-xl border p-0.5" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
            <button
              onClick={() => setTimeToggle('yearly')}
              className="px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              style={{
                background: timeToggle === 'yearly' ? 'var(--color-primary-600)' : 'transparent',
                color: timeToggle === 'yearly' ? 'white' : 'var(--text-muted)',
              }}
            >
              Yearly
            </button>
            <button
              onClick={() => setTimeToggle('monthly')}
              className="px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              style={{
                background: timeToggle === 'monthly' ? 'var(--color-primary-600)' : 'transparent',
                color: timeToggle === 'monthly' ? 'white' : 'var(--text-muted)',
              }}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={overTimeData}>
              <defs>
                <linearGradient id="gradientColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="label" stroke={textColor} fontSize={12} tickLine={false} />
              <YAxis stroke={textColor} fontSize={12} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', color: tooltipText, fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#gradientColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Donut Chart & Genre Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 2: Anime vs TV Series (Donut) */}
        <div className="rounded-3xl border p-6 space-y-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              <PieChartIcon size={18} className="text-cyan-500" /> Anime vs TV Series
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Ratio of formats in your watchlog</p>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.typeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', color: tooltipText, fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 pt-2">
            {charts.typeDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {item.name}: <span className="font-bold">{item.value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Genre Distribution */}
        <div className="lg:col-span-2 rounded-3xl border p-6 space-y-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              <BarChart3 size={18} className="text-pink-500" /> Genre Distribution
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Most watched genres across titles</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.genreDistribution} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                <XAxis type="number" stroke={textColor} fontSize={12} allowDecimals={false} />
                <YAxis dataKey="genre" type="category" stroke={textColor} fontSize={12} width={90} tickLine={false} />
                <Tooltip contentStyle={{ background: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', color: tooltipText, fontSize: '12px' }} />
                <Bar dataKey="count" fill="#ec4899" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Score Distribution & Release Year */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 4: Score Distribution */}
        <div className="rounded-3xl border p-6 space-y-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              <Star size={18} className="text-amber-500" /> Score Distribution
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>How you rate titles (6.0 - 10)</p>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="range" stroke={textColor} fontSize={12} tickLine={false} />
                <YAxis stroke={textColor} fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', color: tooltipText, fontSize: '12px' }} />
                <Bar dataKey="count" fill="#eab308" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Release Year Distribution */}
        <div className="rounded-3xl border p-6 space-y-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              <Calendar size={18} className="text-blue-500" /> Release Year Distribution
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Titles watched by release year</p>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.releaseYearDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="year" stroke={textColor} fontSize={12} tickLine={false} />
                <YAxis stroke={textColor} fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', color: tooltipText, fontSize: '12px' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Watched Month & Top Studios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 6: Watched Month Frequency */}
        <div className="rounded-3xl border p-6 space-y-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              <Calendar size={18} className="text-emerald-500" /> Watched Month Frequency
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Which months of the year you watch most</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.watchedByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month" stroke={textColor} fontSize={12} tickLine={false} />
                <YAxis stroke={textColor} fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', color: tooltipText, fontSize: '12px' }} />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 7: Top Studios */}
        <div className="rounded-3xl border p-6 space-y-4" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              <Building2 size={18} className="text-indigo-500" /> Top Studios
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Top 10 production studios in your watchlog</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.topStudios} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                <XAxis type="number" stroke={textColor} fontSize={12} allowDecimals={false} />
                <YAxis dataKey="studio" type="category" stroke={textColor} fontSize={12} width={110} tickLine={false} />
                <Tooltip contentStyle={{ background: tooltipBg, borderColor: tooltipBorder, borderRadius: '12px', color: tooltipText, fontSize: '12px' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
