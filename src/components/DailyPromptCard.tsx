import React, { useState } from 'react';
import { MessageCircle, Lightbulb, LightbulbOff, Send } from 'lucide-react';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { getDailyPrompt, DAILY_PROMPTS } from '../data/dailyPrompts';
import { cn } from '../lib/utils';

interface DailyPromptCardProps {
  /** "Yanıtla" düğmesi — ana sayfa bestecisini önceden soru ile doldurur. */
  onAnswer: (question: string) => void;
}

export const DailyPromptCard: React.FC<DailyPromptCardProps> = ({ onAnswer }) => {
  const { t, currentLang } = useAppTranslation();
  const [showHint, setShowHint] = useState(false);
  const { question, hint, index } = getDailyPrompt(currentLang);

  return (
    <div className="bg-black p-5 border-4 border-cyan-400 neo-shadow-white relative">
      <div className="flex items-center justify-between mb-2 border-b border-white/20 pb-2">
        <div className="flex items-center gap-2">
          <MessageCircle size={16} className="text-cyan-400" strokeWidth={2.5} />
          <h3 className="font-black text-white text-xs tracking-widest uppercase">{t('daily_question_title')}</h3>
        </div>
        <span className="text-[9px] font-black text-cyan-400 font-mono border border-cyan-400/60 px-1.5 py-0.5">
          {index + 1}/{DAILY_PROMPTS.length}
        </span>
      </div>

      <p lang={currentLang} className="text-white font-black text-base md:text-[17px] leading-snug">
        {question}
      </p>
      <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest mt-1.5">{t('daily_question_note')}</p>

      {showHint && (
        <div className="flex items-start gap-2 mt-2.5 bg-cyan-500/10 border border-cyan-400/40 p-2">
          <Lightbulb size={13} className="text-cyan-400 shrink-0 mt-0.5" strokeWidth={2.5} />
          <p className="text-[11px] text-cyan-200 font-bold leading-snug">{hint}</p>
        </div>
      )}

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => setShowHint((v) => !v)}
          aria-expanded={showHint}
          aria-label={showHint ? t('daily_question_hide_hint') : t('daily_question_hint')}
          className={cn(
            'px-3 py-2 border-2 font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors',
            showHint ? 'bg-cyan-400 text-black border-cyan-400' : 'bg-transparent text-cyan-300 border-cyan-400/50 hover:bg-cyan-400/10'
          )}
        >
          {showHint ? <LightbulbOff size={13} /> : <Lightbulb size={13} />}
          {showHint ? t('daily_question_hide_hint') : t('daily_question_hint')}
        </button>
        <button
          onClick={() => onAnswer(question)}
          className="flex-1 py-2 bg-white hover:bg-cyan-400 text-black font-black text-[11px] uppercase tracking-widest border-2 border-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Send size={13} strokeWidth={3} />
          {t('daily_question_cta')}
        </button>
      </div>
    </div>
  );
};
