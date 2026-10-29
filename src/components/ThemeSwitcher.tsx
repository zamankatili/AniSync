import React, { useState, useRef, useEffect } from 'react';
import { useThemeStore, THEME_CONFIGS, TimeThemeId } from '../store/useThemeStore';
import { useToastStore } from '../store/useToastStore';
import { Sparkles, Clock, Check, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

export const ThemeSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTheme, isAutoMode, setTheme, toggleAutoMode } = useThemeStore();
  const { addToast } = useToastStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeConfig = THEME_CONFIGS[currentTheme] || THEME_CONFIGS.noon;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTheme = (themeKey: TimeThemeId) => {
    const cfg = THEME_CONFIGS[themeKey];
    setTheme(themeKey);
    setIsOpen(false);
    addToast(`${cfg.icon} Atmosfer: ${cfg.nameTR} aktif edildi!`, 'info');
  };

  const handleToggleAuto = () => {
    const willBeAuto = !isAutoMode;
    toggleAutoMode();
    if (willBeAuto) {
      addToast('🕒 Otomatik Atmosfer Aktif: Günün saatine göre renkler değişecek.', 'info');
    } else {
      addToast('✋ Manuel Mod: Seçtiğiniz atmosfer kilitlendi.', 'info');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 md:h-12 px-2.5 md:px-3 flex items-center gap-1.5 border-2 bg-black hover:bg-neutral-900 transition-all font-black text-xs uppercase cursor-pointer"
        style={{ borderColor: activeConfig.accentColor }}
        title="Günün Saatine Göre Atmosfer & Renk Paleti"
      >
        <span className="text-base">{activeConfig.icon}</span>
        <span 
          className="w-2 h-2 rounded-full hidden sm:inline-block animate-pulse" 
          style={{ backgroundColor: activeConfig.accentColor }} 
        />
        <span className="hidden lg:inline text-[11px] text-white uppercase font-black">
          {activeConfig.nameTR.split(' ')[0]}
        </span>
        {isAutoMode ? (
          <span className="hidden sm:inline-block text-[9px] bg-amber-400 text-black px-1 font-black uppercase">
            OTO
          </span>
        ) : (
          <span 
            className="hidden sm:inline-block text-[9px] px-1 font-black uppercase border border-black"
            style={{ backgroundColor: activeConfig.accentColor, color: activeConfig.id === 'dawn' || activeConfig.id === 'midnight' ? '#000' : '#fff' }}
          >
            SABİT
          </span>
        )}
        <ChevronDown size={14} className={cn("text-neutral-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-2 w-80 bg-black border-4 border-white neo-shadow-white p-3.5 z-[9999] flex flex-col gap-3 shadow-2xl"
          style={{ borderColor: activeConfig.accentColor }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-white/20 pb-2.5">
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} style={{ color: activeConfig.accentColor }} />
                <span>GÜNÜN SAATİNE GÖRE ATMOSFER</span>
              </h4>
              <p className="text-[10px] text-neutral-400 font-bold uppercase mt-0.5">
                Sayfa renkleri ve ortam ışığını anında değiştirir
              </p>
            </div>
          </div>

          {/* Auto Mode Switch */}
          <div className="flex items-center justify-between bg-neutral-950 border-2 border-white/20 p-2.5">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-400" />
              <div>
                <span className="text-[11px] font-black uppercase text-white block">
                  Otomatik Saat Takibi
                </span>
                <span className="text-[9px] text-neutral-400 font-bold uppercase">
                  Şu anki saat: {new Date().getHours()}:00
                </span>
              </div>
            </div>
            <button
              onClick={handleToggleAuto}
              className={cn(
                "px-2.5 py-1 text-[10px] font-black uppercase border-2 transition-colors cursor-pointer",
                isAutoMode
                  ? "bg-amber-400 text-black border-black neo-shadow-white"
                  : "bg-neutral-900 text-neutral-400 border-white/30 hover:border-white"
              )}
            >
              {isAutoMode ? "AÇIK (OTO)" : "KAPALI (MANUEL)"}
            </button>
          </div>

          {/* Theme List */}
          <div className="space-y-2 pt-1">
            {(Object.keys(THEME_CONFIGS) as TimeThemeId[]).map((themeKey) => {
              const cfg = THEME_CONFIGS[themeKey];
              const isSelected = currentTheme === themeKey;

              return (
                <button
                  key={themeKey}
                  onClick={() => handleSelectTheme(themeKey)}
                  className={cn(
                    "w-full p-2.5 border-2 text-left flex items-center justify-between transition-all cursor-pointer group",
                    isSelected
                      ? "bg-white text-black border-black neo-shadow -translate-y-0.5"
                      : "bg-neutral-950 text-white border-white/20 hover:border-white"
                  )}
                  style={{
                    boxShadow: isSelected ? `4px 4px 0px 0px ${cfg.accentColor}` : undefined
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl shrink-0">{cfg.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase truncate">
                          {cfg.nameTR}
                        </span>
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0 border border-black" 
                          style={{ backgroundColor: cfg.accentColor }} 
                        />
                      </div>
                      <p className={cn("text-[10px] font-bold uppercase truncate mt-0.5", isSelected ? "text-neutral-700" : "text-neutral-400")}>
                        {cfg.timeRange} • {cfg.descriptionTR}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-black"
                      style={{ backgroundColor: cfg.accentColor, color: cfg.id === 'dawn' || cfg.id === 'midnight' ? '#000' : '#fff' }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-[9px] text-neutral-400 font-bold uppercase text-center border-t border-white/10 pt-2">
            İstediğin temaya tıklayarak anında sabitleyebilirsin.
          </div>
        </div>
      )}
    </div>
  );
};
