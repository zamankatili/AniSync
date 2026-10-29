import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { WatchlistItem, WatchStatus } from '../types';
import { PieChart as PieChartIcon, CheckCircle2, PlaySquare, XCircle, Clock, Film, Award, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface MyListStatusDonutChartProps {
  watchlist: WatchlistItem[];
  activeTab: WatchStatus;
  onSelectStatus: (status: WatchStatus) => void;
}

interface StatusStat {
  key: WatchStatus;
  name: string;
  value: number;
  color: string;
  badgeBg: string;
  badgeText: string;
  icon: React.FC<any>;
  description: string;
}

const STATUS_CONFIG: Record<string, { name: string; color: string; badgeBg: string; badgeText: string; icon: React.FC<any>; description: string }> = {
  completed: {
    name: 'Tamamlandı',
    color: '#10b981', // Emerald 500
    badgeBg: 'bg-emerald-500',
    badgeText: 'text-black',
    icon: CheckCircle2,
    description: 'Tüm bölümleri izlenip bitirilen seriler'
  },
  watching: {
    name: 'İzleniyor',
    color: '#06b6d4', // Cyan 500
    badgeBg: 'bg-cyan-500',
    badgeText: 'text-black',
    icon: PlaySquare,
    description: 'Şu an aktif takip edilen seriler'
  },
  dropped: {
    name: 'Bırakıldı',
    color: '#f43f5e', // Rose 500
    badgeBg: 'bg-rose-500',
    badgeText: 'text-white',
    icon: XCircle,
    description: 'İzlenmekten vazgeçilen seriler'
  },
  plan_to_watch: {
    name: 'İzlenecek',
    color: '#f59e0b', // Amber 500
    badgeBg: 'bg-amber-500',
    badgeText: 'text-black',
    icon: Clock,
    description: 'Listeye eklenip sırasını bekleyenler'
  }
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border-4 border-black p-3 neo-shadow text-black font-black uppercase text-xs space-y-1">
        <div className="flex items-center gap-2 border-b-2 border-black pb-1">
          <span className="w-3.5 h-3.5 border border-black inline-block" style={{ backgroundColor: data.color }} />
          <span className="text-sm tracking-tight">{data.name}</span>
        </div>
        <p className="text-neutral-700">Seri Sayısı: <span className="font-extrabold text-black">{data.value} Anime</span></p>
        <p className="text-neutral-600">Yüzde Payı: <span className="font-extrabold text-rose-600">%{data.percent?.toFixed(1) || 0}</span></p>
      </div>
    );
  }
  return null;
};

export const MyListStatusDonutChart: React.FC<MyListStatusDonutChartProps> = ({
  watchlist,
  activeTab,
  onSelectStatus
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Focus specifically on the 3 core requested statuses: completed, watching, dropped
  // (also including plan_to_watch if user has them to keep total accurate)
  const { chartData, totalItems, completedCount, watchingCount, droppedCount, totalEpisodes } = useMemo(() => {
    const counts: Record<string, number> = {
      completed: 0,
      watching: 0,
      dropped: 0,
      plan_to_watch: 0
    };

    let eps = 0;
    watchlist.forEach(item => {
      if (counts[item.status] !== undefined) {
        counts[item.status]++;
      }
      eps += item.episodesWatched || 0;
    });

    const relevantStatuses: WatchStatus[] = ['completed', 'watching', 'dropped', 'plan_to_watch'];
    const sum = counts.completed + counts.watching + counts.dropped + counts.plan_to_watch;

    // If list is completely empty, provide an instructional preview so chart is never a blank broken circle
    if (sum === 0) {
      const demoData: StatusStat[] = [
        { key: 'completed', name: 'Tamamlandı (Örnek)', value: 4, color: '#10b981', badgeBg: 'bg-emerald-500', badgeText: 'text-black', icon: CheckCircle2, description: 'Örnek dağılım' },
        { key: 'watching', name: 'İzleniyor (Örnek)', value: 2, color: '#06b6d4', badgeBg: 'bg-cyan-500', badgeText: 'text-black', icon: PlaySquare, description: 'Örnek dağılım' },
        { key: 'dropped', name: 'Bırakıldı (Örnek)', value: 1, color: '#f43f5e', badgeBg: 'bg-rose-500', badgeText: 'text-white', icon: XCircle, description: 'Örnek dağılım' },
      ];
      return {
        chartData: demoData.map(d => ({ ...d, percent: (d.value / 7) * 100 })),
        totalItems: 0,
        completedCount: 0,
        watchingCount: 0,
        droppedCount: 0,
        totalEpisodes: 0
      };
    }

    const data: StatusStat[] = relevantStatuses
      .filter(status => counts[status] > 0)
      .map(status => {
        const conf = STATUS_CONFIG[status];
        return {
          key: status,
          name: conf.name,
          value: counts[status],
          color: conf.color,
          badgeBg: conf.badgeBg,
          badgeText: conf.badgeText,
          icon: conf.icon,
          description: conf.description
        };
      });

    return {
      chartData: data.map(d => ({ ...d, percent: (d.value / sum) * 100 })),
      totalItems: sum,
      completedCount: counts.completed,
      watchingCount: counts.watching,
      droppedCount: counts.dropped,
      totalEpisodes: eps
    };
  }, [watchlist]);

  const activeStat = hoveredIndex !== null && chartData[hoveredIndex] 
    ? chartData[hoveredIndex] 
    : chartData.find(d => d.key === activeTab) || chartData[0];

  return (
    <div className="bg-black border-4 border-black p-6 md:p-8 neo-shadow-white space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-white/20 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-black text-xs font-black tracking-widest uppercase mb-2 border-2 border-black neo-shadow-white">
            <PieChartIcon size={14} />
            İSTATİSTİK & DURUM GRAFİĞİ
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">
            LİSTE DURUM DAĞILIMI (DONUT)
          </h3>
          <p className="text-neutral-400 font-bold text-xs uppercase tracking-wider mt-1">
            Tamamlanan, izlenen ve bırakılan serilerin görsel dökümü
          </p>
        </div>

        {totalItems === 0 && (
          <span className="px-3 py-1 bg-amber-400 text-black font-black text-[11px] uppercase border-2 border-black neo-shadow-white">
            Önizleme Modu (Listen Boş)
          </span>
        )}
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completed KPI */}
        <button
          onClick={() => onSelectStatus('completed')}
          className={`p-4 border-4 text-left transition-all ${
            activeTab === 'completed' 
              ? 'bg-emerald-500 text-black border-white neo-shadow-white' 
              : 'bg-neutral-900 text-white border-emerald-500/50 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest">TAMAMLANDI</span>
            <CheckCircle2 size={16} />
          </div>
          <div className="text-2xl md:text-3xl font-black tracking-tight">{completedCount} SERİ</div>
          <p className={`text-[11px] font-bold uppercase mt-1 ${activeTab === 'completed' ? 'text-black' : 'text-emerald-400'}`}>
            {totalItems > 0 ? `%${((completedCount / totalItems) * 100).toFixed(0)} Oran` : '0 Seri'}
          </p>
        </button>

        {/* Watching KPI */}
        <button
          onClick={() => onSelectStatus('watching')}
          className={`p-4 border-4 text-left transition-all ${
            activeTab === 'watching' 
              ? 'bg-cyan-500 text-black border-white neo-shadow-white' 
              : 'bg-neutral-900 text-white border-cyan-500/50 hover:border-cyan-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest">İZLENİYOR</span>
            <PlaySquare size={16} />
          </div>
          <div className="text-2xl md:text-3xl font-black tracking-tight">{watchingCount} SERİ</div>
          <p className={`text-[11px] font-bold uppercase mt-1 ${activeTab === 'watching' ? 'text-black' : 'text-cyan-400'}`}>
            {totalItems > 0 ? `%${((watchingCount / totalItems) * 100).toFixed(0)} Oran` : '0 Seri'}
          </p>
        </button>

        {/* Dropped KPI */}
        <button
          onClick={() => onSelectStatus('dropped')}
          className={`p-4 border-4 text-left transition-all ${
            activeTab === 'dropped' 
              ? 'bg-rose-500 text-white border-white neo-shadow-white' 
              : 'bg-neutral-900 text-white border-rose-500/50 hover:border-rose-400'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest">BIRAKILDI</span>
            <XCircle size={16} />
          </div>
          <div className="text-2xl md:text-3xl font-black tracking-tight">{droppedCount} SERİ</div>
          <p className={`text-[11px] font-bold uppercase mt-1 ${activeTab === 'dropped' ? 'text-white' : 'text-rose-400'}`}>
            {totalItems > 0 ? `%${((droppedCount / totalItems) * 100).toFixed(0)} Drop Oranı` : '0 Seri'}
          </p>
        </button>

        {/* Total Stats KPI */}
        <div className="p-4 border-4 bg-neutral-900 border-white text-white text-left">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">TOPLAM İZLENEN</span>
            <Film size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl md:text-3xl font-black tracking-tight text-white">{totalEpisodes} BÖLÜM</div>
          <p className="text-[11px] font-bold uppercase text-amber-400 mt-1">
            {totalItems} Toplam Seri
          </p>
        </div>
      </div>

      {/* Donut Chart Visual & Interactive Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Donut Canvas (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-white border-4 border-black p-4 neo-shadow relative h-[300px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={105}
                paddingAngle={4}
                stroke="#000000"
                strokeWidth={3}
                onMouseEnter={(_, index) => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={(entry: any) => {
                  const targetKey = entry?.payload?.key || entry?.key;
                  if (targetKey) {
                    onSelectStatus(targetKey as WatchStatus);
                  }
                }}
              >
                {chartData.map((entry, index) => {
                  const isSelected = entry.key === activeTab;
                  return (
                    <Cell
                      key={`donut-cell-${index}`}
                      fill={entry.color}
                      stroke="#000000"
                      strokeWidth={isSelected ? 5 : 3}
                      className="cursor-pointer transition-transform hover:opacity-90"
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text of the Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-3xl md:text-4xl font-black text-black tracking-tighter">
              {totalItems > 0 ? totalItems : 0}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600">
              TOPLAM ANİME
            </span>
          </div>
        </div>

        {/* Legend & Details (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-neutral-900 border-2 border-white/20 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/20 pb-2">
              <span className="text-xs font-black uppercase text-neutral-400">SEÇİLİ DURUM ANALİZİ</span>
              {activeStat && (
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 border border-black ${activeStat.badgeBg} ${activeStat.badgeText}`}>
                  %{activeStat.percent?.toFixed(1) || 0}
                </span>
              )}
            </div>

            {activeStat && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border border-black" style={{ backgroundColor: activeStat.color }} />
                  <h4 className="text-xl font-black text-white uppercase tracking-tight">{activeStat.name}</h4>
                </div>
                <p className="text-xs text-neutral-300 font-bold leading-relaxed">
                  {activeStat.description}
                </p>
                <div className="pt-2 flex items-center justify-between text-xs text-neutral-400 font-black border-t border-white/10">
                  <span>Bu Durumdaki Seriler:</span>
                  <span className="text-white text-sm">{activeStat.value} Adet</span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Status Switcher Buttons */}
          <div className="flex flex-col gap-2">
            {chartData.map((stat) => {
              const isSelected = activeTab === stat.key;
              const Icon = stat.icon;
              return (
                <button
                  key={stat.key}
                  onClick={() => onSelectStatus(stat.key)}
                  className={`flex items-center justify-between px-4 py-2.5 border-2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-black border-white neo-shadow-white translate-x-1'
                      : 'bg-black text-neutral-300 border-white/20 hover:border-white hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 border border-black" style={{ backgroundColor: stat.color }} />
                    <Icon size={14} />
                    <span>{stat.name}</span>
                  </div>
                  <span className={`text-[11px] px-1.5 py-0.5 border border-black ${stat.badgeBg} ${stat.badgeText}`}>
                    {stat.value}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
