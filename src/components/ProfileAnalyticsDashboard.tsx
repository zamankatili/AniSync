import React, { useMemo } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip 
} from 'recharts';
import { WatchlistItem } from '../types';
import { BarChart3, Clock, CheckCircle2, Flame, Award, Tv, Layers } from 'lucide-react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { localizeGenre } from '../lib/genreNames';

interface ProfileAnalyticsDashboardProps {
  watchlist: WatchlistItem[];
  isOwnProfile?: boolean;
}

export const ProfileAnalyticsDashboard: React.FC<ProfileAnalyticsDashboardProps> = ({ 
  watchlist,
  isOwnProfile = true 
}) => {
  const { t } = useAppTranslation();

  // 1. Calculate Top Genres for Radar Chart
  const radarData = useMemo(() => {
    const genreCounts: Record<string, number> = {};
    watchlist.forEach((item) => {
      const genres = item.anime?.genres || [];
      genres.forEach((g) => {
        if (g.name) {
          genreCounts[g.name] = (genreCounts[g.name] || 0) + 1;
        }
      });
    });

    const sorted = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Dürüstlük: liste boşsa veya tür verisi yoksa grafik için uydurma tür
    // dağılımı üretme; boş dizi döndür ve bileşende açık bir boş durum göster.
    const maxVal = Math.max(...sorted.map(s => s.count), 1);

    return sorted.map((s) => ({
      genre: localizeGenre(s.genre),
      count: s.count,
      fullMark: maxVal + 2,
    }));
  }, [watchlist]);

  // 2. Calculate Hours Spent Watching
  const statsMetrics = useMemo(() => {
    const completedList = watchlist.filter((i) => i.status === 'completed');
    const watchingList = watchlist.filter((i) => i.status === 'watching');
    const plannedList = watchlist.filter((i) => i.status === 'plan_to_watch');
    const droppedList = watchlist.filter((i) => i.status === 'dropped');

    // Dürüstlük: yalnızca gerçekten bilinen bölüm sayılarını topla.
    // Bilinmeyen seriler için 12 bölüm varsayımı veya izlerken %50 tahmini YAPMA.
    let unknownEpisodeCount = 0;
    const completedEpisodes = completedList.reduce((acc, item) => {
      const known = item.anime?.episodes ?? (item.episodesWatched > 0 ? item.episodesWatched : null);
      if (typeof known !== 'number' || known <= 0) {
        unknownEpisodeCount += 1;
        return acc;
      }
      return acc + known;
    }, 0);

    // İzlenenlerde yalnızca kullanıcının girdiği gerçek ilerleme sayılır.
    const watchingEpisodes = watchingList.reduce((acc, item) => {
      const progress = item.episodesWatched;
      if (typeof progress !== 'number' || progress <= 0) {
        unknownEpisodeCount += 1;
        return acc;
      }
      return acc + progress;
    }, 0);

    const totalEpisodesWatched = completedEpisodes + watchingEpisodes;
    const totalMinutes = totalEpisodesWatched * 24; // bölüm başına 24 dk varsayımı
    const totalHours = (totalMinutes / 60).toFixed(1);
    const totalDays = (totalMinutes / (60 * 24)).toFixed(1);

    // Completion Rate
    const totalListCount = watchlist.length || 1;
    const completionRate = Math.round((completedList.length / totalListCount) * 100);
    const watchingRate = Math.round((watchingList.length / totalListCount) * 100);
    const planRate = Math.round((plannedList.length / totalListCount) * 100);
    const dropRate = Math.round((droppedList.length / totalListCount) * 100);

    // Milestone target (e.g. 100 hours or 500 hours)
    const hoursNum = parseFloat(totalHours);
    const milestoneTarget = hoursNum < 50 ? 50 : hoursNum < 100 ? 100 : hoursNum < 250 ? 250 : 500;
    const milestonePercent = Math.min(100, Math.round((hoursNum / milestoneTarget) * 100));

    return {
      totalHours,
      totalDays,
      totalEpisodesWatched,
      unknownEpisodeCount,
      completedCount: completedList.length,
      watchingCount: watchingList.length,
      planCount: plannedList.length,
      dropCount: droppedList.length,
      completionRate,
      watchingRate,
      planRate,
      dropRate,
      milestoneTarget,
      milestonePercent
    };
  }, [watchlist]);

  const CustomRadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black border-2 border-amber-400 p-2 text-white font-black text-xs uppercase neo-shadow shadow-[2px_2px_0px_0px_#f59e0b]">
          <span className="text-amber-400">{payload[0].payload.genre}</span>: {payload[0].value} {t('series_count')}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border-4 border-black p-6 md:p-8 neo-shadow space-y-8 relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-400 text-black border-4 border-black flex items-center justify-center font-black neo-shadow">
            <BarChart3 size={24} strokeWidth={3} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-black uppercase tracking-tight">
              {isOwnProfile ? t('analytics_title_own') : t('analytics_title_other')}
            </h2>
            <p className="text-xs text-neutral-600 font-bold uppercase tracking-wider">
              {t('analytics_subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-black text-amber-400 font-black text-xs px-3 py-1 border-2 border-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000]">
            <Award size={14} /> {t('analytics_total_hours', { hours: statsMetrics.totalHours })}
          </span>
        </div>
      </div>

      {/* Grid Layout: Left Radar Chart / Right Progress Bar Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Col: Top Genres Radar Chart */}
        <div className="bg-neutral-950 border-4 border-black p-4 neo-shadow relative flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2 pb-2 border-b-2 border-white/20">
            <span className="text-amber-400 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={14} /> {t('analytics_top_genres')}
            </span>
            <span className="text-[10px] text-neutral-400 font-mono font-bold uppercase">
              RECHARTS RADAR
            </span>
          </div>

          {radarData.length > 0 ? (
            <div className="w-full h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#333333" strokeWidth={1.5} />
                  <PolarAngleAxis 
                    dataKey="genre" 
                    tick={{ fill: '#ffffff', fontSize: 11, fontWeight: 900 }} 
                  />
                  <PolarRadiusAxis 
                    angle={30} 
                    domain={[0, 'dataMax']} 
                    tick={{ fill: '#fbbf24', fontSize: 9, fontWeight: 700 }} 
                  />
                  <Radar 
                    name={t('analytics_series_watched')} 
                    dataKey="count" 
                    stroke="#fbbf24" 
                    fill="#f59e0b" 
                    fillOpacity={0.65} 
                    strokeWidth={3}
                  />
                  <Tooltip content={<CustomRadarTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="w-full h-72 sm:h-80 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <Layers size={40} className="text-neutral-600" strokeWidth={2} />
              <p className="text-sm font-black text-neutral-300 uppercase tracking-wider">
                {t('analytics_radar_empty_title')}
              </p>
              <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">
                {t('analytics_radar_empty_desc')}
              </p>
            </div>
          )}

          <p className="text-[10px] text-neutral-400 font-bold uppercase text-center mt-1">
            {t('analytics_radar_note')}
          </p>
        </div>

        {/* Right Col: Hours Spent & Completion Progress Bars */}
        <div className="space-y-6">
          
          {/* Card 1: Hours Spent & Milestone Progress Bar */}
          <div className="bg-amber-400 border-4 border-black p-5 neo-shadow space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-black" strokeWidth={3} />
                <h3 className="font-black text-sm uppercase tracking-wider text-black">
                  {t('analytics_hours_spent')}
                </h3>
              </div>
              <span className="bg-black text-white font-black text-xs px-2.5 py-0.5 border border-black uppercase font-mono">
                {t('analytics_days', { days: statsMetrics.totalDays })}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-4xl font-black text-black tracking-tight leading-none">
                  {statsMetrics.totalHours}
                </span>
                <span className="text-sm font-black text-black uppercase ml-1.5">{t('analytics_hours_label')}</span>
              </div>
              <span className="text-xs font-black uppercase text-black">
                {t('analytics_episodes_x_min', { episodes: statsMetrics.totalEpisodesWatched })}
              </span>
            </div>

            <p className="text-[10px] font-bold uppercase text-black/70 leading-snug">
              {t('analytics_estimate_note')}
              {statsMetrics.unknownEpisodeCount > 0
                ? ` ${t('analytics_unknown_excluded', { count: statsMetrics.unknownEpisodeCount })}`
                : ''}
            </p>

            {/* Hours Milestone Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] font-black uppercase text-black">
                <span>{t('analytics_milestone', { hours: statsMetrics.milestoneTarget })}</span>
                <span>{t('analytics_completed_pct', { percent: statsMetrics.milestonePercent })}</span>
              </div>
              <div className="w-full bg-black h-4 border-2 border-black overflow-hidden p-0.5">
                <div 
                  className="bg-rose-600 h-full transition-all duration-500" 
                  style={{ width: `${statsMetrics.milestonePercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Completion Rate & List Status Progress Bars */}
          <div className="bg-black text-white border-4 border-black p-5 neo-shadow space-y-4">
            <div className="flex items-center justify-between border-b-2 border-white/20 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-400" strokeWidth={3} />
                <h3 className="font-black text-sm uppercase tracking-wider text-white">
                  {t('analytics_completion_title')}
                </h3>
              </div>
              <span className="bg-emerald-400 text-black font-black text-xs px-2.5 py-0.5 border border-black uppercase font-mono">
                {t('analytics_completed_pct', { percent: statsMetrics.completionRate })}
              </span>
            </div>

            {/* Main Completion Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-black uppercase">
                <span className="text-emerald-400">{t('analytics_completed_series')}</span>
                <span>{t('analytics_series_ratio', { completed: statsMetrics.completedCount, total: watchlist.length })}</span>
              </div>
              <div className="w-full bg-neutral-900 h-5 border-2 border-white overflow-hidden p-0.5">
                <div 
                  className="bg-emerald-400 h-full transition-all duration-500" 
                  style={{ width: `${statsMetrics.completionRate}%` }}
                />
              </div>
            </div>

            {/* Sub Status Breakdown Bars */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-[10px] font-black uppercase">
              {/* Currently Watching */}
              <div className="bg-neutral-900 border border-white/30 p-2 space-y-1">
                <div className="flex justify-between text-amber-400">
                  <span>{t('watching')}</span>
                  <span>{statsMetrics.watchingCount}</span>
                </div>
                <div className="w-full bg-black h-2 border border-white/20 overflow-hidden">
                  <div className="bg-amber-400 h-full" style={{ width: `${statsMetrics.watchingRate}%` }} />
                </div>
              </div>

              {/* Plan to Watch */}
              <div className="bg-neutral-900 border border-white/30 p-2 space-y-1">
                <div className="flex justify-between text-cyan-400">
                  <span>{t('plan_to_watch')}</span>
                  <span>{statsMetrics.planCount}</span>
                </div>
                <div className="w-full bg-black h-2 border border-white/20 overflow-hidden">
                  <div className="bg-cyan-400 h-full" style={{ width: `${statsMetrics.planRate}%` }} />
                </div>
              </div>

              {/* Dropped */}
              <div className="bg-neutral-900 border border-white/30 p-2 space-y-1">
                <div className="flex justify-between text-rose-400">
                  <span>{t('dropped')}</span>
                  <span>{statsMetrics.dropCount}</span>
                </div>
                <div className="w-full bg-black h-2 border border-white/20 overflow-hidden">
                  <div className="bg-rose-500 h-full" style={{ width: `${statsMetrics.dropRate}%` }} />
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
