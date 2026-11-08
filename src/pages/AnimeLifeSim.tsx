import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { ANIME_WORLDS, getWorldById } from '../data/animeWorlds';
import { ANIME_REGIONS, getRegionsByWorld } from '../data/animeRegions';
import { getWorldLore } from '../data/lore';
import { generateLife, LifeResult, generateShareText, LIFE_FOCUSES } from '../lib/eventEngine';
import { cn } from '../lib/utils';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type Phase = 'select' | 'playing' | 'memorial';

export const AnimeLifeSim: React.FC = () => {
  const { t } = useAppTranslation();
  const [selectedWorld, setSelectedWorld] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [lifeDuration, setLifeDuration] = useState<'30min' | '1h' | '1.5h'>('1h');
  const [phase, setPhase] = useState<Phase>('select');
  const [life, setLife] = useState<LifeResult | null>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [choicesMade, setChoicesMade] = useState<Record<string, string>>({});
  const [speed, setSpeed] = useState<number>(1);
  const [savedLife, setSavedLife] = useState<LifeResult | null>(null);
  const [heavyContent, setHeavyContent] = useState<boolean>(true);
  const [period, setPeriod] = useState<'today' | 'past' | 'future'>('today');
  const [focus, setFocus] = useState<'study' | 'combat' | 'social' | 'exploration' | 'survival'>('study');
  const eduMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('edu') === '1';
  const [parallelLives, setParallelLives] = useState<LifeResult[]>([]);

  const world = selectedWorld ? getWorldById(selectedWorld) : null;
  const regions = selectedWorld ? getRegionsByWorld(selectedWorld) : [];
  const region = selectedRegion ? regions.find(r => r.id === selectedRegion) : null;

  const handleStartLife = () => {
    if (!world || !region) return;
    const includeHeavy = heavyContent && !eduMode;
    const main = generateLife(world, region, lifeDuration, { includeHeavy, period, focus });
    const parallels: LifeResult[] = [];
    for (let i = 0; i < 3; i++) {
      parallels.push(generateLife(world, region, lifeDuration, { includeHeavy, period, focus }));
    }
    setLife(main);
    setParallelLives([main, ...parallels]);
    setPhase('playing');
    playSound(440, 200, 'sine');
    setCurrentEventIndex(0);
    setChoicesMade({});
    handleClearSave();
  };

  const handleChoice = (eventId: string, choiceId: string) => {
    setChoicesMade(prev => ({ ...prev, [eventId]: choiceId }));
    playSound(660, 150, 'square');
    setTimeout(() => {
      if (life && currentEventIndex < life.events.length - 1) {
        setCurrentEventIndex(prev => prev + 1);
        playSound(550, 100, 'triangle');
      } else {
        setPhase('memorial');
        playSound(330, 500, 'sine');
      }
    }, Math.round(800 / speed));
  };

  const handleNextEvent = () => {
    if (life && currentEventIndex < life.events.length - 1) {
      setCurrentEventIndex(prev => prev + 1);
      playSound(550, 100, 'triangle');
    } else {
      setPhase('memorial');
      playSound(330, 500, 'sine');
    }
  };

  const handleRestart = () => {
    setPhase('select');
    setLife(null);
    setParallelLives([]);
    setCurrentEventIndex(0);
    setChoicesMade({});
    setSelectedWorld(null);
    setSelectedRegion(null);
  };

  const currentEvent = life?.events[currentEventIndex];

  const playSound = (freq: number, duration: number, type: OscillatorType = 'square') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = 0.1;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
      setTimeout(() => ctx.close(), duration + 100);
    } catch {
      // ignore
    }
  };

  // Load saved life from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('als_saved_life');
      if (raw) {
        const parsed = JSON.parse(raw) as LifeResult;
        setSavedLife(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist life to localStorage whenever it changes
  useEffect(() => {
    if (life && phase === 'playing') {
      try {
        localStorage.setItem('als_saved_life', JSON.stringify(life));
        localStorage.setItem('als_saved_index', String(currentEventIndex));
        localStorage.setItem('als_saved_phase', phase);
        if (world) localStorage.setItem('als_saved_world', world.id);
        if (region) localStorage.setItem('als_saved_region', region.id);
        localStorage.setItem('als_saved_duration', lifeDuration);
      } catch {
        // ignore
      }
    }
    if (phase === 'memorial' && life) {
      try {
        localStorage.setItem('als_saved_life', JSON.stringify(life));
        localStorage.setItem('als_saved_phase', 'memorial');
      } catch {
        // ignore
      }
    }
  }, [life, phase, currentEventIndex, world, region, lifeDuration]);

  const handleResume = () => {
    try {
      const raw = localStorage.getItem('als_saved_life');
      if (!raw) return;
      const parsed = JSON.parse(raw) as LifeResult;
      const idx = Number(localStorage.getItem('als_saved_index') || '0');
      const savedPhase = (localStorage.getItem('als_saved_phase') as Phase) || 'playing';
      const savedWorld = localStorage.getItem('als_saved_world');
      const savedRegion = localStorage.getItem('als_saved_region');
      const savedDuration = localStorage.getItem('als_saved_duration') as '30min' | '1h' | '1.5h' | null;
      if (savedWorld) setSelectedWorld(savedWorld);
      if (savedRegion) setSelectedRegion(savedRegion);
      if (savedDuration) setLifeDuration(savedDuration);
      setLife(parsed);
      setCurrentEventIndex(idx);
      setPhase(savedPhase);
      setSavedLife(parsed);
    } catch {
      // ignore
    }
  };

  const handleClearSave = () => {
    try {
      localStorage.removeItem('als_saved_life');
      localStorage.removeItem('als_saved_index');
      localStorage.removeItem('als_saved_phase');
      localStorage.removeItem('als_saved_world');
      localStorage.removeItem('als_saved_region');
      localStorage.removeItem('als_saved_duration');
    } catch {
      // ignore
    }
    setSavedLife(null);
  };

  const dangerLabel = (level: string) => {
    switch (level) {
      case 'low': return t('als_danger_low');
      case 'medium': return t('als_danger_medium');
      case 'high': return t('als_danger_high');
      case 'extreme': return t('als_danger_extreme');
      default: return level;
    }
  };

  const riskLabel = (risk: string) => {
    switch (risk) {
      case 'low': return t('als_risk_low');
      case 'medium': return t('als_risk_medium');
      case 'high': return t('als_risk_high');
      case 'extreme': return t('als_risk_extreme');
      default: return risk;
    }
  };

  const statLabel = (label: string) => {
    const map: Record<string, string> = {
      'Guc': t('als_stat_power'),
      'Zeka': t('als_stat_intelligence'),
      'Sans': t('als_stat_luck'),
      'Sosyal': t('als_stat_social'),
      'Saglik': t('als_stat_health'),
    };
    return map[label] || label;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <Helmet>
        <title>{t('als_page_title')}</title>
        <meta name="description" content={t('als_page_desc')} />
      </Helmet>

      {phase === 'select' && (
        <div className="space-y-6">
          {savedLife && (
            <div className="bg-amber-400/20 border-2 border-amber-400 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-amber-300 text-xs font-bold">
                {t('als_resume_available', { age: savedLife.deathAge, world: savedLife.worldId })}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleResume}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase border-2 border-white cursor-pointer"
                >
                  {t('als_resume')}
                </button>
                <button
                  onClick={handleClearSave}
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase border-2 border-white/30 cursor-pointer"
                >
                  {t('als_clear_save')}
                </button>
              </div>
            </div>
          )}
          {/* Hero */}
          <div className="bg-black border-4 border-white neo-shadow-white p-6 md:p-8 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
              <span className="text-[280px]">🌍</span>
            </div>
            <div className="relative z-10 max-w-3xl">
              <span className="bg-rose-600 text-white font-black text-xs px-2.5 py-1 border border-white uppercase tracking-wider">
                {t('als_hero_badge')}
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-3 mt-3">
                {t('als_hero_title')}
              </h1>
              <p className="text-sm md:text-base text-neutral-300 font-medium leading-relaxed mb-6">
                {t('als_hero_desc')}
              </p>
            </div>
          </div>

          {/* World Selection */}
          <div className="bg-neutral-900 border-2 border-white p-5">
            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2 mb-4">
              🌍 {t('als_world_select_title')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ANIME_WORLDS.map((w) => (
                <button
                  key={w.id}
                  onClick={() => { setSelectedWorld(w.id); setSelectedRegion(null); }}
                  className={cn(
                    "p-4 border-2 text-left transition-all cursor-pointer",
                    selectedWorld === w.id
                      ? "bg-white text-black border-white shadow-[4px_4px_0px_0px_#e11d48] -translate-y-1"
                      : "bg-black text-white border-white/20 hover:border-white hover:bg-neutral-950"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{w.emoji}</span>
                    <span className="font-black text-sm uppercase tracking-tight">{w.nameTR}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-medium leading-snug line-clamp-2">
                    {w.descriptionTR}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[10px] font-mono font-bold">
                    <span className={cn(
                      "px-1.5 py-0.5 border",
                      w.dangerLevel === 'low' ? "border-emerald-500 text-emerald-400" :
                      w.dangerLevel === 'medium' ? "border-amber-400 text-amber-300" :
                      w.dangerLevel === 'high' ? "border-rose-500 text-rose-400" :
                      "border-red-600 text-red-400"
                    )}>
                      {dangerLabel(w.dangerLevel)}
                    </span>
                    <span className="text-neutral-500">
                      {t('als_life_expectancy', { min: w.lifeExpectancy[0], max: w.lifeExpectancy[1] })}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* World Lore Panel */}
          {world && (() => {
            const lore = getWorldLore(world.id);
            if (!lore) return null;
            return (
              <div className="bg-neutral-900 border-2 border-white/30 p-5 space-y-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  {world.emoji} {world.nameTR} — Lore
                </h3>
                <p className="text-[11px] text-neutral-300 font-medium leading-snug">
                  {lore.summary}
                </p>
                <div className="text-[10px] text-neutral-400 font-mono">
                  <span className="font-black text-neutral-300">Güç Sistemi:</span> {lore.powerSystem.name}
                </div>
                <div className="text-[10px] text-neutral-400 font-mono">
                  <span className="font-black text-neutral-300">Temalar:</span> {lore.themes.join(', ')}
                </div>
                <div className="text-[10px] text-neutral-400 font-mono">
                  <span className="font-black text-neutral-300">Kaynak Seriler:</span> {lore.sourceSeries.join(', ')}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {lore.factions.slice(0, 6).map((f, i) => (
                    <span key={i} className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 border",
                      f.alignment === 'good' ? "border-emerald-500 text-emerald-400" :
                      f.alignment === 'evil' ? "border-rose-500 text-rose-400" :
                      "border-neutral-500 text-neutral-400"
                    )}>
                      {f.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Region Selection */}
          {world && (
            <div className="bg-neutral-900 border-2 border-white p-5">
              <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                {t('als_region_select_title')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {regions.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRegion(r.id)}
                    className={cn(
                      "p-3 border-2 text-left transition-all cursor-pointer",
                      selectedRegion === r.id
                        ? "bg-white text-black border-white shadow-[2px_2px_0px_0px_#e11d48]"
                        : "bg-black text-white border-white/20 hover:border-white"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{r.emoji}</span>
                      <span className="font-black text-xs uppercase tracking-tight">{r.nameTR}</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 font-medium leading-snug line-clamp-2">
                      {r.descriptionTR}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Life Duration */}
          <div className="bg-neutral-900 border-2 border-white p-5">
            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2 mb-4">
              {t('als_duration_title')}
            </h2>
            <div className="flex flex-wrap gap-3">
              {(['30min', '1h', '1.5h'] as const).map((dur) => (
                <button
                  key={dur}
                  onClick={() => setLifeDuration(dur)}
                  className={cn(
                    "px-4 py-2.5 border-2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer",
                    lifeDuration === dur
                      ? "bg-amber-400 text-black border-amber-400 shadow-[2px_2px_0px_0px_#fff]"
                      : "bg-black text-neutral-300 border-white/20 hover:border-white"
                  )}
                >
                  {dur === '30min' ? t('als_duration_30min') : dur === '1h' ? t('als_duration_1h') : t('als_duration_1_5h')}
                </button>
              ))}
            </div>
          </div>

          {/* Period Selection */}
          <div className="bg-neutral-900 border-2 border-white p-5">
            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2 mb-4">
              Doğacağın Dönem
            </h2>
            <div className="flex flex-wrap gap-3">
              {(['today', 'past', 'future'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-4 py-2.5 border-2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer",
                    period === p
                      ? "bg-amber-400 text-black border-amber-400 shadow-[2px_2px_0px_0px_#fff]"
                      : "bg-black text-neutral-300 border-white/20 hover:border-white"
                  )}
                >
                  {p === 'today' ? 'Bugün' : p === 'past' ? 'Geçmiş (1950-2025)' : 'Gelecek (2027-2050)'}
                </button>
              ))}
            </div>
          </div>

          {/* Focus Selection */}
          <div className="bg-neutral-900 border-2 border-white p-5">
            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2 mb-4">
              Hayat Odakın
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {LIFE_FOCUSES.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFocus(f.id)}
                  className={cn(
                    "p-3 border-2 text-left transition-all cursor-pointer",
                    focus === f.id
                      ? "bg-white text-black border-white shadow-[2px_2px_0px_0px_#e11d48]"
                      : "bg-black text-white border-white/20 hover:border-white"
                  )}
                >
                  <span className="font-black text-xs uppercase tracking-tight block">{f.label}</span>
                  <span className="text-[10px] text-neutral-400 font-medium leading-snug">{f.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ethical Mode Toggle */}
          <div className="bg-neutral-900 border-2 border-white/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white uppercase tracking-wider">15+ / Etik Mod</span>
              <span className="text-[10px] text-neutral-400 font-medium">
                {eduMode ? 'Eğitim modu aktif: ağır temalar kapalı.' : 'Ağır konular (savaş/şiddet) filtrelenir.'}
              </span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={heavyContent && !eduMode}
                onChange={(e) => setHeavyContent(e.target.checked)}
                disabled={eduMode}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-bold text-neutral-300">Ağır konuları göster</span>
            </label>
          </div>

          {/* Start Button */}
          {selectedWorld && selectedRegion && (
            <button
              onClick={handleStartLife}
              className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase text-sm tracking-widest border-4 border-white neo-shadow-white flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {t('als_start_button')}
            </button>
          )}
        </div>
      )}

      {phase === 'playing' && life && currentEvent && (
        <div className="space-y-6 relative">
          {/* Progress Bar */}
          <div className="bg-black border-4 border-white neo-shadow-white p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                {t('als_progress_world_region', { world: world?.nameTR, region: region?.nameTR })} · {life?.gender === 'female' ? '♀' : '♂'} · {life?.period === 'past' ? 'Geçmiş' : life?.period === 'future' ? 'Gelecek' : 'Bugün'}
              </span>
              <span className="text-xs font-mono font-bold text-neutral-400">
                {t('als_progress_age', { age: currentEvent.age, deathAge: life.deathAge, unit: t('als_years_unit') })}
              </span>
            </div>
            <div className="w-full h-3 bg-neutral-900 border-2 border-white overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-600 via-amber-400 to-emerald-500 transition-all duration-500"
                style={{ width: `${(currentEventIndex / (life.events.length - 1)) * 100}%` }}
              />
            </div>
            <div className="mt-2 text-[10px] text-neutral-500 font-mono">
              {t('als_progress_events', { current: currentEventIndex + 1, total: life.events.length })}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] text-neutral-400 font-black uppercase">{t('als_speed')}</span>
              {[1, 2, 4, 8, 16].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={cn(
                    "px-2 py-1 text-[10px] font-black border cursor-pointer",
                    speed === s
                      ? "bg-amber-400 text-black border-amber-400"
                      : "bg-black text-neutral-300 border-white/20 hover:border-white"
                  )}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Character Profile */}
          {life && (
            <div className="bg-neutral-900 border-2 border-white/30 p-4 flex flex-wrap items-center gap-3 text-[10px] font-mono">
              <span className="text-white font-black text-sm">{life.characterName}</span>
              <span className="text-neutral-400">|</span>
              <span className="text-neutral-300">{life.gender === 'female' ? '♀' : '♂'}</span>
              <span className="text-neutral-400">|</span>
              <span className="text-neutral-300">{life.familyStatus === 'poor' ? 'Yoksul' : life.familyStatus === 'noble' ? 'Soylu' : 'Orta halli'} aile</span>
              <span className="text-neutral-400">|</span>
              <span className="text-neutral-300">Eğitim: {life.education === 'none' ? 'Yok' : life.education === 'basic' ? 'Temel' : life.education === 'high' ? 'Lise' : 'Üniversite'}</span>
              <span className="text-neutral-400">|</span>
              <span className="text-amber-400 font-bold">💰 {life.assets}</span>
            </div>
          )}

          {/* Event Card */}
          <div className="bg-neutral-900 border-4 border-white p-6 md:p-8 neo-shadow-white space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">
                {currentEvent.type === 'birth' ? '👶' :
                 currentEvent.type === 'childhood' ? '🧒' :
                 currentEvent.type === 'faction' ? '⚔️' :
                 currentEvent.type === 'crisis' ? '⚠️' :
                 currentEvent.type === 'special' ? '✨' :
                 currentEvent.type === 'death' ? '💀' : '📖'}
              </span>
              <div>
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                  {currentEvent.title}
                </h3>
                <span className="text-[10px] text-neutral-400 font-mono font-bold">
                  {t('als_event_age', { age: currentEvent.age, year: currentEvent.year })}
                </span>
              </div>
            </div>

            <p className="text-sm text-neutral-200 font-medium leading-relaxed">
              {currentEvent.description}
            </p>

            {currentEvent.isCanonEncounter && (
              <div className="bg-amber-400/20 border-2 border-amber-400 p-3 text-amber-300 text-xs font-bold">
                {t('als_canon_encounter', { char: currentEvent.canonCharacter })}
              </div>
            )}

            {currentEvent.choices && currentEvent.choices.length > 0 && !choicesMade[currentEvent.id] && (
              <div className="space-y-3 mt-4">
                <p className="text-xs text-neutral-400 font-black uppercase tracking-wider">
                  {t('als_choice_prompt')}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {currentEvent.choices.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => handleChoice(currentEvent.id, choice.id)}
                      className={cn(
                        "p-4 border-2 text-left transition-all cursor-pointer",
                        "bg-black text-white border-white/30 hover:border-amber-400 hover:bg-neutral-950"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black text-sm uppercase tracking-tight">{choice.label}</span>
                        <span className={cn(
                          "text-[9px] font-black uppercase px-1.5 py-0.5 border",
                          choice.risk === 'low' ? "border-emerald-500 text-emerald-400" :
                          choice.risk === 'medium' ? "border-amber-400 text-amber-300" :
                          choice.risk === 'high' ? "border-rose-500 text-rose-400" :
                          "border-red-600 text-red-400"
                        )}>
                          {riskLabel(choice.risk)}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 font-medium leading-snug">
                        {choice.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {choicesMade[currentEvent.id] && (
              <div className="bg-emerald-950/40 border-2 border-emerald-500/50 p-3 text-emerald-300 text-xs font-bold">
                {t('als_choice_made')}
              </div>
            )}

            {!currentEvent.choices && (
              <button
                onClick={handleNextEvent}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-sm border-4 border-white flex items-center justify-center gap-2 transition-all cursor-pointer neo-shadow-white"
              >
                {t('als_continue')}
              </button>
            )}
          </div>

          {/* Stats Panel */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { label: 'Guc', value: life.finalStats.power, color: 'text-rose-400' },
              { label: 'Zeka', value: life.finalStats.intelligence, color: 'text-cyan-400' },
              { label: 'Sans', value: life.finalStats.luck, color: 'text-amber-400' },
              { label: 'Sosyal', value: life.finalStats.socialClass, color: 'text-emerald-400' },
              { label: 'Saglik', value: life.finalStats.health, color: 'text-purple-400' }
            ].map((stat) => (
              <div key={stat.label} className="bg-neutral-900 border border-white/20 p-2 text-center">
                <span className="text-[9px] font-black text-neutral-500 uppercase block">{statLabel(stat.label)}</span>
                <span className={`text-sm font-black font-mono ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'memorial' && life && (
        <div className="space-y-6">
          {/* Memorial Card */}
          <div className="bg-black border-4 border-white neo-shadow-white p-6 md:p-8">
            <div className="text-center mb-6">
              <span className="text-6xl mb-4 block">{world?.emoji}</span>
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-2">
                {t('als_memorial_title')}
              </h2>
              <p className="text-neutral-400 font-bold text-sm">
                {t('als_memorial_desc')}
              </p>
            </div>

            <div className="bg-neutral-950 border-2 border-white/20 p-4 md:p-6 font-mono text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed">
              {life.memorialText}
            </div>

            {/* Achievements */}
            {life.achievements.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-black text-white uppercase tracking-wider mb-3">
                  {t('als_achievements_title')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {life.achievements.map((ach, idx) => (
                    <span key={idx} className="bg-amber-400 text-black font-black text-[10px] px-2.5 py-1 border border-black uppercase tracking-wider">
                      {ach}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Canon Encounters */}
            {life.isCanonEncountered && (
              <div className="mt-6 bg-amber-400/20 border-2 border-amber-400 p-4">
                <h3 className="text-lg font-black text-amber-400 uppercase tracking-wider mb-2">
                  {t('als_canon_encounters_title')}
                </h3>
                <p className="text-xs text-neutral-300 font-bold">
                  {t('als_canon_encounters_desc', { list: life.canonEncounters.join(', ') })}
                </p>
              </div>
            )}

            {/* Parallel Lives */}
            {parallelLives.length > 0 && (
              <div className="mt-6 bg-neutral-950 border-2 border-white/20 p-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-3">
                  {t('als_parallel_title')}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {parallelLives.map((pl, idx) => (
                    <div key={idx} className={cn(
                      "bg-black border p-2 text-center",
                      idx === 0 ? "border-amber-400" : "border-white/20"
                    )}>
                      <span className="text-[9px] font-black text-neutral-500 uppercase block">
                        {idx === 0 ? t('als_parallel_you') : t('als_parallel_baby', { n: idx + 1 })}
                      </span>
                      <span className="text-lg font-black font-mono text-white block">{pl.deathAge}</span>
                      <span className="text-[9px] text-neutral-400 block">{pl.deathCause}</span>
                      <div className="mt-1 text-[8px] text-neutral-500 font-mono">
                        G:{pl.finalStats.power} Z:{pl.finalStats.intelligence} Ş:{pl.finalStats.luck}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={async () => {
                  const text = generateShareText(life, world!, region!);
                  if (navigator.share) {
                    try {
                      await navigator.share({ title: t('als_page_title'), text });
                      return;
                    } catch {
                      // fall through
                    }
                  }
                  navigator.clipboard.writeText(text);
                }}
                className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-sm border-4 border-white flex items-center justify-center gap-2 transition-all cursor-pointer neo-shadow-white"
              >
                {t('als_copy_result')}
              </button>
              <button
                onClick={() => {
                  if (!life || !world || !region) return;
                  const canvas = document.createElement('canvas');
                  canvas.width = 600;
                  canvas.height = 400;
                  const ctx = canvas.getContext('2d');
                  if (!ctx) return;
                  ctx.fillStyle = '#000';
                  ctx.fillRect(0, 0, 600, 400);
                  ctx.strokeStyle = '#fff';
                  ctx.lineWidth = 4;
                  ctx.strokeRect(8, 8, 584, 384);
                  ctx.fillStyle = '#e11d48';
                  ctx.fillRect(8, 8, 584, 40);
                  ctx.fillStyle = '#fff';
                  ctx.font = 'bold 20px monospace';
                  ctx.fillText('ANIME LIFE SIMULATION', 20, 34);
                  ctx.fillStyle = '#fff';
                  ctx.font = 'bold 14px monospace';
                  ctx.fillText(`${world.emoji} ${world.nameTR} - ${region.nameTR}`, 20, 70);
                  ctx.fillText(`Yas: ${life.deathAge} | Neden: ${life.deathCause}`, 20, 95);
                  ctx.fillText(`Guc: ${life.finalStats.power}  Zeka: ${life.finalStats.intelligence}  Sans: ${life.finalStats.luck}`, 20, 120);
                  ctx.fillText(`Sosyal: ${life.finalStats.socialClass}  Saglik: ${life.finalStats.health}`, 20, 145);
                  if (life.achievements.length > 0) {
                    ctx.fillText(`Basarilar: ${life.achievements.slice(0, 3).join(', ')}`, 20, 175);
                  }
                  if (life.isCanonEncountered) {
                    ctx.fillStyle = '#fbbf24';
                    ctx.fillText(`Kanon: ${life.canonEncounters.join(', ')}`, 20, 200);
                  }
                  ctx.fillStyle = '#666';
                  ctx.font = '10px monospace';
                  ctx.fillText('AniSync 8 Milyar Evrende 1', 20, 380);
                  canvas.toBlob((blob) => {
                    if (!blob) return;
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'anime-life-sim.png';
                    a.click();
                    URL.revokeObjectURL(url);
                  });
                }}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-sm border-4 border-white flex items-center justify-center gap-2 transition-all cursor-pointer neo-shadow-white"
              >
                {t('als_download_card')}
              </button>
              <button
                onClick={async () => {
                  const user = auth.currentUser;
                  if (!user || !life || !world || !region) return;
                  try {
                    await addDoc(collection(db, 'recentActivities'), {
                      userId: user.uid,
                      userName: user.displayName || 'AniSync User',
                      userAvatar: user.photoURL || null,
                      animeId: 'anime-life-sim',
                      animeTitle: `Anime Life Sim: ${world.nameTR} - ${region.nameTR}`,
                      animeImage: null,
                      actionType: 'life_sim_completed',
                      deathAge: life.deathAge,
                      deathCause: life.deathCause,
                      world: world.id,
                      region: region.id,
                      createdAt: serverTimestamp()
                    });
                  } catch (e) {
                    console.warn('Could not share life sim result:', e);
                  }
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-sm border-4 border-white flex items-center justify-center gap-2 transition-all cursor-pointer neo-shadow-white"
              >
                TOPLULUKTA PAYLAŞ
              </button>
              <button
                onClick={handleRestart}
                className="flex-1 py-3 bg-black hover:bg-neutral-800 text-white font-black uppercase text-sm border-4 border-white/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {t('als_new_life')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};