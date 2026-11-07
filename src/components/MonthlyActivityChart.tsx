import React, { useState, useMemo } from 'react';
import { WatchlistItem } from '../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  CalendarDays, 
  CheckCircle2, 
  PlayCircle, 
  Film, 
  Sparkles, 
  Flame 
} from 'lucide-react';
import { useAppTranslation } from '../hooks/useAppTranslation';

interface MonthlyActivityChartProps {
  watchlist: WatchlistItem[];
  isOwnProfile?: boolean;
}

interface MonthDataPoint {
  key: string;            // e.g. "2026-10"
  label: string;          // e.g. "Eki '26"
  fullLabel: string;      // e.g. "Ekim 2026"
  completed: number;      // Completed animes in that month
  watching: number;       // Active / in-progress animes in that month
  total: number;          // Total anime watched/active
  episodes: number;       // Total episodes watched
  animeTitles: string[];  // Sample of titles watched
}

const MONTH_NAMES_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const FULL_MONTHS_TR = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const MonthlyActivityChart: React.FC<MonthlyActivityChartProps> = ({ 
  watchlist, 
  isOwnProfile = true 
}) => {
  const { t } = useAppTranslation();
  const [timeRange, setTimeRange] = useState<'6m' | '12m'>('12m');
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');
  const [useSampleData, setUseSampleData] = useState<boolean>(() => watchlist.length === 0);

  // Realistic sample historical data if user has an empty or 1-day list
  const sampleHistoricalData = useMemo(() => {
    return [
      { offset: 11, completed: 3, watching: 1, episodes: 42, titles: ['Sousou no Frieren', 'Jujutsu Kaisen S2'] },
      { offset: 10, completed: 4, watching: 2, episodes: 56, titles: ['Vinland Saga S2', 'Chainsaw Man'] },
      { offset: 9, completed: 2, watching: 2, episodes: 30, titles: ['Cyberpunk: Edgerunners', 'Bocchi the Rock!'] },
      { offset: 8, completed: 5, watching: 1, episodes: 64, titles: ['Attack on Titan Final', 'Oshi no Ko'] },
      { offset: 7, completed: 3, watching: 3, episodes: 48, titles: ['Solo Leveling', 'Dungeon Meshi'] },
      { offset: 6, completed: 4, watching: 2, episodes: 52, titles: ['Bleach: TYBW', 'Demon Slayer'] },
      { offset: 5, completed: 6, watching: 1, episodes: 78, titles: ['Hunter x Hunter', 'Death Note'] },
      { offset: 4, completed: 3, watching: 2, episodes: 39, titles: ['Spy x Family S2', 'One Punch Man'] },
      { offset: 3, completed: 5, watching: 2, episodes: 68, titles: ['Fullmetal Alchemist: B', 'Mob Psycho 100'] },
      { offset: 2, completed: 4, watching: 3, episodes: 54, titles: ['Steins;Gate', 'Haikyuu!!'] },
      { offset: 1, completed: 6, watching: 2, episodes: 82, titles: ['Blue Lock', 'Kaguya-sama'] },
      { offset: 0, completed: 5, watching: 3, episodes: 70, titles: ['Dandadan', 'Re:Zero S3', 'Tower of God S2'] }
    ];
  }, []);

  // Process months & compute actual data from watchlist
  const chartData = useMemo<MonthDataPoint[]>(() => {
    const monthsCount = timeRange === '6m' ? 6 : 12;
    const now = new Date();
    const result: MonthDataPoint[] = [];

    // Group actual watchlist by "YYYY-MM"
    const actualMonthlyMap: Record<string, { completed: number; watching: number; episodes: number; titles: string[] }> = {};

    watchlist.forEach(item => {
      let itemDate = item.addedAt ? new Date(item.addedAt) : null;
      if (!itemDate || isNaN(itemDate.getTime())) {
        itemDate = now;
      }
      const key = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
      if (!actualMonthlyMap[key]) {
        actualMonthlyMap[key] = { completed: 0, watching: 0, episodes: 0, titles: [] };
      }

      const isCompleted = item.status === 'completed';
      if (isCompleted) {
        actualMonthlyMap[key].completed += 1;
      } else {
        actualMonthlyMap[key].watching += 1;
      }

      actualMonthlyMap[key].episodes += item.episodesWatched || (isCompleted ? (item.anime.episodes || 12) : 1);
      const title = item.anime.title_english || item.anime.title;
      if (title && !actualMonthlyMap[key].titles.includes(title)) {
        actualMonthlyMap[key].titles.push(title);
      }
    });

    const hasActualData = Object.keys(actualMonthlyMap).length > 0;

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthIdx = d.getMonth();
      const key = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
      const shortYear = String(year).slice(-2);
      const label = `${MONTH_NAMES_TR[monthIdx]} '${shortYear}`;
      const fullLabel = `${FULL_MONTHS_TR[monthIdx]} ${year}`;

      if (useSampleData || !hasActualData) {
        // Use realistic distributed sample data
        const sample = sampleHistoricalData.find(s => s.offset === i) || {
          completed: 2 + (i % 3),
          watching: 1 + (i % 2),
          episodes: 25 + (i * 4),
          titles: ['Anime #' + i]
        };
        result.push({
          key,
          label,
          fullLabel,
          completed: sample.completed,
          watching: sample.watching,
          total: sample.completed + sample.watching,
          episodes: sample.episodes,
          animeTitles: sample.titles
        });
      } else {
        const actual = actualMonthlyMap[key] || { completed: 0, watching: 0, episodes: 0, titles: [] };
        result.push({
          key,
          label,
          fullLabel,
          completed: actual.completed,
          watching: actual.watching,
          total: actual.completed + actual.watching,
          episodes: actual.episodes,
          animeTitles: actual.titles
        });
      }
    }

    return result;
  }, [watchlist, timeRange, useSampleData, sampleHistoricalData]);

  // Aggregate stats
  const totalCompleted = chartData.reduce((acc, d) => acc + d.completed, 0);
  const totalWatching = chartData.reduce((acc, d) => acc + d.watching, 0);
  const totalWatchedAnime = chartData.reduce((acc, d) => acc + d.total, 0);
  const totalEpisodes = chartData.reduce((acc, d) => acc + d.episodes, 0);
  const monthlyAvg = chartData.length > 0 ? (totalWatchedAnime / chartData.length).toFixed(1) : '0';

  const peakMonth = useMemo(() => {
    if (chartData.length === 0) return { label: '-', value: 0 };
    let max = chartData[0];
    chartData.forEach(d => {
      if (d.total > max.total) max = d;
    });
    return { label: max.fullLabel, value: max.total };
  }, [chartData]);

  // Custom Neo-Brutalist Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = chartData.find(d => d.label === label);
      return (
        <div className="bg-black border-4 border-rose-500 p-4 neo-shadow text-white min-w-[210px] z-50">
          <div className="flex items-center justify-between border-b-2 border-white/20 pb-2 mb-2.5">
            <span className="font-black text-rose-400 text-sm uppercase tracking-wider">
              {dataPoint?.fullLabel || label}
            </span>
            <span className="bg-white text-black text-[10px] font-black px-1.5 py-0.5 border border-black uppercase">
              {dataPoint?.total || 0} Anime
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-bold">
            <div className="flex items-center justify-between text-rose-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-rose-500 border border-black inline-block" />
                Tamamlanan:
              </span>
              <span className="font-black text-white">{dataPoint?.completed || 0}</span>
            </div>

            <div className="flex items-center justify-between text-amber-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-amber-400 border border-black inline-block" />
                İzleniyor:
              </span>
              <span className="font-black text-white">{dataPoint?.watching || 0}</span>
            </div>

            <div className="flex items-center justify-between text-cyan-300 pt-1 border-t border-white/10">
              <span className="flex items-center gap-1.5">
                <Film size={12} strokeWidth={2.5} />
                Toplam Bölüm:
              </span>
              <span className="font-black text-white">{dataPoint?.episodes || 0} Bölüm</span>
            </div>
          </div>

          {dataPoint && dataPoint.animeTitles.length > 0 && (
            <div className="mt-3 pt-2 border-t border-white/20">
              <div className="text-[10px] text-white/50 uppercase font-black tracking-widest mb-1">
                İzlenen Başlıklar:
              </div>
              <div className="space-y-0.5">
                {dataPoint.animeTitles.slice(0, 3).map((title, idx) => (
                  <div key={idx} className="text-[11px] font-bold text-neutral-200 truncate">
                    • {title}
                  </div>
                ))}
                {dataPoint.animeTitles.length > 3 && (
                  <div className="text-[10px] text-rose-400 font-black">
                    +{dataPoint.animeTitles.length - 3} anime daha
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border-4 border-black p-6 md:p-8 neo-shadow relative overflow-hidden">
      {/* Background watermark */}
      <div className="absolute -right-8 -bottom-10 opacity-5 pointer-events-none text-black">
        <TrendingUp size={260} strokeWidth={1.5} />
      </div>

      {/* Top Header & Interactive Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10 border-b-4 border-black pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-4 border-black bg-rose-500 text-white flex items-center justify-center neo-shadow">
              <CalendarDays size={20} strokeWidth={3} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-black uppercase tracking-tight">
                {t('monthly_activity', 'Aylık Aktivite Takibi')}
              </h2>
              <p className="text-xs text-black/60 font-bold uppercase tracking-wider mt-0.5">
                {t('monthly_activity_desc', 'Aylara göre izlenen anime ve bölüm sayılarının görsel dökümü')}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sample / Real Data Toggle */}
          <button
            onClick={() => setUseSampleData(!useSampleData)}
            title={useSampleData ? "Kendi verilerine geç" : "Örnek verilerle grafiği test et"}
            className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider border-2 border-black transition-colors flex items-center gap-1.5 ${
              useSampleData 
                ? 'bg-amber-400 text-black shadow-[2px_2px_0px_0px_#000]' 
                : 'bg-white hover:bg-neutral-100 text-black shadow-[2px_2px_0px_0px_#000]'
            }`}
          >
            <Sparkles size={13} strokeWidth={2.5} />
            {useSampleData ? t('view_real_data', 'Örnek Mod Aktif') : t('view_demo_data', 'Örnek Görünüm')}
          </button>

          {/* Time range: 6m vs 12m */}
          <div className="flex border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000]">
            <button
              onClick={() => setTimeRange('6m')}
              className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-colors ${
                timeRange === '6m' ? 'bg-black text-white' : 'text-black hover:bg-neutral-100'
              }`}
            >
              {t('last_6_months', 'Son 6 Ay')}
            </button>
            <button
              onClick={() => setTimeRange('12m')}
              className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-colors border-l-2 border-black ${
                timeRange === '12m' ? 'bg-black text-white' : 'text-black hover:bg-neutral-100'
              }`}
            >
              {t('last_12_months', 'Son 12 Ay')}
            </button>
          </div>

          {/* Chart Type: Bar vs Area */}
          <div className="flex border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000]">
            <button
              onClick={() => setChartType('bar')}
              title="Sütun Grafiği"
              className={`p-1.5 text-xs font-black uppercase transition-colors ${
                chartType === 'bar' ? 'bg-rose-500 text-white' : 'text-black hover:bg-neutral-100'
              }`}
            >
              <BarChart3 size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => setChartType('area')}
              title="Alan Grafiği"
              className={`p-1.5 text-xs font-black uppercase transition-colors border-l-2 border-black ${
                chartType === 'area' ? 'bg-rose-500 text-white' : 'text-black hover:bg-neutral-100'
              }`}
            >
              <TrendingUp size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative z-10">
        <div className="border-2 border-black p-3.5 bg-neutral-50 shadow-[3px_3px_0px_0px_#000]">
          <div className="text-[10px] font-black text-black/60 uppercase tracking-widest flex items-center gap-1 mb-1">
            <Film size={12} strokeWidth={2.5} className="text-rose-500" />
            {t('total_period_anime', 'İzlenen Anime')}
          </div>
          <div className="text-2xl font-black text-black uppercase tracking-tight">
            {totalWatchedAnime} <span className="text-xs font-bold text-black/60">SERİ</span>
          </div>
        </div>

        <div className="border-2 border-black p-3.5 bg-neutral-50 shadow-[3px_3px_0px_0px_#000]">
          <div className="text-[10px] font-black text-black/60 uppercase tracking-widest flex items-center gap-1 mb-1">
            <CheckCircle2 size={12} strokeWidth={2.5} className="text-emerald-600" />
            {t('completed_anime', 'Tamamlanan')}
          </div>
          <div className="text-2xl font-black text-black uppercase tracking-tight">
            {totalCompleted} <span className="text-xs font-bold text-black/60">({totalWatching} AKTİF)</span>
          </div>
        </div>

        <div className="border-2 border-black p-3.5 bg-neutral-50 shadow-[3px_3px_0px_0px_#000]">
          <div className="text-[10px] font-black text-black/60 uppercase tracking-widest flex items-center gap-1 mb-1">
            <Flame size={12} strokeWidth={2.5} className="text-amber-500" />
            {t('peak_month', 'En Aktif Ay')}
          </div>
          <div className="text-lg font-black text-black uppercase tracking-tight truncate" title={peakMonth.label}>
            {peakMonth.label} <span className="text-xs text-rose-500">({peakMonth.value})</span>
          </div>
        </div>

        <div className="border-2 border-black p-3.5 bg-neutral-50 shadow-[3px_3px_0px_0px_#000]">
          <div className="text-[10px] font-black text-black/60 uppercase tracking-widest flex items-center gap-1 mb-1">
            <TrendingUp size={12} strokeWidth={2.5} className="text-blue-600" />
            {t('monthly_avg', 'Aylık Ortalama')}
          </div>
          <div className="text-2xl font-black text-black uppercase tracking-tight">
            {monthlyAvg} <span className="text-xs font-bold text-black/60">ANİME/AY</span>
          </div>
        </div>
      </div>

      {/* Recharts Visualization */}
      <div className="h-72 sm:h-80 w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 10, left: -15, bottom: 5 }}
            >
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="label" 
                stroke="#000000" 
                tick={{ fill: '#000000', fontWeight: 900, fontSize: 11 }}
                tickLine={{ stroke: '#000000', strokeWidth: 2 }}
                axisLine={{ stroke: '#000000', strokeWidth: 2 }}
              />
              <YAxis 
                stroke="#000000" 
                tick={{ fill: '#000000', fontWeight: 900, fontSize: 11 }}
                tickLine={{ stroke: '#000000', strokeWidth: 2 }}
                axisLine={{ stroke: '#000000', strokeWidth: 2 }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '16px', fontWeight: '900', fontSize: '11px', textTransform: 'uppercase' }}
              />
              <Bar 
                dataKey="completed" 
                name="Tamamlanan Anime" 
                fill="#f43f5e" 
                stroke="#000000" 
                strokeWidth={2}
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="watching" 
                name="İzlenmekte Olan" 
                fill="#fbbf24" 
                stroke="#000000" 
                strokeWidth={2}
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          ) : (
            <AreaChart
              data={chartData}
              margin={{ top: 15, right: 10, left: -15, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorWatching" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="label" 
                stroke="#000000" 
                tick={{ fill: '#000000', fontWeight: 900, fontSize: 11 }}
                tickLine={{ stroke: '#000000', strokeWidth: 2 }}
                axisLine={{ stroke: '#000000', strokeWidth: 2 }}
              />
              <YAxis 
                stroke="#000000" 
                tick={{ fill: '#000000', fontWeight: 900, fontSize: 11 }}
                tickLine={{ stroke: '#000000', strokeWidth: 2 }}
                axisLine={{ stroke: '#000000', strokeWidth: 2 }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '16px', fontWeight: '900', fontSize: '11px', textTransform: 'uppercase' }}
              />
              <Area 
                type="monotone" 
                dataKey="completed" 
                name="Tamamlanan Anime" 
                stroke="#f43f5e" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorCompleted)" 
              />
              <Area 
                type="monotone" 
                dataKey="watching" 
                name="İzlenmekte Olan" 
                stroke="#d97706" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorWatching)" 
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Bottom Info Footer */}
      <div className="mt-4 pt-3 border-t-2 border-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] font-bold text-black/60 uppercase">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Toplam {totalEpisodes} bölüm loglandı</span>
        </div>
        <div className="text-black/50">
          İzleme listesi ve bölüm ilerlemelerine göre otomatik hesaplanır
        </div>
      </div>
    </div>
  );
};
