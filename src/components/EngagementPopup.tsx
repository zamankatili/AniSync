import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lightbulb, MessageCircle, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { getFactTag, getFactText, type EngagementPopupPayload } from '../lib/engagementPopup';
import { MaarifLeafCard } from './MaarifLeafCard';

interface EngagementPopupProps {
  payload: EngagementPopupPayload | null;
  onDismiss: () => void;
  onDismissForDay: () => void;
}

export const EngagementPopup: React.FC<EngagementPopupProps> = ({ payload, onDismiss, onDismissForDay }) => {
  const { t, currentLang } = useAppTranslation();
  const navigate = useNavigate();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!payload) return;
    closeRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [payload, onDismiss]);

  const isMaarif = payload?.type === 'maarif' && !!payload.maarif;
  const isFact = payload?.type === 'anime-fact';
  const title = isMaarif ? t('maarif_title') : isFact ? t('engagement_fact_title') : t('engagement_question_title');
  const badge = isFact && payload.fact ? getFactTag(payload.fact, currentLang) : t('engagement_daily_badge');
  const body = isFact && payload.fact ? getFactText(payload.fact, currentLang) : payload?.question || '';
  const hint = !isFact ? payload?.hint : undefined;
  const localeTag =
    currentLang === 'tr' ? 'tr-TR' : currentLang === 'ja' ? 'ja-JP' : currentLang === 'fr' ? 'fr-FR' : 'en-US';

  const handleAction = () => {
    if (!payload) return;
    if (payload.type === 'daily-question' && payload.question) {
      onDismiss();
      navigate('/', { state: { engagementPrompt: payload.question } });
      return;
    }
    onDismiss();
  };

  return (
    <AnimatePresence>
      {payload && (
        <div className="fixed inset-x-0 bottom-20 md:bottom-6 z-[70] flex justify-center px-4 pointer-events-none">
          <motion.section
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="false"
            aria-label={title}
            className={`pointer-events-auto w-full max-w-md max-h-[calc(100dvh-7rem)] overflow-y-auto border-4 border-black neo-shadow ${
              isMaarif ? 'bg-[#f7f1e3] text-black' : 'bg-white text-black'
            }`}
          >
            {isMaarif && payload.maarif ? (
              <MaarifLeafCard
                maarif={payload.maarif}
                locale={localeTag}
                t={t}
                closeRef={closeRef}
                onDismiss={onDismiss}
                onDismissForDay={onDismissForDay}
              />
            ) : (
              <>
                <div className={`flex items-center justify-between gap-3 border-b-4 border-black px-4 py-3 ${isFact ? 'bg-amber-300' : 'bg-cyan-300'}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    {isFact ? <Sparkles size={18} strokeWidth={2.5} /> : <MessageCircle size={18} strokeWidth={2.5} />}
                    <p className="font-black uppercase tracking-widest text-[11px] truncate">{title}</p>
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

                <div className="p-4">
                  <div className="inline-flex items-center gap-2 border-2 border-black bg-black text-white px-2 py-1 text-[10px] font-black uppercase tracking-wider mb-3">
                    {isFact ? <Sparkles size={12} /> : <Lightbulb size={12} />}
                    <span>{badge}</span>
                  </div>

                  <p className="text-sm font-bold leading-relaxed text-neutral-900">{body}</p>

                  {isFact && payload.fact?.source && (
                    <a
                      href={payload.fact.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex min-h-[32px] items-center text-[10px] font-black uppercase tracking-wider text-neutral-500 underline decoration-2 underline-offset-2 hover:text-black"
                    >
                      {t('source_label')}: {payload.fact.source.label}
                    </a>
                  )}

                  {hint && (
                    <p className="mt-3 text-xs font-semibold text-neutral-600 border-l-4 border-cyan-500 pl-3">
                      {hint}
                    </p>
                  )}

                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={handleAction}
                      className="min-h-[44px] px-4 py-2 border-2 border-black bg-black text-white font-black uppercase tracking-wider text-xs hover:bg-neutral-800 transition-colors"
                    >
                      {isFact ? t('engagement_fact_ok') : t('engagement_question_answer')}
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
              </>
            )}
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  );
};
