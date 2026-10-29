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
import { BarChart3, PieChart as PieChartIcon, Activity, Flame, Award, TrendingUp, Sparkles, Filter } from 'lucide-react';
import { useAppStore } from '../context/AppStore';
import { motion } from 'framer-motion';

const GENRE_COLORS: Record<string, string> = {
  'Aksiyon': '#f43f5e',     // Rose 500
  'Macera': '#f97316',      // Orange 500
  'Fantezi': '#a855f7',     // Purple 500
  'Komedi': '#eab308',      // Amber 500
  'Dram': '#06b6d4',        // Cyan 500
  'Bilim Kurgu': '#3b82f6', // Blue 500
  'Romantik': '#ec4899',    // Pink 500
  'Gizem': '#10b981',      // Emerald 500
  'Slice of Life': '#84cc16' // Lime 500
};

const DEFAULT_GENRE_STATS = [
  { genre: 'Aksiyon', score: 94, count: 420, growth: '+28%', color: '#f43f5e' },
  { genre: 'Fantezi', score: 88, count: 380, growth: '+22%', color: '#a855f7' },
  { genre: 'Dram', score: 76, count: 290, growth: '+15%', color: '#06b6d4' },
  { genre: 'Komedi', score: 72, count: 260, growth: '+12%', color: '#eab308' },
  { genre: 'Macera', score: 68, count: 240, growth: '+18%', color: '#f97316' },
  { genre: 'Bilim Kurgu', score: 58, count: 190, growth: '+8%', color: '#3b82f6' },
  { genre: 'Romantik', score: 52, count: 170, growth: '+14%', color: '#ec4899' },
  { genre: 'Gizem', score: 46, count: 140, growth: '+9%', color: '#10b981' },
];

interface GenreTrendingVisualizationProps {
  onSelectGenre?: (genreId: number) => void;
  selectedGenreId?: number | null;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border-4 border-black p-3 neo-shadow text-black font-black uppercase text-xs space-y-1">
        <div className="flex items-center gap-2 border-b-2 border-black pb-1">
          <span className="w-3 h-3 border border-black inline-block" style={{ backgroundColor: data.color || '#f43f5e' }} />
          <p className="text-sm tracking-tight">{data.genre || data.name}</p>
        </div>
        <p className="text-neutral-700">Etkileşim Endeksi: <span className="text-rose-600 font-extrabold">{data.score || data.value} Pt</span></p>
        {data.count && <p className="text-neutral-600">İzleme Sayısı: {data.count} Bölüm</p>}
        {data.growth && <p className="text-emerald-600">Trend Artışı: {data.growth}</p>}
      </div>
    );
  }
  return null;
};

export const GenreTrendingVisualization: React.FC<GenreTrendingVisualizationProps> = ({
  onSelectGenre,
  selectedGenreId
}) => {
  const { watchlist } = useAppStore();
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'radar'>('bar');
  const [selectedGenreName, setSelectedGenreName] = useState<string | null>(null);

  // Calculate actual genre distribution from user watchlist if available
  const genreData = useMemo(() => {
    if (!watchlist || watchlist.length === 0) {
      return DEFAULT_GENRE_STATS;
    }

    const counts: Record<string, number> = {};
    watchlist.forEach(item => {
      const genres = item.anime?.genres || [];
      genres.forEach(g => {
        const name = g.name;
        counts[name] = (counts[name] || 0) + (item.episodesWatched || 1);
      });
    });

    const entries = Object.entries(counts);
    if (entries.length === 0) return DEFAULT_GENRE_STATS;

    return DEFAULT_GENRE_STATS.map(stat => {
      const userVal = counts[stat.genre] || counts[stat.genre.replace('Aksiyon', 'Action')];
      if (userVal) {
        return {
          ...stat,
          score: Math.min(100, stat.score + userVal * 2),
          count: stat.count + userVal * 5
        };
      }
      return stat;
    });
  }, [watchlist]);

  const topGenre = useMemo(() => {
    return [...genreData].sort((a, b) => b.score - a.score)[0];
  }, [genreData]);

  const totalScoreSum = useMemo(() => {
    return genreData.reduce((acc, curr) => acc + curr.score, 0);
  }, [genreData]);

  return (
    <div className="bg-black border-4 border-black p-6 md:p-8 neo-shadow-white space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-4 border-white/20 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600 text-white text-xs font-black tracking-widest uppercase mb-2 border-2 border-black neo-shadow-white">
            <TrendingUp size={14} />
            CANLI ANİME TÜR ANALİZİ
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">
            POPÜLER TÜR METRİKLERİ
          </h2>
          <p className="text-neutral-400 font-bold text-xs uppercase tracking-wider mt-1">
            Topluluk etkileşimleri ve izleme istatistiklerine göre haftalık trendler
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
            <BarChart3 size={16} /> Çubuk
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-2 transition-all ${
              chartType === 'pie'
                ? 'bg-cyan-600 text-white border-white neo-shadow-white'
                : 'bg-black text-neutral-400 border-transparent hover:text-white'
            }`}
          >
            <PieChartIcon size={16} /> Pasta
          </button>
          <button
            onClick={() => setChartType('radar')}
            className={`px-3 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border-2 transition-all ${
              chartType === 'radar'
                ? 'bg-amber-500 text-black border-white neo-shadow-white'
                : 'bg-black text-neutral-400 border-transparent hover:text-white'
            }`}
          >
            <Activity size={16} /> Radar
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border-2 border-rose-500 p-4 neo-shadow flex items-center gap-4">
          <div className="p-3 bg-rose-600 border-2 border-black text-white">
            <Flame size={24} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">LİDER TÜR</span>
            <h4 className="text-xl font-black uppercase text-white tracking-tight">{topGenre.genre}</h4>
            <p className="text-xs font-bold text-rose-400 uppercase">%{( (topGenre.score / totalScoreSum) * 100 ).toFixed(1)} Pazar Payı</p>
          </div>
        </div>

        <div className="bg-neutral-900 border-2 border-cyan-500 p-4 neo-shadow flex items-center gap-4">
          <div className="p-3 bg-cyan-600 border-2 border-black text-white">
            <Award size={24} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">EN HIZLI YÜKSELEN</span>
            <h4 className="text-xl font-black uppercase text-white tracking-tight">FANTEZİ</h4>
            <p className="text-xs font-bold text-cyan-400 uppercase">+22% Bu Hafta</p>
          </div>
        </div>

        <div className="bg-neutral-900 border-2 border-amber-500 p-4 neo-shadow flex items-center gap-4">
          <div className="p-3 bg-amber-500 border-2 border-black text-black">
            <Sparkles size={24} strokeWidth={2.5} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">TOPLAM ETKİLEŞİM</span>
            <h4 className="text-xl font-black uppercase text-white tracking-tight">2,090+ BÖLÜM</h4>
            <p className="text-xs font-bold text-amber-400 uppercase">Aktif Topluluk Verisi</p>
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
              <Bar 
                dataKey="score" 
                radius={[0, 0, 0, 0]}
                onClick={(data: any) => {
                  if (data && data.genre) setSelectedGenreName(data.genre);
                }}
              >
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
                dataKey="score"
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
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#000000', fontWeight: 700 }} />
              <Radar
                name="Tür Popülerliği"
                dataKey="score"
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
        {genreData.map(item => (
          <button
            key={item.genre}
            onClick={() => setSelectedGenreName(item.genre === selectedGenreName ? null : item.genre)}
            className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-2 transition-all ${
              selectedGenreName === item.genre
                ? 'bg-white text-black border-white neo-shadow-white scale-105'
                : 'bg-neutral-900 text-white border-black hover:border-white'
            }`}
          >
            <span className="w-3 h-3 border border-black" style={{ backgroundColor: item.color }} />
            {item.genre} ({item.score} Pt)
          </button>
        ))}
      </div>
    </div>
  );
};
