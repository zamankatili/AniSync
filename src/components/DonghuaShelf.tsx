import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { getSafeImageUrl, handleImageError } from '../lib/utils';
import {
  DONGHUA_SHELF,
  SHELF_LAST_CHECKED,
  SHELF_TAG_ORDER,
  type ShelfEntry,
} from '../data/donghuaShelf';

/**
 * Elle küratörlü "Xianxia & Donghua" rafı.
 *
 * - Veri `src/data/donghuaShelf.ts` dosyasından gelir; her kart gerçek bir
 *   AniList kaydına bağlıdır (id, yıl, kapak, tür etiketleri).
 * - Roman/metin gösterilmez. NovelUpdates bağlantısı yalnızca kaynağı aramak
 *   için açılır; sitede alıntı veya özet barındırılmaz.
 * - "Canlı" iddiası yoktur: rafın son elle kontrol tarihi sabit olarak yazılır.
 */
const NOTE_LANGS = ['tr', 'en', 'ja', 'fr'] as const;
type NoteLang = (typeof NOTE_LANGS)[number];

const pickNoteLang = (lang: string): NoteLang => {
  const base = String(lang || '').split('-')[0].toLowerCase();
  return (NOTE_LANGS as readonly string[]).includes(base) ? (base as NoteLang) : 'en';
};

const orderedTags = (entry: ShelfEntry): ShelfEntry['tags'] =>
  [...entry.tags].sort(
    (a, b) => SHELF_TAG_ORDER.indexOf(a) - SHELF_TAG_ORDER.indexOf(b),
  );

export const DonghuaShelf: React.FC = () => {
  const { t, currentLang } = useAppTranslation();
  const noteLang = pickNoteLang(currentLang);

  return (
    <section aria-labelledby="donghua-shelf-title" className="space-y-6">
      <div className="border-b-4 border-white/20 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-2 bg-amber-400 text-black border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-widest">
            <Sparkles size={14} strokeWidth={2.5} aria-hidden="true" />
            {t('shelf_curated_badge')}
          </span>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            {t('shelf_count', { count: DONGHUA_SHELF.length })}
          </span>
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            {t('shelf_last_checked', { date: SHELF_LAST_CHECKED })}
          </span>
        </div>
        <h2
          id="donghua-shelf-title"
          className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter"
        >
          {t('shelf_title')}
        </h2>
        <p className="text-neutral-400 font-bold text-xs uppercase tracking-wider mt-2">
          {t('shelf_subtitle')}
        </p>
      </div>

      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider leading-relaxed border-l-4 border-amber-400 pl-3">
        {t('shelf_scope_note')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {DONGHUA_SHELF.map((entry) => (
          <article
            key={entry.id}
            className="group flex flex-col bg-black border-4 border-white/25 hover:border-white transition-colors"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden border-b-4 border-white/25 bg-neutral-900">
              {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- onError only swaps to the fallback cover; the image is not interactive */}
              <img
                src={getSafeImageUrl(entry.cover)}
                alt={entry.title}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={handleImageError}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
                <span className="bg-amber-400 text-black px-2 py-1 text-[10px] font-black border-2 border-black uppercase tracking-wider">
                  {t(`shelf_kind_${entry.kind}`)}
                </span>
                <span className="bg-white text-black px-2 py-1 text-[10px] font-black border-2 border-black uppercase tracking-wider">
                  {entry.year}
                </span>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-4">
              <div>
                <h3 lang="en" className="text-sm font-black uppercase leading-tight text-white">
                  {entry.title}
                </h3>
                <p lang="zh" className="text-xs font-bold text-neutral-300 mt-1">
                  {entry.titleNative}
                </p>
                <p lang="en" className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">
                  {entry.titleRomaji} · {entry.format}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {orderedTags(entry).map((tag) => (
                  <span
                    key={tag}
                    className="border border-white/30 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-neutral-300"
                  >
                    {t(`shelf_tag_${tag}`)}
                  </span>
                ))}
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                {entry.notes[noteLang] || entry.notes.en}
              </p>

              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                {entry.kind === 'donghua' && entry.episodes
                  ? t('shelf_episodes', { count: entry.episodes })
                  : null}
                {entry.kind === 'manhua' && entry.chapters
                  ? t('shelf_chapters', { count: entry.chapters })
                  : null}
              </p>

              <div className="mt-auto flex flex-col gap-2 pt-2">
                <a
                  href={entry.anilistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[44px] sm:min-h-0 px-3 py-2 bg-white text-black border-2 border-black text-[10px] font-black uppercase tracking-wider hover:bg-amber-400 transition-colors"
                >
                  <ExternalLink size={14} strokeWidth={2.5} aria-hidden="true" />
                  {t('shelf_link_anilist')}
                </a>
                {entry.novelSearchUrl ? (
                  <a
                    href={entry.novelSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] sm:min-h-0 px-3 py-2 bg-black text-white border-2 border-white/40 text-[10px] font-black uppercase tracking-wider hover:border-white hover:text-amber-400 transition-colors"
                  >
                    <ExternalLink size={14} strokeWidth={2.5} aria-hidden="true" />
                    {t('shelf_link_novel')}
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default DonghuaShelf;
