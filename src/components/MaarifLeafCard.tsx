import React from 'react';
import { BookOpen, CalendarDays, Quote, X } from 'lucide-react';
import { pickLocalized, type DailyMaarif } from '../lib/maarif';

interface MaarifLeafCardProps {
  maarif: DailyMaarif;
  locale: string;
  t: (key: string) => string;
  closeRef: React.RefObject<HTMLButtonElement | null>;
  onDismiss: () => void;
  onDismissForDay: () => void;
}

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map((part) => Number(part));
  return new Date(year, (month || 1) - 1, day || 1);
}

export const MaarifLeafCard: React.FC<MaarifLeafCardProps> = ({
  maarif,
  locale,
  t,
  closeRef,
  onDismiss,
  onDismissForDay,
}) => {
  const date = parseDateKey(maarif.dateKey);
  const dayNumber = String(date.getDate()).padStart(2, '0');
  const monthYear = date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  const weekday = date.toLocaleDateString(locale, { weekday: 'long' });
  const quoteText = pickLocalized(maarif.quote.text, locale);
  const eventText = maarif.event ? pickLocalized(maarif.event.text, locale) : '';
  const seasonNote = pickLocalized(maarif.seasonNote, locale);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-3 border-b-4 border-black bg-amber-300 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarDays size={18} strokeWidth={2.5} />
          <p className="font-black uppercase tracking-widest text-[11px] truncate">{t('maarif_title')}</p>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onDismiss}
          aria-label={t('close')}
          className="min-w-[44px] min-h-[44px] border-2 border-black bg-white hover:bg-black hover:text-white transition-colors flex items-center justify-center shrink-0"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div className="p-0">
        {/* Yaprak başlığı: büyük gün + ay/yıl */}
        <div className="flex items-end justify-between gap-3 border-b-4 border-black px-4 py-3 bg-[#f7f1e3]">
          <div className="flex items-end gap-3 min-w-0">
            <span className="text-6xl font-black leading-none tracking-tighter">{dayNumber}</span>
            <div className="min-w-0 pb-1">
              <p className="text-sm font-black uppercase tracking-widest leading-tight">{monthYear}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">{weekday}</p>
            </div>
          </div>
          <span className="hidden sm:inline-block border-2 border-black bg-black text-amber-300 px-2 py-1 text-[9px] font-black uppercase tracking-widest">
            AniSync
          </span>
        </div>

        {/* Günün repliği */}
        <div className="px-4 py-4 border-b-2 border-black/10">
          <div className="flex items-center gap-2 mb-2">
            <Quote size={14} strokeWidth={2.5} className="text-rose-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-700">{t('maarif_quote_label')}</span>
          </div>
          <blockquote className="font-serif text-base sm:text-lg font-bold italic leading-snug text-neutral-900">
            “{quoteText}”
          </blockquote>
          <p className="mt-2 text-[11px] font-black uppercase tracking-wider text-neutral-600">
            — {maarif.quote.character}, <span className="text-neutral-800">{maarif.quote.work}</span>
          </p>
        </div>

        {/* Otaku tarihinde bugün */}
        <div className="px-4 py-4 border-b-2 border-black/10">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={14} strokeWidth={2.5} className="text-cyan-700" />
            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-800">{t('maarif_today_label')}</span>
          </div>
          {maarif.event ? (
            <>
              <p className="text-xs font-bold leading-relaxed text-neutral-900">{eventText}</p>
              {maarif.event.source && (
                <a
                  href={maarif.event.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex min-h-[32px] items-center text-[10px] font-black uppercase tracking-wider text-neutral-500 underline decoration-2 underline-offset-2 hover:text-black"
                >
                  {t('source_label')}: {maarif.event.source.label}
                </a>
              )}
            </>
          ) : (
            <p className="text-xs font-semibold leading-relaxed text-neutral-600">{t('maarif_no_event')}</p>
          )}
        </div>

        {/* Sezon notu */}
        <div className="px-4 py-3 bg-amber-100 border-b-4 border-black">
          <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600 block mb-1">
            {t('maarif_season_label')}
          </span>
          <p className="text-xs font-bold leading-relaxed text-neutral-900">{seasonNote}</p>
        </div>

        <div className="px-4 py-3 bg-[#f7f1e3]">
          <p className="text-[9px] font-semibold text-neutral-500 mb-3">{t('maarif_translation_note')}</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={onDismiss}
              className="min-h-[44px] px-4 py-2 border-2 border-black bg-black text-white font-black uppercase tracking-wider text-xs hover:bg-neutral-800 transition-colors"
            >
              {t('close')}
            </button>
            <button
              type="button"
              onClick={onDismissForDay}
              className="min-h-[44px] px-4 py-2 border-2 border-black bg-white text-black font-black uppercase tracking-wider text-xs hover:bg-neutral-100 transition-colors"
            >
              {t('engagement_hide_today')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
