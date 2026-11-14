import { useMemo, useState } from 'react';
import {
  BookOpen, Search, ExternalLink, Eye, EyeOff, Sparkles, RefreshCw, X,
} from 'lucide-react';
import { PageMeta } from '../components/PageMeta';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { cn } from '../lib/utils';
import {
  FAN_LORE,
  LORE_CATEGORIES,
  filterLore,
  type FanLoreEntry,
  type LoreCategory,
} from '../data/fanLore';
import { AnimeNewsFeed } from '../components/AnimeNewsFeed';
import { useXpStore } from '../store/useXpStore';
import { useToastStore } from '../store/useToastStore';
import { getDailyDateKey } from '../lib/dailyDate';
import type { Lang4 } from '../data/universePaths';

const catLabelKey: Record<LoreCategory, string> = {
  character: 'lore_filter_character',
  world: 'lore_filter_world',
  series: 'lore_filter_series',
  industry: 'lore_filter_industry',
};

const catAccent: Record<LoreCategory, string> = {
  character: 'text-rose-400 border-rose-400/50 bg-rose-400/10',
  world: 'text-cyan-400 border-cyan-400/50 bg-cyan-400/10',
  series: 'text-amber-400 border-amber-400/50 bg-amber-400/10',
  industry: 'text-emerald-400 border-emerald-400/50 bg-emerald-400/10',
};

const pickLang = (value: Record<Lang4, string>, lang: Lang4): string => value[lang] || value.en;

export const FanLore = () => {
  const { t, currentLang } = useAppTranslation();
  const { addToast } = useToastStore();
  const award = useXpStore((state) => state.award);
  const base = (currentLang.slice(0, 2) as Lang4);
  const lang: Lang4 = (['tr', 'en', 'ja', 'fr'] as const).includes(base) ? base : 'en';

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<LoreCategory | 'all'>('all');
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const entries = useMemo(() => filterLore({ query, category }), [query, category]);

  const toggleReveal = (id: string) => {
    const revealing = !revealed.has(id);
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    // XP: merak ettiğin cevabı günlük ilk kez açmanın ödülü (6/gün tavan)
    if (revealing) {
      const result = award({ action: 'lore_read', key: `lore:${id}:${getDailyDateKey()}` });
      if (result.awarded > 0) {
        addToast(t('xp_award_toast', { xp: result.awarded }), 'success');
      }
    }
  };

  const resetFilters = () => {
    setQuery('');
    setCategory('all');
    setShowSpoilers(false);
  };

  const answerVisible = (entry: FanLoreEntry) =>
    !entry.spoiler || showSpoilers || revealed.has(entry.id);

  return (
    <div className="min-h-full bg-black text-white p-4 md:p-8">
      <PageMeta title={`${t('lore_title')} | AniSync`} description={t('lore_desc')} />

      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="border-4 border-white bg-neutral-950 p-5 md:p-8 neo-shadow-white">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 border-4 border-black bg-amber-400 flex items-center justify-center shrink-0">
              <BookOpen size={24} className="text-black" strokeWidth={3} />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-amber-400">{t('lore_badge')}</p>
              <h1 className="font-serif font-black text-4xl md:text-6xl leading-[0.95] mt-1">
                {t('lore_title')}
              </h1>
            </div>
          </div>
          <p className="mt-4 text-sm md:text-base font-bold text-neutral-300 max-w-2xl leading-snug">
            {t('lore_desc')}
          </p>
          <p className="mt-3 text-[10px] md:text-[11px] font-mono uppercase tracking-wide text-neutral-500 max-w-2xl leading-relaxed">
            {t('lore_curated_notice')}
          </p>
        </div>

        {/* Controls */}
        <div className="mt-5 border-4 border-white bg-neutral-950 p-3 md:p-4">
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('lore_search_placeholder')}
                aria-label={t('lore_search_placeholder')}
                className="w-full bg-black border-2 border-white/30 focus:border-amber-400 pl-9 pr-9 py-2.5 text-sm font-bold text-white placeholder-neutral-500 outline-none transition-colors"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
                  aria-label={t('lore_reset')}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowSpoilers((v) => !v)}
              aria-pressed={showSpoilers}
              className={cn(
                'px-3 py-2.5 border-2 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer',
                showSpoilers
                  ? 'bg-rose-600 text-white border-rose-400'
                  : 'bg-black text-neutral-300 border-white/30 hover:border-white',
              )}
            >
              {showSpoilers ? <Eye size={14} /> : <EyeOff size={14} />}
              {t('lore_spoiler_toggle')}
            </button>
          </div>

          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            {(['all', ...LORE_CATEGORIES] as const).map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  aria-pressed={active}
                  className={cn(
                    'px-2.5 py-1.5 border-2 font-black text-[10px] uppercase tracking-wider transition-colors cursor-pointer',
                    active
                      ? 'bg-white text-black border-white'
                      : 'bg-black text-neutral-400 border-white/20 hover:text-white hover:border-white/50',
                  )}
                >
                  {cat === 'all' ? t('lore_filter_all') : t(catLabelKey[cat])}
                </button>
              );
            })}
            <span className="ml-auto text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              {t('lore_result_count', { count: entries.length })}
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="text-[10px] font-black uppercase tracking-wider text-neutral-400 hover:text-amber-400 inline-flex items-center gap-1"
            >
              <RefreshCw size={11} /> {t('lore_reset')}
            </button>
          </div>
        </div>

        {/* Entries */}
        {entries.length === 0 ? (
          <div className="mt-5 border-4 border-white/20 bg-neutral-950 p-8 text-center">
            <p className="font-serif font-black text-2xl uppercase">{t('lore_empty_title')}</p>
            <p className="mt-2 text-sm font-bold text-neutral-400">{t('lore_empty_desc')}</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-amber-400 text-black border-2 border-black font-black text-xs uppercase tracking-widest neo-shadow"
            >
              {t('lore_reset')}
            </button>
          </div>
        ) : (
          <div className="mt-5 grid md:grid-cols-2 gap-4">
            {entries.map((entry) => {
              const visible = answerVisible(entry);
              return (
                <article
                  key={entry.id}
                  className="border-4 border-white/80 bg-neutral-950 p-4 flex flex-col gap-3 neo-shadow-white"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('px-2 py-0.5 border text-[9px] font-black uppercase tracking-widest', catAccent[entry.category])}>
                      {t(catLabelKey[entry.category])}
                    </span>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 truncate max-w-[55%]">
                      {entry.series}
                    </span>
                    {entry.spoiler && (
                      <span className="ml-auto px-2 py-0.5 border border-rose-500 text-rose-400 bg-rose-500/10 text-[9px] font-black uppercase tracking-widest">
                        {t('lore_spoiler_badge')}
                      </span>
                    )}
                  </div>

                  <h2 className="font-serif font-black text-lg md:text-xl leading-tight">
                    {pickLang(entry.question, lang)}
                  </h2>

                  {visible ? (
                    <p className="text-sm font-medium text-neutral-300 leading-relaxed">
                      {pickLang(entry.answer, lang)}
                    </p>
                  ) : (
                    <div className="border-2 border-dashed border-white/20 p-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggleReveal(entry.id)}
                        className="px-3 py-2 bg-rose-600 text-white border-2 border-black font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                      >
                        {t('lore_show_answer')}
                      </button>
                    </div>
                  )}

                  <div className="mt-auto pt-2 border-t-2 border-white/10 flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-500">
                      {t('lore_source_label')}: {entry.sourceLabel}
                    </span>
                    <a
                      href={entry.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-400 hover:text-white"
                    >
                      {t('lore_read_more')} <ExternalLink size={11} />
                    </a>
                    {entry.spoiler && visible && !showSpoilers && (
                      <button
                        type="button"
                        onClick={() => toggleReveal(entry.id)}
                        className="text-[9px] font-black uppercase tracking-wider text-neutral-500 hover:text-rose-400"
                      >
                        {t('lore_hide_answer')}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Live industry news */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles size={18} className="text-amber-400" />
            <div>
              <h2 className="font-serif font-black text-2xl uppercase leading-none">{t('lore_news_title')}</h2>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">{t('lore_news_desc')}</p>
            </div>
          </div>
          <AnimeNewsFeed />
        </div>

        <p className="mt-8 text-[9px] font-mono uppercase tracking-wider text-neutral-600">
          {t('lore_result_count', { count: FAN_LORE.length })} · {t('lore_curated_notice')}
        </p>
      </div>
    </div>
  );
};

export default FanLore;
