import React, { useState } from 'react';
import { 
  Award, Shield, Sparkles, Lock, CheckCircle2, ChevronRight, 
  HelpCircle, Star, Flame, Trophy, Info, X, Zap 
} from 'lucide-react';
import {
  Badge, UserBadgeProgress, LevelInfo,
  evaluateBadges
} from '../../data/badgeData';
import { computeOtakuLevel } from '../../lib/otakuLevel';
import { cn } from '../../lib/utils';
import { useQuizStore } from '../../store/useQuizStore';
import { useToastStore } from '../../store/useToastStore';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import {
  localizeBadgeTitle,
  localizeBadgeDescription,
  localizeBadgeRequirement,
  localizeLevelTitle,
} from '../../lib/badgeLocalization';

interface BadgeShowcaseProps {
  watchlist: any[];
  isOwnProfile: boolean;
  featuredBadgeId?: string;
  onSelectFeaturedBadge?: (badgeId: string) => void;
}

const BADGE_CATEGORY_KEYS: Record<string, string> = {
  izleme: 'badge_cat_watch',
  sosyal: 'badge_cat_social',
  quiz: 'badge_cat_quiz',
  ozel: 'badge_cat_special',
};

export const BadgeShowcase: React.FC<BadgeShowcaseProps> = ({
  watchlist,
  isOwnProfile,
  featuredBadgeId,
  onSelectFeaturedBadge
}) => {
  const { arcadeHighScore, dailyStreak } = useQuizStore();
  const { addToast } = useToastStore();
  const { t } = useAppTranslation();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [onlyUnlocked, setOnlyUnlocked] = useState(false);
  const [selectedBadgeModal, setSelectedBadgeModal] = useState<UserBadgeProgress | null>(null);
  const [isKarmaGuideOpen, setIsKarmaGuideOpen] = useState(false);

  // Calculate Karma and Level (paylaşılan hesap)
  const { karma: totalKarma, levelInfo } = computeOtakuLevel(
    watchlist,
    arcadeHighScore > 0 || dailyStreak > 0,
    arcadeHighScore
  );
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
      addToast(t('badge_set_toast', { title: localizeBadgeTitle(badge.id, badge.titleTr) }), 'success');
      setSelectedBadgeModal(null);
    }
  };

  return (
    <div className="bg-white border-4 border-black neo-shadow p-6 space-y-6">
      {/* Level & XP Banner */}
      <div className="bg-black text-white border-4 border-black p-5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          {/* Level Info */}
          <div className="flex items-center gap-3.5">
            <div 
              className="w-14 h-14 border-2 border-white flex items-center justify-center text-3xl shadow-[3px_3px_0px_0px_#fff] shrink-0"
              style={{ backgroundColor: levelInfo.currentLevel.color }}
            >
              {levelInfo.currentLevel.badge}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white text-black px-1.5 py-0.2">
                  {t('level_label', { level: levelInfo.currentLevel.level })}
                </span>
                <span className="text-xs font-black uppercase text-amber-400">
                  {localizeLevelTitle(levelInfo.currentLevel.level, levelInfo.currentLevel.title)}
                </span>
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-white mt-0.5">
                {totalKarma.toLocaleString()} <span className="text-sm text-neutral-400 font-bold">{t('karma_xp')}</span>
              </h3>
            </div>
          </div>

          {/* Level Perks / Karma Guide Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsKarmaGuideOpen(!isKarmaGuideOpen)}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/40 text-[11px] font-black uppercase flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <HelpCircle size={14} className="text-amber-400" />
              <span>{t('how_karma_earned')}</span>
            </button>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mt-4 pt-4 border-t border-white/20 relative z-10">
          <div className="flex items-center justify-between text-[11px] font-black uppercase mb-1.5">
            <span className="text-neutral-400">
              {t('level_progress', { level: levelInfo.currentLevel.level, percent: levelInfo.progressPercent })}
            </span>
            {levelInfo.nextLevel ? (
              <span className="text-amber-400">
                {t('level_next', { level: levelInfo.nextLevel.level, xp: levelInfo.karmaNeededForNext })}
              </span>
            ) : (
              <span className="text-rose-400">{t('max_level_reached')}</span>
            )}
          </div>

          <div className="w-full h-3 bg-neutral-800 border border-white/40 overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-amber-300 transition-all duration-500"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Karma Earning Guide Dropdown Panel */}
        {isKarmaGuideOpen && (
          <div className="mt-4 p-3.5 bg-neutral-900 border-2 border-amber-400 text-xs font-bold space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-amber-400 font-black uppercase">
              <span className="flex items-center gap-1">
                <Zap size={14} /> {t('karma_rules')}
              </span>
              <button onClick={() => setIsKarmaGuideOpen(false)} className="text-white hover:text-rose-400">
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-neutral-300">
              <div className="p-2 bg-black border border-white/20">
                <span className="text-white font-black block">+15 KARMA</span> {t('karma_rule_add')}
              </div>
              <div className="p-2 bg-black border border-white/20">
                <span className="text-white font-black block">+40 KARMA</span> {t('karma_rule_complete')}
              </div>
              <div className="p-2 bg-black border border-white/20">
                <span className="text-white font-black block">+10 KARMA</span> {t('karma_rule_rate')}
              </div>
              <div className="p-2 bg-black border border-white/20">
                <span className="text-white font-black block">+80 KARMA</span> {t('karma_rule_quiz')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Badges Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-black pb-3">
        <div className="flex items-center gap-2">
          <Award size={22} className="text-rose-600" />
          <h2 className="text-xl font-black uppercase tracking-tight text-black">
            {t('badges_header', { unlocked: unlockedCount, total: badgeProgressList.length })}
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: t('badge_cat_all') },
            { id: 'izleme', label: t('badge_cat_watch') },
            { id: 'sosyal', label: t('badge_cat_social') },
            { id: 'quiz', label: t('badge_cat_quiz') },
            { id: 'ozel', label: t('badge_cat_special') }
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

          <label className="flex items-center gap-1.5 text-[10px] font-black uppercase text-neutral-600 ml-2 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyUnlocked}
              onChange={(e) => setOnlyUnlocked(e.target.checked)}
              className="accent-rose-600 w-3.5 h-3.5"
            />
            <span>{t('earned_badges')}</span>
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
                  <Star size={8} fill="currentColor" /> {t('featured_badge')}
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
                  {localizeBadgeTitle(bp.badge.id, bp.badge.titleTr)}
                </h4>
                <span className="text-[9px] font-mono font-bold text-neutral-500 block">
                  +{bp.badge.karmaReward} XP
                </span>
              </div>

              {/* Status / Progress Indicator */}
              <div className="w-full mt-2 pt-1.5 border-t border-neutral-200">
                {bp.isUnlocked ? (
                  <span className="text-[9px] font-black uppercase text-emerald-600 flex items-center justify-center gap-0.5">
                    <CheckCircle2 size={10} /> {t('badge_earned')}
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

      {/* Badge Detail Modal */}
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
                  {t('badge_category_label', { category: t(BADGE_CATEGORY_KEYS[selectedBadgeModal.badge.category] || 'badge_cat_special') })}
                </span>
                <h3 className="text-xl font-black uppercase tracking-tight text-black mt-1">
                  {localizeBadgeTitle(selectedBadgeModal.badge.id, selectedBadgeModal.badge.titleTr)}
                </h3>
                <span className="text-xs font-bold text-rose-600">
                  +{selectedBadgeModal.badge.karmaReward} KARMA XP
                </span>
              </div>

              <p className="text-xs text-neutral-700 font-bold leading-relaxed px-4">
                {localizeBadgeDescription(selectedBadgeModal.badge.id, selectedBadgeModal.badge.description)}
              </p>

              <div className="w-full p-3 bg-neutral-100 border-2 border-black text-left space-y-1">
                <span className="text-[10px] font-black uppercase text-neutral-500 block">
                  {t('earn_requirement')}
                </span>
                <p className="text-xs font-bold text-black">
                  {localizeBadgeRequirement(selectedBadgeModal.badge.id, selectedBadgeModal.badge.requirement)}
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] font-black uppercase">
                  <span>{t('status_label')}</span>
                  <span className={selectedBadgeModal.isUnlocked ? "text-emerald-600" : "text-neutral-500"}>
                    {selectedBadgeModal.isUnlocked ? t('badge_won_check') : t('completed_percent', { percent: selectedBadgeModal.progressPercent })}
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
                    <span>{t('choose_profile_badge')}</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedBadgeModal(null)}
                  className="px-4 py-2 border-2 border-black font-black text-xs uppercase bg-neutral-200 hover:bg-neutral-300 cursor-pointer"
                >
                  {t('close_label')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
