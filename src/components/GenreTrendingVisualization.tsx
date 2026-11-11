import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, Activity, Flame, Award, Sparkles, TrendingUp, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../context/AppStore';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { localizeGenre } from '../lib/genreNames';

/**
 * Palette for the (dynamic) genre series. Colors are assigned by rank so we do
 * not depend on a hard-coded Turkish genre list.
 */
const GENRE_COLORS = [
  '#f43f5e', '#a855f7', '#06b6d4', '#eab308', '#f97316',
  '#3b82f6', '#ec4899', '#10b981', '#84cc16', '#8b5cf6',
];

interface GenreDatum {
  genre: string;      // localized display name
  rawGenre: string;   // source name used for aggregation
  titles: number;     // number of watchlist titles in this genre
  episodes: number;   // total episodes watched in this genre
  share: number;      // % of the user's list
  color: string;
}

interface GenreTrendingVisualizationProps {
  onSelectGenre?: (genreId: number) => void;
  selectedGenreId?: number | null;
}

const CustomTooltip = ({ active, payload }: any) => {
  const { t } = useAppTranslation();
  if (active && payload && payload.length) {
    const data = payload[0].payload as GenreDatum;
    return (
      <div className="bg-white border-4 border-black p-3 neo-shadow text-black font-black uppercase text-xs space-y-1">
        <div className="flex items-center gap-2 border-b-2 border-black pb-1">
          <span className="w-3 h-3 border border-black inline-block" style={{ backgroundColor: data.color }} />
          <p className="text-sm tracking-tight">{data.genre}</p>
        </div>
        <p className="text-neutral-700">
          {t('genre_titles_label', { defaultValue: 'TITLES' })}: <span className="text-rose-600 font-extrabold">{data.titles}</span>
        </p>
        <p className="text-neutral-600">
          {t('genre_episodes_label', { defaultValue: 'EPISODES WATCHED' })}: <span className="font-extrabold">{data.episodes}</span>
        </p>
        <p className="text-neutral-600">
          {t('genre_share_label', { defaultValue: 'SHARE' })}: <span className="font-extrabold">{data.share.toFixed(1)}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export const GenreTrendingVisualization: React.FC<GenreTrendingVisualizationProps> = () => {
  const { watchlist } = useAppStore();
  const { t, i18n } = useAppTranslation();
  const navigate = useNavigate();
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'radar'>('bar');

  /**
   * Honest data only: every number below is derived from the user's own
   * watchlist. When the list is empty we render an explicit empty state —
   * we never show fabricated "trend" figures.
   */
  const { genreData, totalTitles, totalEpisodes } = useMemo(() => {
    const counts = new Map<string, { titles: number; episodes: number }>();

    (watchlist || []).forEach((item) => {
      const genres = item.anime?.genres || [];
      genres.forEach((g) => {
        const key = g.name;
        const entry = counts.get(key) || { titles: 0, episodes: 0 };
        entry.titles += 1;
        entry.episodes += Math.max(0, item.episodesWatched || 0);
        counts.set(key, entry);
      });
    });

    const titles = (watchlist || []).length;
    const episodes = (watchlist || []).reduce((acc, item) => acc + Math.max(0, item.episodesWatched || 0), 0);

    const data: GenreDatum[] = [...counts.entries()]
      .map(([rawGenre, value], index) => ({
        rawGenre,
        genre: localizeGenre(rawGenre, i18n.language),
        titles: value.titles,
        episodes: value.episodes,
        share: 0,
        color: GENRE_COLORS[index % GENRE_COLORS.length],
      }))
      .sort((a, b) => b.titles - a.titles)
      .map((datum, index) => ({
        ...datum,
        color: GENRE_COLORS[index % GENRE_COLORS.length],
        share: titles > 0 ? (datum.titles / titles) * 100 : 0,
      }));

    return { genreData: data, totalTitles: titles, totalEpisodes: episodes };
  }, [watchlist, i18n.language]);

  // Empty state: no watchlist (or no genres) → tell the truth, invite to add.
  if (genreData.length === 0) {
    return (
      <div className="bg-black border-4 border-black p-8 neo-shadow-white text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-800 text-neutral-300 text-xs font-black tracking-widest uppercase border-2 border-white/20">
          <TrendingUp size={14} />
          {t('genre_watchlist_badge', { defaultValue: 'YOUR TASTE PROFILE' })}
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
          {t('genre_empty_title', { defaultValue: 'NO GENRE DATA YET' })}
        </h2>
        <p className="text-neutral-400 font-bold text-xs uppercase tracking-wider max-w-md mx-auto">
          {t('genre_empty_desc', {
            defaultValue: 'Add anime to your list and this chart will show your real genre distribution — no estimates.',
          })}
        </p>
        <button
          onClick={() => navigate('/discover')}
          className="inline-flex items-center gap-2 bg-white text-black font-black px-6 py-3 uppercase tracking-widest border-4 border-white hover:bg-rose-600 hover:border-rose-600 hover:text-white transition-all neo-shadow-white cursor-pointer"
        >
          <Plus size={18} strokeWidth={2.5} />
          {t('genre_empty_cta', { defaultValue: 'BROWSE ANIME' })}
        </button>
      </div>
    );
  }

  const topGenre = genreData[0];
  const chartDataKey = totalEpisodes > 0 ? 'episodes' : 'titles';

  return (
    <div className="bg-black border-4 border-black p-6 md:p-8 neo-shadow-white space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-4 border-white/20 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600 text-white text-xs font-black tracking-widest uppercase mb-2 border-2 border-black neo-shadow-white">
            <TrendingUp size={14} />
            {t('genre_watchlist_badge', { defaultValue: 'YOUR TASTE PROFILE' })}
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">
            {t('genre_watchlist_title', { defaultValue: 'WATCHLIST GENRE BREAKDOWN' })}
          </h2>
          <p className="text-neutral-400 font-bold text-xs uppercase tracking-wider mt-1">
            {t('genre_watchlist_subtitle', {
              defaultValue: 'Calculated from the anime in your own list — no estimated or fabricated metrics.',
            })}
          </p>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center gap-2 bg-neutral-900 p-1.5 border-2 border-white/30">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-2 transition-all ${
              chartType === 'bar'
                ? 'bg-rose-600 text-white border-white neo-shadow-white'
                : 'bg-black text-neutral-400 border-transparent hover:text-white'
            }`}
          >
            <BarChart3 size={16} /> {t('chart_bar')}
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-2 transition-all ${
              chartType === 'pie'
                ? 'bg-cyan-600 text-white border-white neo-shadow-white'
                : 'bg-black text-neutral-400 border-transparent hover:text-white'
            }`}
          >
            <PieChartIcon size={16} /> {t('chart_pie')}
          </button>
          <button
            onClick={() => setChartType('radar')}
            className={`px-3 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-2 transition-all ${
              chartType === 'radar'
                ? 'bg-amber-500 text-black border-white neo-shadow-white'
                : 'bg-black text-neutral-400 border-transparent hover:text-white'
            }`}
          >
            <Activity size={16} /> {t('chart_radar')}
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar — all values are real aggregates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border-2 border-rose-500 p-4 neo-shadow flex items-center gap-4">
          <div className="p-3 bg-rose-600 border-2 border-black text-white">
            <Flame size={24} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              {t('genre_top_genre', { defaultValue: 'YOUR TOP GENRE' })}
            </span>
            <h4 className="text-xl font-black uppercase text-white tracking-tight">{topGenre.genre}</h4>
            <p className="text-xs font-bold text-rose-400 uppercase">{topGenre.share.toFixed(1)}%</p>
          </div>
        </div>

        <div className="bg-neutral-900 border-2 border-cyan-500 p-4 neo-shadow flex items-center gap-4">
          <div className="p-3 bg-cyan-600 border-2 border-black text-white">
            <Award size={24} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              {t('genre_total_titles', { defaultValue: 'TITLES IN LIST' })}
            </span>
            <h4 className="text-xl font-black uppercase text-white tracking-tight">{totalTitles}</h4>
          </div>
        </div>

        <div className="bg-neutral-900 border-2 border-amber-500 p-4 neo-shadow flex items-center gap-4">
          <div className="p-3 bg-amber-500 border-2 border-black text-black">
            <Sparkles size={24} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              {t('genre_total_episodes', { defaultValue: 'EPISODES WATCHED' })}
            </span>
            <h4 className="text-xl font-black uppercase text-white tracking-tight">{totalEpisodes}</h4>
          </div>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="bg-white border-4 border-black p-4 md:p-6 neo-shadow h-[380px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={genreData} margin={{ top: 20, right: 20, left: -10, bottom: 25 }}>
              <XAxis
                dataKey="genre"
                tick={{ fill: '#000000', fontWeight: 900, fontSize: 11 }}
                axisLine={{ stroke: '#000000', strokeWidth: 3 }}
                tickLine={{ stroke: '#000000', strokeWidth: 2 }}
                interval={0}
              />
              <YAxis
                tick={{ fill: '#000000', fontWeight: 900, fontSize: 11 }}
                axisLine={{ stroke: '#000000', strokeWidth: 3 }}
                tickLine={{ stroke: '#000000', strokeWidth: 2 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.08)' }} />
              <Bar dataKey={chartDataKey} radius={[0, 0, 0, 0]}>
                {genreData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#000000"
                    strokeWidth={3}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </Bar>
            </BarChart>
          ) : chartType === 'pie' ? (
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={genreData}
                dataKey="titles"
                nameKey="genre"
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={50}
                paddingAngle={3}
                stroke="#000000"
                strokeWidth={3}
                label={({ genre, percent }: any) => `${genre} ${((percent || 0) * 100).toFixed(0)}%`}
                labelLine={{ stroke: '#000000', strokeWidth: 2 }}
              >
                {genreData.map((entry, index) => (
                  <Cell key={`pie-cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          ) : (
            <RadarChart cx="50%" cy="50%" outerRadius={120} data={genreData}>
              <PolarGrid stroke="#000000" strokeWidth={2} />
              <PolarAngleAxis dataKey="genre" tick={{ fill: '#000000', fontWeight: 900, fontSize: 12 }} />
              <PolarRadiusAxis angle={30} tick={{ fill: '#000000', fontWeight: 700 }} />
              <Radar
                name={t('genre_watchlist_title', { defaultValue: 'WATCHLIST GENRE BREAKDOWN' })}
                dataKey="titles"
                stroke="#f43f5e"
                fill="#f43f5e"
                fillOpacity={0.6}
                strokeWidth={3}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {genreData.map((item) => (
          <span
            key={item.rawGenre}
            className="px-3 py-1.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-2 bg-neutral-900 text-white border-black"
          >
            <span className="w-3 h-3 border border-black" style={{ backgroundColor: item.color }} />
            {item.genre} ({item.titles})
          </span>
        ))}
      </div>
    </div>
  );
};
