import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Clock, Sparkles } from 'lucide-react';
import { THEME_CONFIGS, useThemeStore, type TimeThemeId } from '../store/useThemeStore';
import { useStore } from '../store/useStore';

interface ThemeSwitcherProps {
  compact?: boolean;
}

/** Klasik temanın zaman bazlı renk paletini değiştirir (v1 menüsü). */
export function ThemeSwitcher({ compact = false }: ThemeSwitcherProps) {
  const [open, setOpen] = useState(false);
  const { currentTheme, isAutoMode, setTheme, toggleAutoMode } = useThemeStore();
  const setAtmos = useStore((s) => s.setAtmos);
  const atmos = useStore((s) => s.atmos);
  const notify = useStore((s) => s.notify);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const active = THEME_CONFIGS[currentTheme] ?? THEME_CONFIGS.noon;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (ref.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const select = (key: TimeThemeId) => {
    const cfg = THEME_CONFIGS[key];
    setTheme(key);
    if (atmos !== 'klasik') setAtmos('klasik');
    setOpen(false);
    notify(`${cfg.icon} Atmosfer: ${cfg.nameTR}`, 'info');
  };

  const toggleAuto = () => {
    const willBeAuto = !isAutoMode;
    toggleAutoMode();
    if (willBeAuto && atmos !== 'klasik') setAtmos('klasik');
    notify(
      willBeAuto
        ? '🕒 Otomatik atmosfer açık: günün saatine göre renkler değişecek.'
        : '✋ Manuel mod: seçtiğin atmosfer sabitlendi.',
      'info',
    );
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Zaman teması"
        aria-expanded={open}
        className="flex h-9 items-center gap-1.5 border-2 bg-black px-2 text-[10px] font-black uppercase text-white transition-colors hover:bg-neutral-900 md:h-10 md:px-2.5"
        style={{ borderColor: active.accentColor }}
      >
        <span className="text-[14px] leading-none">{active.icon}</span>
        {!compact && (
          <>
            <span
              className="hidden h-2 w-2 animate-pulse rounded-full sm:inline-block"
              style={{ backgroundColor: active.accentColor }}
            />
            <span className="hidden text-[10px] font-black uppercase lg:inline">
              {active.nameTR.split(' ')[0]}
            </span>
            <span
              className="hidden px-1 text-[8px] font-black uppercase sm:inline-block"
              style={{
                backgroundColor: isAutoMode ? '#fbbf24' : active.accentColor,
                color: isAutoMode || active.id === 'dawn' || active.id === 'midnight' ? '#000' : '#fff',
              }}
            >
              {isAutoMode ? 'OTO' : 'SABİT'}
            </span>
          </>
        )}
        <ChevronDown size={12} className={`text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[9998] bg-black/20" onClick={() => setOpen(false)} />
            <div
              ref={menuRef}
              className="fixed right-3 top-[62px] z-[9999] max-h-[calc(100dvh-80px)] w-[min(320px,calc(100vw-24px))] overflow-y-auto border-4 border-white bg-black p-3.5 shadow-2xl md:right-6"
              style={{ borderColor: active.accentColor, boxShadow: '4px 4px 0 0 #fff' }}
            >
          <div className="border-b-2 border-white/20 pb-2.5">
            <h4 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-white">
              <Sparkles size={13} style={{ color: active.accentColor }} />
              GÜNÜN SAATİNE GÖRE ATMOSFER
            </h4>
            <p className="mt-0.5 text-[9px] font-bold uppercase text-neutral-400">
              Sayfa renkleri ve ortam ışığını anında değiştirir
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between border-2 border-white/20 bg-neutral-950 p-2.5">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-amber-400" />
              <div>
                <span className="block text-[10px] font-black uppercase text-white">Otomatik Saat Takibi</span>
                <span className="text-[8.5px] font-bold uppercase text-neutral-400">
                  Şu anki saat: {new Date().getHours()}:00
                </span>
              </div>
            </div>
            <button
              onClick={toggleAuto}
              className={`border-2 px-2 py-1 text-[9px] font-black uppercase transition-colors ${
                isAutoMode
                  ? 'border-black bg-amber-400 text-black'
                  : 'border-white/30 bg-neutral-900 text-neutral-400 hover:border-white'
              }`}
            >
              {isAutoMode ? 'AÇIK (OTO)' : 'KAPALI (MANUEL)'}
            </button>
          </div>

          <div className="mt-2 space-y-2">
            {(Object.keys(THEME_CONFIGS) as TimeThemeId[]).map((key) => {
              const cfg = THEME_CONFIGS[key];
              const selected = currentTheme === key;
              return (
                <button
                  key={key}
                  onClick={() => select(key)}
                  className={`flex w-full items-center justify-between border-2 p-2.5 text-left transition-all ${
                    selected
                      ? '-translate-y-0.5 border-black bg-white text-black'
                      : 'border-white/20 bg-neutral-950 text-white hover:border-white'
                  }`}
                  style={{ boxShadow: selected ? `4px 4px 0 0 ${cfg.accentColor}` : undefined }}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 text-lg">{cfg.icon}</span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[11px] font-black uppercase">{cfg.nameTR}</span>
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full border border-black"
                          style={{ backgroundColor: cfg.accentColor }}
                        />
                      </span>
                      <span
                        className={`mt-0.5 block truncate text-[9px] font-bold uppercase ${
                          selected ? 'text-neutral-700' : 'text-neutral-400'
                        }`}
                      >
                        {cfg.timeRange} • {cfg.descriptionTR}
                      </span>
                    </span>
                  </span>
                  {selected && (
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-black"
                      style={{
                        backgroundColor: cfg.accentColor,
                        color: cfg.id === 'dawn' || cfg.id === 'midnight' ? '#000' : '#fff',
                      }}
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <p className="mt-2 border-t border-white/10 pt-2 text-center text-[8.5px] font-bold uppercase text-neutral-400">
            İstediğin temaya tıklayarak anında sabitleyebilirsin.
          </p>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
