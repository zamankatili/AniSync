import { useMemo, useState } from 'react';
import {
  Clapperboard, Search, Eye, EyeOff, X, ExternalLink, Flame,
} from 'lucide-react';
import { PageMeta } from '../components/PageMeta';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { cn } from '../lib/utils';
import {
  ICONIC_SCENES,
  SCENE_CATEGORY_LABEL,
  seriesAccent,
  type SceneCategory,
  type IconicScene,
} from '../data/iconicScenes';
import { useXpStore } from '../store/useXpStore';
import { useToastStore } from '../store/useToastStore';
import { getDailyDateKey } from '../lib/dailyDate';
import type { Lang4 } from '../data/universePaths';

const pickLang = (value: Record<Lang4, string>, lang: Lang4): string => value[lang] || value.en;

const catAccent: Record<SceneCategory, string> = {
  duygusal: 'text-rose-300 border-rose-400/60 bg-rose-400/10',
  atmosfer: 'text-cyan-300 border-cyan-400/60 bg-cyan-400/10',
  aksiyon: 'text-amber-300 border-amber-400/60 bg-amber-400/10',
};

const catEmoji: Record<SceneCategory, string> = {
  duygusal: '💔',
  atmosfer: '🌊',
  aksiyon: '⚔️',
};

const ARC_ORDER: SceneCategory[] = ['duygusal', 'atmosfer', 'aksiyon'];

export const IconicScenes = () => {
  const { t, currentLang } = useAppTranslation();
  const { addToast } = useToastStore();
  const award = useXpStore((state) => state.award);
  const base = (currentLang.slice(0, 2) as Lang4);
  const lang: Lang4 = (['tr', 'en', 'ja', 'fr'] as const).includes(base) ? base : 'en';

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SceneCategory | 'all'>('all');
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [openScene, setOpenScene] = useState<IconicScene | null>(null);

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ICONIC_SCENES.filter((scene) => {
      if (category !== 'all' && scene.category !== category) return false;
      if (!q) return true;
      return [scene.series, pickLang(scene.title, lang), pickLang(scene.why, lang)]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [query, category, lang]);

  const counts = useMemo(
    () =>
      ICONIC_SCENES.reduce<Record<SceneCategory, number>>(
        (acc, scene) => ({ ...acc, [scene.category]: (acc[scene.category] || 0) + 1 }),
        { duygusal: 0, atmosfer: 0, aksiyon: 0 },
      ),
    [],
  );

  const visible = (scene: IconicScene) => scene.spoiler === 'none' || revealed.has(scene.id);

  const toggleReveal = (id: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openDetail = (scene: IconicScene) => {
    setOpenScene(scene);
    // XP: kartı günlük ilk kez açmanın ödülü (6/gün tavan)
    const result = award({ action: 'scene_view', key: `scene:${scene.id}:${getDailyDateKey()}` });
    if (result.awarded > 0) {
      addToast(t('xp_award_toast', { xp: result.awarded }), 'success');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageMeta
        title={t('scenes_page_meta_title')}
        description={t('scenes_page_meta_desc')}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-white/20 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 border-2 border-white bg-amber-400 text-black flex items-center justify-center font-black neo-shadow-white">
              <Clapperboard size={22} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
              {t('nav_iconic_scenes')}
            </h1>
            <span className="bg-amber-400 text-black font-black text-[10px] px-2 py-0.5 border border-black uppercase shadow-[2px_2px_0px_0px_#fff]">
              {t('scenes_badge')}
            </span>
          </div>
          <p className="text-sm font-black text-neutral-400 uppercase tracking-widest">
            {t('scenes_page_subtitle')}
          </p>
        </div>
      </div>

      <p className="text-[10px] md:text-[11px] font-mono uppercase tracking-wide text-neutral-500 leading-relaxed max-w-2xl border-l-4 border-amber-400 pl-3">
        {t('scenes_official_note')}
      </p>

      {/* Category counts strip */}
      <div className="grid grid-cols-3 gap-2">
        {ARC_ORDER.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory((current) => (current === cat ? 'all' : cat))}
            className={cn(
              'border-2 p-3 text-center uppercase font-black text-[10px] tracking-widest cursor-pointer transition-colors',
              category === cat
                ? 'border-amber-400 bg-amber-400 text-black'
                : 'border-white/30 bg-neutral-950 text-white hover:border-amber-400',
            )}
          >
            <span className="block text-lg" aria-hidden="true">{catEmoji[cat]}</span>
            {SCENE_CATEGORY_LABEL[cat][lang]}
            <span className="block text-[9px] opacity-70 mt-0.5">
              {t('scenes_count', { count: counts[cat] })}
            </span>
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="border-2 border-white/20 bg-neutral-950 p-3">
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t('scenes_search_placeholder')}
              placeholder={t('scenes_search_placeholder')}
              className="w-full bg-black border-2 border-white/30 focus:border-amber-400 pl-9 pr-9 py-2 text-sm font-bold text-white placeholder-neutral-600 outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
                aria-label="Clear"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setCategory('all')}
              className={cn(
                'px-3 py-2 border-2 font-black text-[10px] uppercase tracking-widest cursor-pointer',
                category === 'all' ? 'bg-white text-black border-white' : 'text-neutral-400 border-white/20',
              )}
            >
              {t('scenes_filter_all')}
            </button>
            {ARC_ORDER.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(category === cat ? 'all' : cat)}
                className={cn(
                  'px-3 py-2 border-2 font-black text-[10px] uppercase tracking-widest cursor-pointer',
                  category === cat ? 'bg-white text-black border-white' : 'text-neutral-400 border-white/20',
                )}
              >
                {SCENE_CATEGORY_LABEL[cat][lang]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Entries */}
      {entries.length === 0 ? (
        <div className="border-2 border-white/20 bg-neutral-950 p-8 text-center">
          <p className="font-black text-xl uppercase text-neutral-200">{t('scenes_empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map((scene) => (
            <article
              key={scene.id}
              className={cn(
                'border-4 border-white p-4 flex flex-col gap-3 neo-shadow-white bg-gradient-to-br',
                scene.gradient,
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={cn('px-2 py-0.5 border text-[9px] font-black uppercase tracking-widest', catAccent[scene.category])}>
                  {catEmoji[scene.category]} {SCENE_CATEGORY_LABEL[scene.category][lang]}
                </span>
                {scene.spoiler !== 'none' && (
                  <span className="px-2 py-0.5 border border-rose-500 text-rose-300 bg-black/50 text-[9px] font-black uppercase tracking-widest">
                    {t('scenes_spoiler_label')} · {scene.spoiler === 'hafif' ? 'Ⅰ' : 'Ⅱ'}
                  </span>
                )}
              </div>

              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/60 leading-tight">
                  {scene.series}
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/40 leading-tight mt-0.5">
                  {pickLang(scene.arc, lang)}
                </p>
                <h2 className="font-serif font-black text-xl md:text-2xl text-white leading-tight mt-1.5">
                  {pickLang(scene.title, lang)}
                </h2>
              </div>

              {scene.quote && (
                <blockquote className="border-l-4 border-amber-400 pl-3 py-1 text-amber-200 font-black text-sm md:text-base leading-snug">
                  “{pickLang(scene.quote, lang)}”
                </blockquote>
              )}

              {visible(scene) ? (
                <p className="text-xs md:text-sm font-medium text-white/90 leading-relaxed">
                  {pickLang(scene.why, lang)}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => toggleReveal(scene.id)}
                  className="border-2 border-dashed border-white/40 px-4 py-3 text-xs font-black uppercase tracking-widest text-white/80 hover:text-white hover:border-amber-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye size={14} /> {t('scenes_spoiler_show')}
                </button>
              )}

              <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-white/20">
                <button
                  type="button"
                  onClick={() => toggleReveal(scene.id)}
                  className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-white/60 hover:text-white"
                >
                  {visible(scene) ? <EyeOff size={11} /> : <Eye size={11} />}
                  {visible(scene) ? t('scenes_spoiler_hide') : t('scenes_spoiler_show')}
                </button>
                <button
                  type="button"
                  onClick={() => openDetail(scene)}
                  className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-black bg-amber-400 hover:bg-white border-2 border-black px-2.5 py-1.5 transition-colors"
                >
                  <Flame size={12} strokeWidth={2.5} /> {t('scenes_open_modal')}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal */}
      {openScene && (
        <div
          className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={pickLang(openScene.title, lang)}
          onClick={() => setOpenScene(null)}
        >
          <div
            className="w-full max-w-2xl border-4 border-white bg-neutral-950 neo-shadow-white max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 border-b-4 border-amber-400 px-5 py-3">
              <div className="min-w-0">
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-amber-400 truncate">
                  {openScene.series}
                </p>
                <h3 className="font-black text-white text-lg leading-tight">
                  {pickLang(openScene.title, lang)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpenScene(null)}
                className="p-2 border-2 border-white text-white hover:bg-white hover:text-black transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {openScene.videoId && (
                <div className="relative w-full aspect-video border-4 border-amber-400">
                  <iframe
                    title={pickLang(openScene.title, lang)}
                    src={`https://www.youtube-nocookie.com/embed/${openScene.videoId}?autoplay=1&rel=0`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                  />
                </div>
              )}
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-500">
                {t('scenes_arc_label')}: {pickLang(openScene.arc, lang)}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-500">
                {t('scenes_category_label')}: {catEmoji[openScene.category]} {SCENE_CATEGORY_LABEL[openScene.category][lang]}
              </p>
              <div className="border-l-4 border-white/20 pl-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-1">
                  {t('scenes_why_label')}
                </p>
                <p className="text-sm text-neutral-200 leading-relaxed">{pickLang(openScene.why, lang)}</p>
              </div>
              {openScene.channelLabel && (
                <a
                  href={`https://www.youtube.com/watch?v=${openScene.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-400 hover:text-white"
                >
                  {openScene.channelLabel} <ExternalLink size={11} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IconicScenes;
