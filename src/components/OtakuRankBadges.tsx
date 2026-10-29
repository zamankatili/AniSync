import React, { useState, useMemo } from 'react';
import { 
  Award, Shield, Sparkles, Lock, CheckCircle2, ChevronRight, 
  HelpCircle, Star, Flame, Trophy, Info, X, Zap, Crown, Target,
  BookOpen, Tv, Music, Compass
} from 'lucide-react';
import { 
  Badge, UserBadgeProgress, LevelInfo, LEVELS, BADGES,
  getLevelForKarma, evaluateBadges, calculateKarma 
} from '../data/badgeData';
import { cn } from '../lib/utils';
import { useQuizStore } from '../store/useQuizStore';
import { useToastStore } from '../store/useToastStore';

interface OtakuRankBadgesProps {
  watchlist: any[];
  isOwnProfile: boolean;
  featuredBadgeId?: string;
  onSelectFeaturedBadge?: (badgeId: string) => void;
}

export const OtakuRankBadges: React.FC<OtakuRankBadgesProps> = ({
  watchlist,
  isOwnProfile,
  featuredBadgeId,
  onSelectFeaturedBadge
}) => {
  const { arcadeHighScore, dailyStreak } = useQuizStore();
  const { addToast } = useToastStore();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [onlyUnlocked, setOnlyUnlocked] = useState(false);
  const [selectedBadgeModal, setSelectedBadgeModal] = useState<UserBadgeProgress | null>(null);
  const [isRankGuideOpen, setIsRankGuideOpen] = useState(false);

  // Stats calculation
  const completedCount = watchlist.filter(w => w.status === 'completed').length;
  const watchingCount = watchlist.filter(w => w.status === 'watching').length;
  const ratedCount = watchlist.filter(w => (w.userScore || 0) > 0).length;
  const totalEpisodes = watchlist
    .filter(w => w.status === 'completed')
    .reduce((acc, w) => acc + (w.anime?.episodes || w.episodesWatched || 0), 0);

  const totalKarma = calculateKarma(
    watchlist.length,
    completedCount,
    ratedCount,
    totalEpisodes,
    arcadeHighScore > 0 || dailyStreak > 0,
    arcadeHighScore
  );

  const levelInfo = getLevelForKarma(totalKarma);
  const badgeProgressList = evaluateBadges(watchlist, {
    played: arcadeHighScore > 0 || dailyStreak > 0,
    highScore: arcadeHighScore
  });

  const unlockedCount = badgeProgressList.filter(b => b.isUnlocked).length;

  const filteredBadges = badgeProgressList.filter(b => {
    const matchesCat = activeCategory === 'all' || b.badge.category === activeCategory;
    const matchesUnlock = !onlyUnlocked || b.isUnlocked;
    return matchesCat && matchesUnlock;
  });

  const handleSelectFeatured = (badge: Badge) => {
    if (onSelectFeaturedBadge) {
      onSelectFeaturedBadge(badge.id);
      addToast(`"${badge.titleTr}" profil rozetiniz olarak ayarlandı!`, 'success');
      setSelectedBadgeModal(null);
    }
  };

  return (
    <div className="bg-white border-4 border-black neo-shadow p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 border border-black uppercase tracking-wider flex items-center gap-1">
              <Crown size={12} /> OTAKU RANK & BAŞARI SİSTEMİ
            </span>
            <span className="bg-amber-400 text-black font-black text-[10px] px-2 py-0.5 border border-black uppercase">
              SEVİYE {levelInfo.currentLevel.level} / 5
            </span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-black flex items-center gap-2">
            <span>OTAKU DERECESİ VE ROZET VİTRİNİ</span>
          </h2>
        </div>

        <button
          onClick={() => setIsRankGuideOpen(!isRankGuideOpen)}
          className="px-3.5 py-2 bg-black hover:bg-neutral-800 text-amber-400 border-2 border-black font-black text-xs uppercase flex items-center gap-2 transition-transform active:translate-y-0.5 cursor-pointer shadow-[2px_2px_0px_0px_#000]"
        >
          <HelpCircle size={15} />
          <span>{isRankGuideOpen ? "KAPAT" : "RANK TİERLERİ & SİSTEM"}</span>
        </button>
      </div>

      {/* Main Rank Status Dashboard */}
      <div className="bg-black text-white border-4 border-black p-5 relative overflow-hidden neo-shadow-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* Rank Badge & Current Level Title */}
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 border-4 border-white flex items-center justify-center text-4xl shadow-[4px_4px_0px_0px_#fff] shrink-0"
              style={{ backgroundColor: levelInfo.currentLevel.color }}
            >
              {levelInfo.currentLevel.badge}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest bg-amber-400 text-black px-1.5 py-0.2 border border-black">
                  SEVİYE {levelInfo.currentLevel.level}
                </span>
                <span className="text-xs font-black uppercase text-rose-400 tracking-wider">
                  {levelInfo.currentLevel.title}
                </span>
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tight text-white">
                {totalKarma.toLocaleString()} <span className="text-xs text-neutral-400 font-mono">KARMA XP</span>
              </h3>
              <p className="text-[11px] text-neutral-400 font-bold uppercase mt-0.5">
                {unlockedCount} ROZET KAZANILDI • {completedCount} ANİME TAMAMLANDI
              </p>
            </div>
          </div>

          {/* Quick Stats Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="bg-neutral-900 border border-white/20 p-2.5 text-center">
              <span className="text-[9px] font-black text-neutral-400 uppercase block">QUIZ REKORU</span>
              <span className="text-sm font-black text-amber-400 font-mono">{arcadeHighScore} PUAN</span>
            </div>
            <div className="bg-neutral-900 border border-white/20 p-2.5 text-center">
              <span className="text-[9px] font-black text-neutral-400 uppercase block">GÜNLÜK SERİ</span>
              <span className="text-sm font-black text-rose-400 font-mono">{dailyStreak} GÜN</span>
            </div>
            <div className="bg-neutral-900 border border-white/20 p-2.5 text-center col-span-2 sm:col-span-1">
              <span className="text-[9px] font-black text-neutral-400 uppercase block">İZLENEN BÖLÜM</span>
              <span className="text-sm font-black text-cyan-400 font-mono">{totalEpisodes} BÖLÜM</span>
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-5 pt-4 border-t-2 border-white/20 relative z-10">
          <div className="flex items-center justify-between text-[11px] font-black uppercase mb-1.5">
            <span className="text-neutral-300">
              {levelInfo.currentLevel.title} İLERLEMESİ (%{levelInfo.progressPercent})
            </span>
            {levelInfo.nextLevel ? (
              <span className="text-amber-400 font-mono">
                Sonraki Rank &apos;e {levelInfo.karmaNeededForNext} XP kaldı →
              </span>
            ) : (
              <span className="text-rose-400 font-black">ZİRVEDESİN (MAKSİMUM UNVAN ERİŞİLDİ) 👑</span>
            )}
          </div>

          <div className="w-full h-3.5 bg-neutral-900 border-2 border-white overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-amber-300 transition-all duration-500"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Rank Tier Guide Modal / Dropdown */}
      {isRankGuideOpen && (
        <div className="p-4 bg-amber-50 border-4 border-black space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h4 className="font-black text-sm uppercase text-black flex items-center gap-1.5">
              <Crown size={16} className="text-rose-600" />
              OTAKU DERECE (RANK) KADEMELERİ VE UNVANLAR
            </h4>
            <button onClick={() => setIsRankGuideOpen(false)} className="p-1 hover:bg-neutral-200 border border-black cursor-pointer">
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {LEVELS.map((lvl) => {
              const isCurrent = levelInfo.currentLevel.level === lvl.level;
              return (
                <div 
                  key={lvl.level}
                  className={cn(
                    "p-3 border-2 border-black flex flex-col justify-between text-center relative",
                    isCurrent ? "bg-black text-white neo-shadow" : "bg-white text-black opacity-85"
                  )}
                >
                  {isCurrent && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-black font-black text-[8px] px-1.5 border border-black uppercase">
                      SENİN DERECEN
                    </span>
                  )}
                  <div className="text-2xl mb-1">{lvl.badge}</div>
                  <div className="font-black text-xs uppercase mb-1">{lvl.title}</div>
                  <div className="text-[10px] font-mono font-bold opacity-80">
                    {lvl.minKarma} - {lvl.maxKarma > 9999 ? '∞' : lvl.maxKarma} XP
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Badges Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
        <div className="flex items-center gap-2">
          <Award size={20} className="text-rose-600" />
          <h3 className="font-black text-lg uppercase text-black">
            KAZANILABİLİR BAŞARI ROZETLERİ ({unlockedCount}/{badgeProgressList.length})
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'TÜMÜ' },
            { id: 'izleme', label: 'İZLEME' },
            { id: 'sosyal', label: 'SOSYAL' },
            { id: 'quiz', label: 'QUİZ' },
            { id: 'ozel', label: 'ÖZEL' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-2.5 py-1 text-[10px] font-black uppercase border border-black transition-colors cursor-pointer",
                activeCategory === cat.id
                  ? "bg-black text-amber-400 shadow-[1px_1px_0px_0px_#000]"
                  : "bg-neutral-100 hover:bg-neutral-200 text-black"
              )}
            >
              {cat.label}
            </button>
          ))}

          <label className="flex items-center gap-1.5 text-[10px] font-black uppercase text-neutral-700 ml-2 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyUnlocked}
              onChange={(e) => setOnlyUnlocked(e.target.checked)}
              className="accent-rose-600 w-3.5 h-3.5"
            />
            <span>Kazanılanlar</span>
          </label>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredBadges.map((bp) => {
          const isFeatured = featuredBadgeId === bp.badge.id;
          return (
            <div
              key={bp.badge.id}
              onClick={() => setSelectedBadgeModal(bp)}
              className={cn(
                "p-3 border-2 border-black flex flex-col items-center text-center justify-between transition-all cursor-pointer relative group",
                bp.isUnlocked
                  ? "bg-white hover:bg-amber-50 neo-shadow hover:translate-x-0.5 hover:-translate-y-0.5"
                  : "bg-neutral-100 opacity-60 hover:opacity-85"
              )}
            >
              {/* Featured Crown Tag */}
              {isFeatured && (
                <div className="absolute top-1 right-1 bg-amber-400 text-black text-[8px] font-black px-1 border border-black flex items-center gap-0.5">
                  <Star size={8} fill="currentColor" /> VİTRİN
                </div>
              )}

              {/* Icon Circle */}
              <div 
                className={cn(
                  "w-12 h-12 rounded-full border-2 border-black flex items-center justify-center text-2xl mb-2 mt-1 transition-transform group-hover:scale-110 shadow-[2px_2px_0px_0px_#000]",
                  bp.isUnlocked ? "bg-white" : "bg-neutral-200 grayscale"
                )}
                style={{ borderColor: bp.isUnlocked ? bp.badge.color : '#000' }}
              >
                {bp.isUnlocked ? bp.badge.icon : <Lock size={18} className="text-neutral-500" />}
              </div>

              {/* Title & XP */}
              <div className="w-full">
                <h4 className="font-black text-xs uppercase text-black truncate">
                  {bp.badge.titleTr}
                </h4>
                <span className="text-[9px] font-mono font-bold text-neutral-500 block">
                  +{bp.badge.karmaReward} XP
                </span>
              </div>

              {/* Status Indicator */}
              <div className="w-full mt-2 pt-1.5 border-t border-neutral-200">
                {bp.isUnlocked ? (
                  <span className="text-[9px] font-black uppercase text-emerald-600 flex items-center justify-center gap-0.5">
                    <CheckCircle2 size={10} /> KAZANILDI
                  </span>
                ) : (
                  <div className="space-y-0.5">
                    <div className="w-full h-1.5 bg-neutral-200 border border-black/40 overflow-hidden">
                      <div 
                        className="h-full bg-rose-500" 
                        style={{ width: `${bp.progressPercent}%` }} 
                      />
                    </div>
                    <span className="text-[8px] font-bold text-neutral-500 block">
                      %{bp.progressPercent}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Badge Modal */}
      {selectedBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white border-4 border-black neo-shadow p-6 relative">
            <button
              onClick={() => setSelectedBadgeModal(null)}
              className="absolute top-3 right-3 p-1 hover:bg-neutral-100 border border-black cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col items-center text-center space-y-3">
              <div 
                className={cn(
                  "w-20 h-20 rounded-full border-4 border-black flex items-center justify-center text-4xl shadow-[4px_4px_0px_0px_#000]",
                  selectedBadgeModal.isUnlocked ? "bg-amber-100" : "bg-neutral-200 grayscale"
                )}
                style={{ borderColor: selectedBadgeModal.badge.color }}
              >
                {selectedBadgeModal.badge.icon}
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border border-black bg-neutral-100 text-black">
                  {selectedBadgeModal.badge.category.toUpperCase()} ROZETİ
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight text-black mt-1">
                  {selectedBadgeModal.badge.titleTr}
                </h3>
                <span className="text-xs font-bold text-rose-600 font-mono">
                  +{selectedBadgeModal.badge.karmaReward} KARMA XP
                </span>
              </div>

              <p className="text-xs text-neutral-700 font-bold leading-relaxed px-4">
                {selectedBadgeModal.badge.description}
              </p>

              <div className="w-full p-3 bg-neutral-100 border-2 border-black text-left space-y-1">
                <span className="text-[10px] font-black uppercase text-neutral-500 block">
                  KAZANMA ŞARTI:
                </span>
                <p className="text-xs font-bold text-black">
                  {selectedBadgeModal.badge.requirement}
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] font-black uppercase">
                  <span>DURUM:</span>
                  <span className={selectedBadgeModal.isUnlocked ? "text-emerald-600" : "text-neutral-500"}>
                    {selectedBadgeModal.isUnlocked ? "KAZANILDI ✓" : `%${selectedBadgeModal.progressPercent} TAMAMLANDI`}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="w-full flex items-center gap-2 pt-2">
                {isOwnProfile && selectedBadgeModal.isUnlocked && (
                  <button
                    onClick={() => handleSelectFeatured(selectedBadgeModal.badge)}
                    className="flex-1 py-2 bg-amber-400 hover:bg-amber-300 text-black border-2 border-black font-black text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                  >
                    <Star size={14} />
                    <span>PROFİL ROZETİ OLARAK SEÇ</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedBadgeModal(null)}
                  className="px-4 py-2 border-2 border-black font-black text-xs uppercase bg-neutral-200 hover:bg-neutral-300 cursor-pointer"
                >
                  KAPAT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
