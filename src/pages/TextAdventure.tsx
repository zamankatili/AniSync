import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Terminal as TerminalIcon, Send, Lightbulb, Map as MapIcon, PackageOpen,
  RotateCcw, Save, Upload, BookOpen, Sparkles, CornerDownLeft,
} from 'lucide-react';
import { PageMeta } from '../components/PageMeta';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { cn } from '../lib/utils';
import {
  ADVENTURE_ENDINGS,
  ADVENTURE_ITEMS,
  ADVENTURE_ROOMS,
  DIRECTION_LABELS,
  TA_HELP,
  TA_INTRO,
  TA_QUICK_COMMANDS,
  getLocalized,
  type Lang4,
} from '../data/textAdventure';
import {
  ADVENTURE_SAVE_KEY,
  createInitialState,
  describeRoom,
  executeCommand,
  getProgress,
  type AdventureLine,
  type AdventureLineKind,
  type AdventureState,
} from '../lib/textAdventureEngine';
import { playMemorial, playUiTap } from '../lib/gentleAudio';
import { trackConversionOnce } from '../lib/analytics';

type LogKind = AdventureLineKind | 'command';

interface LogEntry {
  id: number;
  kind: LogKind;
  text: string;
}

let logSequence = 0;
const nextLogId = (): number => {
  logSequence += 1;
  return logSequence;
};

const toLog = (lines: AdventureLine[]): LogEntry[] =>
  lines.map((entry) => ({ id: nextLogId(), kind: entry.kind, text: entry.text }));

const langOf = (currentLang: string): Lang4 => {
  const base = currentLang.slice(0, 2) as Lang4;
  return (['tr', 'en', 'ja', 'fr'] as const).includes(base) ? base : 'en';
};

const endingLog = (endingId: string, lang: Lang4): LogEntry[] => {
  const ending = ADVENTURE_ENDINGS.find((entry) => entry.id === endingId);
  if (!ending) return [];
  return [
    { id: nextLogId(), kind: 'room', text: getLocalized(ending.title, lang) },
    { id: nextLogId(), kind: 'ending', text: getLocalized(ending.text, lang) },
  ];
};

const openingLog = (state: AdventureState, lang: Lang4): LogEntry[] => [
  { id: nextLogId(), kind: 'system', text: getLocalized(TA_INTRO, lang) },
  ...toLog(describeRoom(state, lang)),
];

const roomName = (id: string, lang: Lang4): string => {
  const room = ADVENTURE_ROOMS.find((entry) => entry.id === id);
  return room ? getLocalized(room.name, lang) : id;
};

const itemName = (id: string, lang: Lang4): string => {
  const item = ADVENTURE_ITEMS.find((entry) => entry.id === id);
  return item ? getLocalized(item.name, lang) : id;
};

const hasStoredSave = (): boolean => {
  try {
    return !!window.localStorage.getItem(ADVENTURE_SAVE_KEY);
  } catch {
    return false;
  }
};

const lineClass: Record<LogKind, string> = {
  command: 'text-amber-400 font-bold',
  room: 'text-white font-black uppercase tracking-[0.18em] text-xs mt-3 first:mt-0',
  text: 'text-neutral-200',
  system: 'text-emerald-300/90',
  ending: 'text-amber-200',
  error: 'text-rose-400',
};

export const TextAdventure = () => {
  const { t, currentLang } = useAppTranslation();
  const lang = langOf(currentLang);

  const [game, setGame] = useState<AdventureState>(() => createInitialState());
  const gameRef = useRef(game);
  gameRef.current = game;

  const [log, setLog] = useState<LogEntry[]>(() => openingLog(createInitialState(), lang));
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const historyIndexRef = useRef(-1);
  const [hasSave, setHasSave] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const lastLangRef = useRef(lang);

  useEffect(() => {
    setHasSave(hasStoredSave());
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: 'nearest' });
  }, [log]);

  // Dil değişince günlüğü aynı oyun durumuyla yeni dilde yeniden kur.
  useEffect(() => {
    if (lastLangRef.current === lang) return;
    lastLangRef.current = lang;
    const current = gameRef.current;
    setLog(
      current.ending
        ? endingLog(current.ending, lang)
        : [
            { id: nextLogId(), kind: 'system', text: getLocalized(TA_INTRO, lang) },
            ...toLog(describeRoom(current, lang)),
          ],
    );
  }, [lang]);

  const progress = getProgress(game);
  const ending = useMemo(
    () => ADVENTURE_ENDINGS.find((entry) => entry.id === game.ending) ?? null,
    [game.ending],
  );

  const run = (raw: string) => {
    const text = raw.trim();
    if (!text) return;

    const before = gameRef.current;
    const result = executeCommand(before, text, lang);
    gameRef.current = result.state;
    setGame(result.state);
    setLog((prev) => [
      ...prev,
      { id: nextLogId(), kind: 'command', text: `> ${text}` },
      ...toLog(result.lines),
    ]);
    setHistory((prev) => [...prev, text]);
    historyIndexRef.current = -1;
    setInput('');
    setHasSave(hasStoredSave());

    if (result.state.ending && !before.ending) {
      trackConversionOnce('first_game_finish', 'first_game_finish', {
        surface: 'text_adventure',
      });
      playMemorial();
    } else playUiTap();
  };

  const runFromButton = (command: string) => {
    run(command);
    inputRef.current?.focus();
  };

  // Mobilde sabit alt gezinme çubuğu ve radyo paneli, komut alanının altını
  // kapatabiliyor. Odaklanınca alanı ekranın ortasına kaydır.
  const keepInputVisible = () => {
    if (typeof window === 'undefined' || window.innerWidth >= 768) return;
    window.requestAnimationFrame(() => {
      inputRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    });
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    run(input);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (history.length === 0) return;
      historyIndexRef.current =
        historyIndexRef.current === -1 ? history.length - 1 : Math.max(0, historyIndexRef.current - 1);
      setInput(history[historyIndexRef.current] ?? '');
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (historyIndexRef.current === -1) return;
      historyIndexRef.current = Math.min(history.length - 1, historyIndexRef.current + 1);
      setInput(history[historyIndexRef.current] ?? '');
    }
  };

  const directions = Object.entries(DIRECTION_LABELS) as [string, Record<Lang4, string>][];

  return (
    <div className="min-h-full bg-black text-white p-3 sm:p-5 md:p-8 pb-32 md:pb-8">
      <PageMeta title={`${t('ta_title')} | AniSync`} description={t('ta_desc')} />

      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <header className="border-4 border-white bg-neutral-950 p-4 md:p-8 neo-shadow-white">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 md:w-14 md:h-14 border-4 border-black bg-emerald-400 flex items-center justify-center shrink-0">
              <TerminalIcon size={26} className="text-black" strokeWidth={3} />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.4em] text-emerald-400">{t('ta_badge')}</p>
              <h1 className="font-mono font-black text-3xl sm:text-5xl md:text-6xl leading-[0.95] mt-1 tracking-tight">
                {t('ta_title')}
              </h1>
            </div>
          </div>
          <p className="mt-4 text-sm md:text-base font-bold text-neutral-300 max-w-2xl leading-snug">
            {t('ta_desc')}
          </p>
          <p className="mt-2 text-[10px] md:text-[11px] font-mono uppercase tracking-wide text-neutral-400 max-w-2xl leading-relaxed">
            {t('ta_notice')}
          </p>
        </header>

        <div className="mt-4 grid lg:grid-cols-[minmax(0,1fr)_300px] gap-4 items-start">
          {/* Terminal */}
          <section
            aria-label={t('ta_log_label')}
            className="border-4 border-white bg-black neo-shadow-rose min-w-0"
          >
            <div className="flex items-center gap-2 border-b-2 border-white/30 bg-neutral-950 px-3 py-2">
              <span className="w-2.5 h-2.5 bg-rose-500 border border-black" aria-hidden="true" />
              <span className="w-2.5 h-2.5 bg-amber-400 border border-black" aria-hidden="true" />
              <span className="w-2.5 h-2.5 bg-emerald-400 border border-black" aria-hidden="true" />
              <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400 truncate">
                {t('ta_log_label')}
              </span>
              <span className="ml-auto font-mono text-[10px] text-neutral-400 shrink-0">
                {progress}%
              </span>
            </div>

            <div
              role="log"
              aria-live="polite"
              aria-relevant="additions text"
              className="h-[38dvh] min-h-[220px] md:h-[52vh] overflow-y-auto px-3 py-4 md:px-4 font-mono text-[13px] md:text-sm leading-relaxed space-y-1.5 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.3)_transparent]"
            >
              {log.map((entry) => (
                <p key={entry.id} className={cn('whitespace-pre-wrap break-words', lineClass[entry.kind])}>
                  {entry.text}
                </p>
              ))}
              <div ref={logEndRef} aria-hidden="true" />
            </div>

            <form onSubmit={submit} className="border-t-2 border-white/30 bg-neutral-950 p-2.5 md:p-3">
              <label htmlFor="ta-command" className="sr-only">
                {t('ta_input_label')}
              </label>
              <div className="flex items-stretch gap-2">
                <span aria-hidden="true" className="flex items-center px-2 font-mono font-black text-emerald-400">
                  &gt;
                </span>
                <input
                  id="ta-command"
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onFocus={keepInputVisible}
                  onKeyDown={handleInputKeyDown}
                  placeholder={t('ta_input_placeholder')}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className="flex-1 min-w-0 bg-black border-2 border-white/30 focus:border-emerald-400 px-3 py-2.5 font-mono text-base text-white placeholder-neutral-600 outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="px-3 md:px-4 bg-emerald-400 text-black border-2 border-black font-black uppercase text-[10px] tracking-widest flex items-center gap-1.5 min-h-[44px] hover:bg-white transition-colors cursor-pointer"
                >
                  <Send size={15} strokeWidth={2.5} />
                  <span className="hidden sm:inline">{t('ta_send')}</span>
                </button>
              </div>

              <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
                <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                  {t('ta_quick_commands')}
                </span>
                {TA_QUICK_COMMANDS.map((chip) => (
                  <button
                    key={chip.command}
                    type="button"
                    onClick={() => runFromButton(chip.command)}
                    className="shrink-0 min-h-[44px] px-3 border-2 border-white/20 text-neutral-300 hover:border-emerald-400 hover:text-emerald-300 font-mono text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {getLocalized(chip.label, lang)}
                  </button>
                ))}
              </div>

              <div className="mt-1 flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
                <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                  {t('ta_go_to')}
                </span>
                {directions.map(([direction, label]) => (
                  <button
                    key={direction}
                    type="button"
                    onClick={() => runFromButton(direction)}
                    className="shrink-0 min-h-[44px] px-3 border-2 border-white/20 text-neutral-300 hover:border-amber-400 hover:text-amber-300 font-mono text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {getLocalized(label, lang)}
                  </button>
                ))}
              </div>
            </form>
          </section>

          {/* Side panels */}
          <aside className="space-y-3 min-w-0">
            {hasSave && !game.ending && (
              <button
                type="button"
                onClick={() => runFromButton('load')}
                className="w-full border-2 border-amber-400 bg-amber-400/10 px-3 py-2.5 text-left hover:bg-amber-400 hover:text-black transition-colors cursor-pointer"
              >
                <span className="block text-[9px] font-black uppercase tracking-widest text-amber-300">
                  {t('ta_save_found')}
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-xs font-black uppercase">
                  <Upload size={13} /> {t('ta_load_save')}
                </span>
              </button>
            )}

            {ending && (
              <div className="border-4 border-amber-400 bg-neutral-950 p-3 neo-shadow">
                <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-amber-400">{t('ta_ending')}</p>
                <h2 className="mt-1 font-mono font-black text-sm uppercase leading-tight">
                  {getLocalized(ending.title, lang)}
                </h2>
                <p className="mt-2 text-[11px] leading-relaxed text-neutral-300">{getLocalized(ending.text, lang)}</p>
                <button
                  type="button"
                  onClick={() => runFromButton('restart')}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 px-2 py-2 bg-amber-400 text-black border-2 border-black font-black text-[10px] uppercase tracking-widest hover:bg-white transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} /> {t('ta_restart_story')}
                </button>
              </div>
            )}

            <div className="border-2 border-white/40 bg-neutral-950 p-3">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">{t('ta_status')}</h2>
              <dl className="mt-2 space-y-1.5 font-mono text-[11px]">
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-neutral-400 uppercase">{t('ta_room')}</dt>
                  <dd className="text-right font-bold text-white truncate">{roomName(game.roomId, lang)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-neutral-400 uppercase">{t('ta_moves')}</dt>
                  <dd className="font-bold text-white">{game.moves}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <dt className="text-neutral-400 uppercase">{t('ta_progress')}</dt>
                  <dd className="font-bold text-emerald-300">{progress}%</dd>
                </div>
              </dl>
              <div
                className="mt-1 h-2 bg-white/10 border border-white/20"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t('ta_progress')}
              >
                <div className="h-full bg-emerald-400 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="border-2 border-white/40 bg-neutral-950 p-3">
              <h2 className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                <PackageOpen size={13} /> {t('ta_inventory')}
              </h2>
              {game.inventory.length === 0 ? (
                <p className="mt-2 text-[11px] text-neutral-400">{t('ta_inventory_empty')}</p>
              ) : (
                <ul className="mt-2 space-y-1 font-mono text-[11px] text-neutral-200">
                  {game.inventory.map((id) => (
                    <li key={id} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-amber-400 shrink-0" aria-hidden="true" />
                      {itemName(id, lang)}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-2 border-white/40 bg-neutral-950 p-3">
              <h2 className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                <MapIcon size={13} /> {t('ta_map')}
              </h2>
              <ul className="mt-2 space-y-1 font-mono text-[11px] text-neutral-300">
                {game.visited.map((id) => (
                  <li key={id} className="flex items-center gap-1.5">
                    <span
                      className={cn('w-1 h-1 shrink-0', id === game.roomId ? 'bg-emerald-400' : 'bg-white/30')}
                      aria-hidden="true"
                    />
                    <span className={cn(id === game.roomId && 'text-white font-bold')}>{roomName(id, lang)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-2 border-white/40 bg-neutral-950 p-3">
              <h2 className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                <Lightbulb size={13} /> {t('ta_hints')}
              </h2>
              <p className="mt-1.5 text-[10px] leading-relaxed text-neutral-400">{t('ta_hint_note')}</p>
              <button
                type="button"
                onClick={() => runFromButton('hint')}
                className="mt-2 w-full flex items-center justify-center gap-1.5 px-2 py-2 border-2 border-white/30 text-[10px] font-black uppercase tracking-widest hover:border-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                <Lightbulb size={13} /> {t('ta_show_hint')}
              </button>
            </div>

            <div className="border-2 border-white/40 bg-neutral-950 p-3">
              <h2 className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                <BookOpen size={13} /> {t('ta_help')}
              </h2>
              <p className="mt-2 font-mono text-[10px] leading-relaxed text-neutral-400 whitespace-pre-wrap">
                {getLocalized(TA_HELP, lang)}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => runFromButton('save')}
                className="flex flex-col items-center justify-center gap-1 min-h-[52px] border-2 border-white/30 text-[9px] font-black uppercase tracking-wider hover:border-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                <Save size={15} /> {t('ta_save')}
              </button>
              <button
                type="button"
                onClick={() => runFromButton('load')}
                className="flex flex-col items-center justify-center gap-1 min-h-[52px] border-2 border-white/30 text-[9px] font-black uppercase tracking-wider hover:border-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <Upload size={15} /> {t('ta_load')}
              </button>
              <button
                type="button"
                onClick={() => runFromButton('restart')}
                className="flex flex-col items-center justify-center gap-1 min-h-[52px] border-2 border-white/30 text-[9px] font-black uppercase tracking-wider hover:border-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
              >
                <RotateCcw size={15} /> {t('ta_restart')}
              </button>
            </div>

            <p className="flex items-start gap-1.5 text-[9px] font-mono uppercase tracking-wide text-neutral-600 leading-relaxed">
              <Sparkles size={11} className="shrink-0 mt-0.5" /> {t('ta_keyboard_note')}
            </p>
            <p className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wide text-neutral-600">
              <CornerDownLeft size={11} /> {t('ta_history_note')}
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default TextAdventure;
