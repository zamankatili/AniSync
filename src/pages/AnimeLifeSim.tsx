import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { ANIME_WORLDS, getWorldById } from '../data/animeWorlds';
import { ANIME_REGIONS, getRegionsByWorld, getRegionById } from '../data/animeRegions';
import type { AnimeRegion } from '../data/animeRegions';
import { getWorldLore } from '../data/lore';
import {
  generateLife,
  LifeResult,
  generateShareText,
  generateMemorialText,
  LIFE_FOCUSES,
  computeStatsAt,
  computeAssetsAt,
  computeWorldFidelity,
  getEducationTier,
  getFamilyStatus,
} from '../lib/eventEngine';
import { cn } from '../lib/utils';
import { useToastStore } from '../store/useToastStore';
import { MemorialBoardModal } from '../components/MemorialBoardModal';
import { exportLifeCode, importLifeCode, collectSavedLifePayload, applyLifePayload } from '../lib/lifeTransfer';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type Phase = 'select' | 'playing' | 'memorial';

interface PastLife {
  id: string;
  name: string;
  worldId: string;
  regionId: string;
  age: number;
  year: number;
  cause: string;
  date: number;
  power: number;
  intelligence: number;
  luck: number;
  socialClass: number;
  health: number;
}

export const AnimeLifeSim: React.FC = () => {
  const { t, currentLang } = useAppTranslation();
  const navigate = useNavigate();
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
  const [ageConfirmed, setAgeConfirmed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const edu = new URLSearchParams(window.location.search).get('edu') === '1';
    return edu || localStorage.getItem('als_age_ok') === '1';
  });
  const [parallelLives, setParallelLives] = useState<LifeResult[]>([]);
  const [savedLifeIndex, setSavedLifeIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [showEvent, setShowEvent] = useState(true);
  const [showBirthSummary, setShowBirthSummary] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [regionDetail, setRegionDetail] = useState<AnimeRegion | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [lifeAge, setLifeAge] = useState(0);
  const [autoDecide, setAutoDecide] = useState<boolean>(() => {
    try { return localStorage.getItem('als_auto_decide') === '1'; } catch { return false; }
  });
  const [autoSecondsLeft, setAutoSecondsLeft] = useState<number | null>(null);
  const [showBoard, setShowBoard] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferInput, setTransferInput] = useState('');
  const [transferBusy, setTransferBusy] = useState(false);
  const [pastLives, setPastLives] = useState<PastLife[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const recordedLifeRef = useRef<string | null>(null);
  const sessionStartRef = useRef(Date.now());
  const lastBreakRef = useRef(0);
  const addToast = useToastStore((s) => s.addToast);

  const DURATION_MS: Record<'30min' | '1h' | '1.5h', number> = {
    '30min': 30 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '1.5h': 90 * 60 * 1000,
  };

  const world = selectedWorld ? getWorldById(selectedWorld) : null;
  const regions = selectedWorld ? getRegionsByWorld(selectedWorld) : [];
  const region = selectedRegion ? regions.find(r => r.id === selectedRegion) : null;

  const isTr = currentLang === 'tr';
  const pick4 = (tr: string, en: string, ja: string | undefined, fr: string | undefined) =>
    currentLang.startsWith('tr') ? tr : currentLang.startsWith('ja') ? (ja || en) : currentLang.startsWith('fr') ? (fr || en) : en;
  const worldName = (w: { nameTR: string; nameEN: string }) => (isTr ? w.nameTR : w.nameEN);
  const worldDesc = (w: { descriptionTR: string; descriptionEN: string; descriptionJA?: string; descriptionFR?: string }) => pick4(w.descriptionTR, w.descriptionEN, w.descriptionJA, w.descriptionFR);
  const regionName = (r: { nameTR: string; nameEN: string }) => (isTr ? r.nameTR : r.nameEN);
  const regionDesc = (r: { descriptionTR: string; descriptionEN: string; descriptionJA?: string; descriptionFR?: string }) => pick4(r.descriptionTR, r.descriptionEN, r.descriptionJA, r.descriptionFR);

  const familyLabel = (status: LifeResult['familyStatus']) =>
    status === 'poor' ? t('als_family_poor') : status === 'noble' ? t('als_family_noble') : t('als_family_middle');
  const educationLabel = (tier: LifeResult['education']) =>
    tier === 'none' ? t('als_education_none') :
    tier === 'basic' ? t('als_education_basic') :
    tier === 'high' ? t('als_education_high') : t('als_education_university');

  const savedWorldData = savedLife ? getWorldById(savedLife.worldId) : null;
  const savedAge = savedLife
    ? (savedLifeIndex > 0 ? savedLife.events[Math.min(savedLifeIndex, savedLife.events.length - 1)]?.age ?? 0 : 0)
    : 0;
  const displayName = life?.characterName?.trim() || t('als_unnamed');

  const startLifeWith = (w: NonNullable<typeof world>, r: NonNullable<typeof region>) => {
    const includeHeavy = heavyContent && !eduMode;
    const main = generateLife(w, r, lifeDuration, { includeHeavy, period, focus });
    const parallels: LifeResult[] = [];
    for (let i = 0; i < 3; i++) {
      parallels.push(generateLife(w, r, lifeDuration, { includeHeavy, period, focus }));
    }
    setLife(main);
    setParallelLives([main, ...parallels]);
    setPhase('playing');
    playSound(440, 200, 'sine');
    setCurrentEventIndex(0);
    setChoicesMade({});
    setLifeAge(0);
    setShowEvent(true);
    setIsPaused(false);
    setShowBirthSummary(true);
    setShowTimeline(false);
    recordedLifeRef.current = null;
    handleClearSave();
  };

  const handleStartLife = () => {
    if (!world || !region) return;
    startLifeWith(world, region);
  };

  /** Referanstaki gibi: nerede doğacağını seçemezsin. Ağırlık = yıllık doğum sayısı. */
  const handleRandomBirth = () => {
    const weights = ANIME_REGIONS.map(r => Math.max(1, r.population * r.birthRate));
    const total = weights.reduce((sum, w) => sum + w, 0);
    let roll = Math.random() * total;
    let picked = ANIME_REGIONS[ANIME_REGIONS.length - 1];
    for (let i = 0; i < ANIME_REGIONS.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        picked = ANIME_REGIONS[i];
        break;
      }
    }
    const pickedWorld = getWorldById(picked.worldId);
    if (!pickedWorld) return;
    setSelectedWorld(picked.worldId);
    setSelectedRegion(picked.id);
    startLifeWith(pickedWorld, picked);
  };

  const handleChoice = (eventId: string, choiceId: string) => {
    setChoicesMade(prev => ({ ...prev, [eventId]: choiceId }));
    playSound(660, 150, 'square');
  };

  const handleNextEvent = () => {
    if (!life) return;
    if (currentEventIndex >= life.events.length - 1) {
      setPhase('memorial');
      playSound(330, 500, 'sine');
      return;
    }
    setLifeAge(prev => Math.max(prev, life.events[currentEventIndex].age));
    setShowEvent(false);
    setIsPaused(false);
    playSound(550, 100, 'triangle');
  };

  const handleSkipToNext = () => {
    if (!life) return;
    const next = life.events[currentEventIndex + 1];
    if (!next) return;
    setLifeAge(next.age);
  };

  const handleRestart = () => {
    setPhase('select');
    setLife(null);
    setParallelLives([]);
    setCurrentEventIndex(0);
    setChoicesMade({});
    setSelectedWorld(null);
    setSelectedRegion(null);
    setLifeAge(0);
    setShowEvent(true);
    setIsPaused(false);
    setShowBirthSummary(false);
    setShowTimeline(false);
  };

  const currentEvent = life?.events[currentEventIndex];
  const currentStats = life ? computeStatsAt(life, currentEventIndex, choicesMade) : null;
  const currentAssets = life && currentStats ? computeAssetsAt(life, currentStats) : life?.assets ?? 0;
  const finalLifeStats = life ? computeStatsAt(life, life.events.length - 1, choicesMade) : null;
  const worldFidelity = life ? computeWorldFidelity(life) : 0;

  // Anma metni, oyuncu seçimlerinin etkisini de yansıtsın.
  const memorialText = useMemo(() => {
    if (!life || !world || !region || !finalLifeStats) return life?.memorialText ?? '';
    return generateMemorialText(
      world,
      region,
      life.birthYear,
      life.deathAge,
      life.deathCause,
      finalLifeStats,
      life.events,
      life.gender,
      life.period,
      displayName,
      getFamilyStatus(finalLifeStats.socialClass),
      getEducationTier(finalLifeStats.intelligence),
      computeAssetsAt(life, finalLifeStats)
    );
  }, [life, world, region, finalLifeStats, displayName]);

  const playSound = (freq: number, duration: number, type: OscillatorType = 'square') => {
    if (muted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioCtxRef.current ?? new AudioCtx();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.value = 0.1;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
    } catch {
      // ignore
    }
  };

  // ── Yaşam saati: seçilen süre gerçek oynanış süresini belirler ──
  // Olaylar arasında yaş otomatik ilerler; olay kartı açıkken saat durur.
  useEffect(() => {
    if (phase !== 'playing' || !life || isPaused || showEvent) return;
    const target = life.events[currentEventIndex + 1]?.age;
    if (target === undefined) return;
    const totalMs = DURATION_MS[lifeDuration];
    const yearsPerMs = life.deathAge > 0 ? life.deathAge / totalMs : 0;
    const tickMs = 100;
    const id = window.setInterval(() => {
      setLifeAge(prev => {
        const next = prev + yearsPerMs * tickMs * speed;
        return next >= target ? target : next;
      });
    }, tickMs);
    return () => window.clearInterval(id);
  }, [phase, life, isPaused, showEvent, currentEventIndex, lifeDuration, speed]);

  // Yaş hedefe ulaşınca sıradaki olayı göster.
  useEffect(() => {
    if (phase !== 'playing' || !life || showEvent) return;
    const next = life.events[currentEventIndex + 1];
    if (next && lifeAge >= next.age) {
      setCurrentEventIndex(currentEventIndex + 1);
      setLifeAge(next.age);
      setShowEvent(true);
      playSound(550, 100, 'triangle');
    }
  }, [lifeAge, phase, life, showEvent, currentEventIndex]);

  // Otomatik karar: açıkken seçim olaylarında 8 saniye bekler ve güvenli seçimi yapar.
  useEffect(() => {
    if (phase !== 'playing' || !life || !showEvent || !autoDecide) {
      setAutoSecondsLeft(null);
      return;
    }
    const event = life.events[currentEventIndex];
    if (!event || !event.choices || event.choices.length === 0 || choicesMade[event.id]) {
      setAutoSecondsLeft(null);
      return;
    }
    let seconds = 8;
    setAutoSecondsLeft(seconds);
    const id = window.setInterval(() => {
      seconds -= 1;
      if (seconds <= 0) {
        window.clearInterval(id);
        setAutoSecondsLeft(0);
        setChoicesMade(prevChoices => {
          if (prevChoices[event.id]) return prevChoices;
          let pick: string | undefined;
          if (event.id.startsWith('focus_') && life.focus) {
            pick = event.choices!.find(c => c.id === `focus_${life.focus}`)?.id;
          }
          if (!pick) {
            const order = { low: 0, medium: 1, high: 2, extreme: 3 } as const;
            pick = [...event.choices!].sort((a, b) => order[a.risk] - order[b.risk])[0]?.id;
          }
          return pick ? { ...prevChoices, [event.id]: pick } : prevChoices;
        });
        if (typeof window !== 'undefined') playSound(660, 150, 'square');
      } else {
        setAutoSecondsLeft(seconds);
      }
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, life, showEvent, autoDecide, currentEventIndex, choicesMade]);

  // Uzun oturumlarda mola hatırlatması (referanstaki 2+ saat davranışı).
  useEffect(() => {
    const id = window.setInterval(() => {
      const elapsed = Date.now() - sessionStartRef.current;
      if (elapsed >= 2 * 60 * 60 * 1000 && Date.now() - lastBreakRef.current >= 2 * 60 * 60 * 1000) {
        lastBreakRef.current = Date.now();
        addToast(t('als_break_reminder'), 'info');
      }
    }, 5 * 60 * 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load saved life from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('als_saved_life');
      if (raw) {
        const parsed = JSON.parse(raw) as LifeResult;
        setSavedLife(parsed);
        setSavedLifeIndex(Number(localStorage.getItem('als_saved_index') || '0'));
      }
      const historyRaw = localStorage.getItem('als_past_lives');
      if (historyRaw) {
        const history = JSON.parse(historyRaw) as PastLife[];
        if (Array.isArray(history)) setPastLives(history);
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
        localStorage.setItem('als_saved_choices', JSON.stringify(choicesMade));
        localStorage.setItem('als_saved_parallels', JSON.stringify(parallelLives));
        localStorage.setItem('als_saved_schema', '2');
        localStorage.setItem('als_saved_lifeage', String(lifeAge));
        localStorage.setItem('als_saved_showevent', showEvent ? '1' : '0');
        localStorage.setItem('als_saved_paused', isPaused ? '1' : '0');
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
        localStorage.setItem('als_saved_choices', JSON.stringify(choicesMade));
        localStorage.setItem('als_saved_parallels', JSON.stringify(parallelLives));
        localStorage.setItem('als_saved_schema', '2');
      } catch {
        // ignore
      }
    }
  }, [life, phase, currentEventIndex, world, region, lifeDuration, choicesMade, parallelLives]);

  // Tamamlanan hayatları geçmişe kaydet (en fazla 20).
  useEffect(() => {
    if (phase !== 'memorial' || !life) return;
    const id = `${life.birthYear}-${life.deathAge}-${life.characterName}`;
    if (recordedLifeRef.current === id) return;
    recordedLifeRef.current = id;
    const stats = computeStatsAt(life, life.events.length - 1, choicesMade);
    const entry: PastLife = {
      id,
      name: life.characterName,
      worldId: life.worldId,
      regionId: life.regionId,
      age: life.deathAge,
      year: life.deathYear,
      cause: life.deathCause,
      date: Date.now(),
      power: stats.power,
      intelligence: stats.intelligence,
      luck: stats.luck,
      socialClass: stats.socialClass,
      health: stats.health,
    };
    setPastLives(prev => {
      const next = [entry, ...prev.filter(p => p.id !== id)].slice(0, 20);
      try {
        localStorage.setItem('als_past_lives', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, [phase, life, choicesMade]);

  const handleClearHistory = () => {
    try {
      localStorage.removeItem('als_past_lives');
    } catch {
      // ignore
    }
    setPastLives([]);
  };

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
      let savedChoices: Record<string, string> = {};
      let savedParallels: LifeResult[] = [];
      try {
        savedChoices = JSON.parse(localStorage.getItem('als_saved_choices') || '{}');
        savedParallels = JSON.parse(localStorage.getItem('als_saved_parallels') || '[]');
      } catch {
        // eski kayıt: seçim/paralel verisi yok
      }
      if (savedWorld) setSelectedWorld(savedWorld);
      if (savedRegion) setSelectedRegion(savedRegion);
      if (savedDuration) setLifeDuration(savedDuration);
      setLife(parsed);
      setCurrentEventIndex(idx);
      setSavedLifeIndex(idx);
      setChoicesMade(savedChoices || {});
      setParallelLives(Array.isArray(savedParallels) ? savedParallels : []);
      const savedAgeRaw = Number(localStorage.getItem('als_saved_lifeage') || 'NaN');
      const eventAge = parsed.events[Math.min(idx, parsed.events.length - 1)]?.age ?? 0;
      setLifeAge(Number.isFinite(savedAgeRaw) ? Math.max(savedAgeRaw, eventAge) : eventAge);
      setShowEvent(localStorage.getItem('als_saved_showevent') !== '0');
      setIsPaused(localStorage.getItem('als_saved_paused') === '1');
      setPhase(savedPhase);
      setSavedLife(parsed);
      setShowBirthSummary(false);
      setShowTimeline(false);
      if (savedPhase === 'memorial') {
        recordedLifeRef.current = `${parsed.birthYear}-${parsed.deathAge}-${parsed.characterName}`;
      }
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
      localStorage.removeItem('als_saved_choices');
      localStorage.removeItem('als_saved_parallels');
      localStorage.removeItem('als_saved_schema');
    } catch {
      // ignore
    }
    setSavedLife(null);
  };

  const handleTransferExport = async () => {
    setTransferBusy(true);
    try {
      const payload = collectSavedLifePayload();
      if (!payload) {
        addToast(t('als_transfer_empty'), 'info');
        return;
      }
      const code = await exportLifeCode(payload);
      try {
        await navigator.clipboard.writeText(code);
        addToast(t('als_transfer_exported'), 'success');
      } catch {
        // Pano izni yok → kodu içe aktarma kutusuna koy, kullanıcı elle kopyalasın
        setTransferInput(code);
        setShowTransfer(true);
        addToast(t('als_transfer_exported'), 'success');
      }
    } catch (err) {
      console.warn('Transfer export failed:', err);
      addToast(t('als_transfer_invalid'), 'error');
    } finally {
      setTransferBusy(false);
    }
  };

  const handleTransferImport = async () => {
    const code = transferInput.trim();
    if (!code) return;
    setTransferBusy(true);
    try {
      const payload = await importLifeCode(code);
      applyLifePayload(payload);
      setTransferInput('');
      handleResume();
      addToast(t('als_transfer_imported'), 'success');
    } catch (err) {
      console.warn('Transfer import failed:', err);
      addToast(t('als_transfer_invalid'), 'error');
    } finally {
      setTransferBusy(false);
    }
  };

  const handleAddToBoard = async () => {
    if (!life || !world || !region) return;
    if (!auth.currentUser) {
      addToast(t('als_board_failed'), 'info');
      return;
    }
    const finalStats = computeStatsAt(life, life.events.length - 1, choicesMade);
    try {
      await addDoc(collection(db, 'sharedLives'), {
        userId: auth.currentUser.uid,
        characterName: displayName,
        worldEmoji: world.emoji,
        worldNameTR: world.nameTR,
        worldNameEN: world.nameEN,
        regionNameTR: region.nameTR,
        regionNameEN: region.nameEN,
        deathAge: life.deathAge,
        birthYear: life.birthYear,
        deathCause: life.deathCause,
        power: finalStats.power,
        intelligence: finalStats.intelligence,
        luck: finalStats.luck,
        socialClass: finalStats.socialClass,
        health: finalStats.health,
        eventsCount: life.events.length,
        candles: 0,
        createdAt: serverTimestamp(),
      });
      addToast(t('als_board_added'), 'success');
    } catch (err) {
      console.warn('Board add failed:', err);
      addToast(t('als_board_failed'), 'error');
    }
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

  const statDeltaLabel = (key: string) => {
    const map: Record<string, string> = {
      power: t('als_stat_power'),
      intelligence: t('als_stat_intelligence'),
      luck: t('als_stat_luck'),
      socialClass: t('als_stat_social'),
      health: t('als_stat_health'),
    };
    return map[key] || key;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <Helmet>
        <title>{t('als_page_title')}</title>
        <meta name="description" content={t('als_page_desc')} />
      </Helmet>

      {phase === 'select' && (
        <div className="space-y-6">
          {!ageConfirmed && (
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-neutral-950 border-4 border-white neo-shadow-white p-6 space-y-4">
                <span className="inline-block bg-rose-600 text-white font-black text-[10px] px-2 py-1 border border-white uppercase tracking-wider">
                  {t('als_age_gate_badge')}
                </span>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                  {t('als_age_gate_title')}
                </h2>
                <p className="text-xs text-neutral-300 font-medium leading-relaxed">
                  {t('als_age_gate_desc')}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    onClick={() => {
                      try {
                        localStorage.setItem('als_age_ok', '1');
                      } catch {
                        // ignore
                      }
                      setAgeConfirmed(true);
                    }}
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase text-xs border-2 border-white cursor-pointer"
                  >
                    {t('als_age_gate_confirm')}
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="flex-1 py-3 bg-black hover:bg-neutral-800 text-neutral-300 font-black uppercase text-xs border-2 border-white/30 cursor-pointer"
                  >
                    {t('als_age_gate_leave')}
                  </button>
                </div>
              </div>
            </div>
          )}
          {savedLife && (
            <div className="bg-amber-400/20 border-2 border-amber-400 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-amber-300 text-xs font-bold">
                {t('als_resume_available_v2', {
                  name: savedLife.characterName?.trim() || t('als_unnamed'),
                  age: savedAge,
                  world: savedWorldData ? worldName(savedWorldData) : savedLife.worldId,
                })}
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
          {/* Anma Defteri + Kayıt Taşıma */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowBoard(true)}
              className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-amber-400 font-black uppercase text-xs border-2 border-amber-400/60 hover:border-amber-400 cursor-pointer flex items-center gap-2"
            >
              🕯️ {t('als_board_title')}
            </button>
            <button
              onClick={() => setShowTransfer(v => !v)}
              className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white font-black uppercase text-xs border-2 border-white/20 hover:border-white cursor-pointer flex items-center gap-2"
              aria-expanded={showTransfer}
            >
              🎒 {t('als_transfer_title')}
            </button>
          </div>

          {showTransfer && (
            <div className="bg-neutral-900 border-2 border-white/20 p-4 space-y-3">
              <p className="text-[11px] text-neutral-400 font-bold">{t('als_transfer_desc')}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleTransferExport}
                  disabled={transferBusy}
                  className="px-4 py-2 bg-white hover:bg-amber-400 text-black font-black uppercase text-xs border-2 border-white cursor-pointer disabled:opacity-50"
                >
                  {t('als_transfer_export')}
                </button>
              </div>
              <textarea
                value={transferInput}
                onChange={(e) => setTransferInput(e.target.value)}
                placeholder={t('als_transfer_placeholder')}
                rows={2}
                className="w-full bg-black border-2 border-white/20 focus:border-amber-400 text-white text-[10px] font-mono p-2 outline-none resize-none"
                spellCheck={false}
              />
              <button
                onClick={handleTransferImport}
                disabled={transferBusy || !transferInput.trim()}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-black uppercase text-xs border-2 border-white/30 hover:border-white cursor-pointer disabled:opacity-50"
              >
                {t('als_transfer_import')}
              </button>
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

          {/* Random birth — reference-style primary action */}
          <div className="bg-rose-950/30 border-2 border-rose-500 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider">
                {t('als_random_birth_title')}
              </h2>
              <p className="text-[11px] text-neutral-300 font-medium leading-snug mt-1 max-w-2xl">
                {t('als_random_birth_desc')}
              </p>
            </div>
            <button
              onClick={handleRandomBirth}
              className="shrink-0 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase text-sm tracking-widest border-4 border-white neo-shadow-white transition-all cursor-pointer"
            >
              {t('als_random_birth_button')}
            </button>
          </div>

          {/* Past lives */}
          {pastLives.length > 0 && (
            <div className="bg-neutral-900 border-2 border-white/30 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-black text-white uppercase tracking-wider">
                  {t('als_past_lives_title', { count: pastLives.length })}
                </h2>
                <button
                  onClick={handleClearHistory}
                  className="px-3 py-1 bg-black hover:bg-neutral-800 text-neutral-400 hover:text-white font-black text-[10px] uppercase border border-white/20 cursor-pointer"
                >
                  {t('als_past_lives_clear')}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pastLives.map((entry) => {
                  const w = getWorldById(entry.worldId);
                  const r = getRegionById(entry.regionId);
                  return (
                    <div key={entry.id + entry.date} className="bg-black border border-white/20 p-3 text-[10px] font-mono">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-white font-black text-xs truncate">
                          {w?.emoji} {entry.name}
                        </span>
                        <span className="text-amber-400 font-black shrink-0">{entry.age} {t('als_years_unit')}</span>
                      </div>
                      <div className="text-neutral-400 mt-1 truncate">
                        {w ? worldName(w) : entry.worldId} · {r ? regionName(r) : entry.regionId}
                      </div>
                      <div className="text-neutral-500 mt-0.5 truncate">
                        {entry.cause} · {entry.year}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* World Selection */}
          <div className="bg-neutral-900 border-2 border-white p-5">
            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2 mb-1">
              🌍 {t('als_world_select_title')}
            </h2>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-4">
              {t('als_explore_mode_note')}
            </p>
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
                    <span className="font-black text-sm uppercase tracking-tight">{worldName(w)}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-medium leading-snug line-clamp-2">
                    {worldDesc(w)}
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
            const lore = getWorldLore(world.id, currentLang as 'tr' | 'en' | 'ja' | 'fr');
            if (!lore) return null;
            return (
              <div className="bg-neutral-900 border-2 border-white/30 p-5 space-y-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  {world.emoji} {worldName(world)} — {t('als_lore_suffix')}
                </h3>
                <p className="text-[11px] text-neutral-300 font-medium leading-snug">
                  {lore.summary}
                </p>
                <div className="text-[10px] text-neutral-400 font-mono">
                  <span className="font-black text-neutral-300">{t('als_lore_power_system')}:</span> {lore.powerSystem.name}
                </div>
                <div className="text-[10px] text-neutral-400 font-mono">
                  <span className="font-black text-neutral-300">{t('als_lore_themes')}:</span> {lore.themes.join(', ')}
                </div>
                <div className="text-[10px] text-neutral-400 font-mono">
                  <span className="font-black text-neutral-300">{t('als_lore_source_series')}:</span> {lore.sourceSeries.join(', ')}
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
                  <div
                    key={r.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedRegion(r.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedRegion(r.id); }}
                    className={cn(
                      "p-3 border-2 text-left transition-all cursor-pointer relative",
                      selectedRegion === r.id
                        ? "bg-white text-black border-white shadow-[2px_2px_0px_0px_#e11d48]"
                        : "bg-black text-white border-white/20 hover:border-white"
                    )}
                  >
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setRegionDetail(r); }}
                      className="absolute top-2 right-2 text-[9px] font-black uppercase border border-white/20 text-neutral-400 hover:text-white hover:border-white px-1.5 py-0.5 cursor-pointer"
                      aria-label={t('als_region_details')}
                    >
                      {t('als_region_detail_btn')}
                    </button>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{r.emoji}</span>
                      <span className="font-black text-xs uppercase tracking-tight">{regionName(r)}</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 font-medium leading-snug line-clamp-2">
                      {regionDesc(r)}
                    </p>
                    <div className="mt-1 text-[9px] font-mono text-neutral-500">
                      {t('als_life_expectancy', { min: r.lifeExpectancy[0], max: r.lifeExpectancy[1] })}
                    </div>
                  </div>
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
              {t('als_period_title')}
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
                  {p === 'today' ? t('als_period_today') : p === 'past' ? t('als_period_past') : t('als_period_future')}
                </button>
              ))}
            </div>
          </div>

          {/* Focus Selection */}
          <div className="bg-neutral-900 border-2 border-white p-5">
            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2 mb-4">
              {t('als_focus_title')}
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
                  <span className="font-black text-xs uppercase tracking-tight block">{t(`als_focus_${f.id}`)}</span>
                  <span className="text-[10px] text-neutral-400 font-medium leading-snug">{t(`als_focus_${f.id}_desc`)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ethical Mode Toggle */}
          <div className="bg-neutral-900 border-2 border-white/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white uppercase tracking-wider">{t('als_ethical_title')}</span>
              <span className="text-[10px] text-neutral-400 font-medium">
                {eduMode ? t('als_ethical_edu_active') : t('als_ethical_desc')}
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
              <span className="text-xs font-bold text-neutral-300">{t('als_show_heavy')}</span>
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
                {t('als_progress_world_region', { world: world ? worldName(world) : '', region: region ? regionName(region) : '' })} · {life?.gender === 'female' ? '♀' : '♂'} · {life?.period === 'past' ? t('als_period_past') : life?.period === 'future' ? t('als_period_future') : t('als_period_today')}
              </span>
              <span className="text-xs font-mono font-bold text-neutral-400">
                {t('als_progress_age', { age: Math.floor(lifeAge), deathAge: life.deathAge, unit: t('als_years_unit') })}
              </span>
            </div>
            <div className="w-full h-3 bg-neutral-900 border-2 border-white overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-600 via-amber-400 to-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (lifeAge / Math.max(1, life.deathAge)) * 100)}%` }}
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
              <button
                onClick={() => setIsPaused(p => !p)}
                className={cn(
                  "px-2 py-1 text-[10px] font-black border cursor-pointer",
                  isPaused ? "bg-rose-600 text-white border-rose-400" : "bg-black text-neutral-300 border-white/20 hover:border-white"
                )}
              >
                {isPaused ? `▶ ${t('als_resume_clock')}` : `⏸ ${t('als_pause')}`}
              </button>
              <button
                onClick={() => setShowTimeline(v => !v)}
                className={cn(
                  "px-2 py-1 text-[10px] font-black border cursor-pointer",
                  showTimeline ? "bg-white text-black border-white" : "bg-black text-neutral-300 border-white/20 hover:border-white"
                )}
                aria-expanded={showTimeline}
              >
                📜 {t('als_timeline')}
              </button>
              <button
                onClick={() => setMuted(m => !m)}
                className="ml-auto px-2 py-1 text-[10px] font-black border cursor-pointer bg-black text-neutral-300 border-white/20 hover:border-white"
                aria-label={muted ? t('als_unmute') : t('als_mute')}
              >
                {muted ? `🔇 ${t('als_unmute')}` : `🔊 ${t('als_mute')}`}
              </button>
              <button
                onClick={() => setAutoDecide(v => {
                  const next = !v;
                  try { localStorage.setItem('als_auto_decide', next ? '1' : '0'); } catch { /* ignore */ }
                  return next;
                })}
                className={cn(
                  "px-2 py-1 text-[10px] font-black border cursor-pointer",
                  autoDecide ? "bg-white text-black border-white" : "bg-black text-neutral-300 border-white/20 hover:border-white"
                )}
                aria-pressed={autoDecide}
                title={t('als_auto_decide_hint')}
              >
                🤖 {t('als_auto_decide')}
              </button>
            </div>
          </div>

          {/* Character Profile */}
          {life && currentStats && (
            <div className="bg-neutral-900 border-2 border-white/30 p-4 flex flex-wrap items-center gap-3 text-[10px] font-mono">
              <span className="text-white font-black text-sm">{displayName}</span>
              <span className="text-neutral-400">|</span>
              <span className="text-neutral-300">{life.gender === 'female' ? '♀' : '♂'}</span>
              <span className="text-neutral-400">|</span>
              <span className="text-neutral-300">{familyLabel(getFamilyStatus(currentStats.socialClass))}</span>
              <span className="text-neutral-400">|</span>
              <span className="text-neutral-300">{t('als_profile_education')}: {educationLabel(getEducationTier(currentStats.intelligence))}</span>
              <span className="text-neutral-400">|</span>
              <span className="text-amber-400 font-bold">💰 {currentAssets}</span>
            </div>
          )}

          {/* Event Card */}
          {/* Event Modal — "zaman durur, soru sorulur" (referanstaki gibi) */}
          {showEvent ? (
          <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-[3px] flex items-start justify-center overflow-y-auto p-3 md:p-8" role="dialog" aria-modal="true" aria-label={currentEvent.title}>
            <div className="w-full max-w-2xl bg-neutral-900 border-4 border-amber-400 p-4 md:p-6 neo-shadow-white space-y-4 my-4">
             <div className="flex items-center justify-between gap-2 border-b-2 border-white/10 pb-2">
               <span className="text-[9px] font-black uppercase tracking-[0.25em] text-amber-400 flex items-center gap-2">
                 <span className="w-2 h-2 bg-amber-400 animate-pulse inline-block" aria-hidden="true" />
                 {t('als_time_stopped')}
               </span>
               {autoDecide && currentEvent.choices && currentEvent.choices.length > 0 && !choicesMade[currentEvent.id] && (
                 <span className="text-[9px] font-black uppercase tracking-widest bg-white text-black px-2 py-0.5 border border-black">
                   {t('als_auto_decide_badge', { seconds: autoSecondsLeft ?? 8 })}
                 </span>
               )}
             </div>
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

            {choicesMade[currentEvent.id] && (() => {
              const chosen = currentEvent.choices?.find(c => c.id === choicesMade[currentEvent.id]);
              if (!chosen) return null;
              const deltas = Object.entries(chosen.statChanges || {});
              return (
                <div className="bg-emerald-950/40 border-2 border-emerald-500/50 p-4 space-y-2">
                  <div className="text-emerald-300 text-xs font-black uppercase tracking-wider">
                    {t('als_choice_result')}: {chosen.label}
                  </div>
                  {chosen.consequences && chosen.consequences.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {chosen.consequences.map((c, i) => (
                        <span key={i} className="text-[10px] font-bold px-2 py-0.5 border border-emerald-500/40 text-emerald-200">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                  {deltas.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {deltas.map(([key, val]) => {
                        const num = Number(val) || 0;
                        if (num === 0) return null;
                        return (
                          <span key={key} className={cn(
                            "text-[10px] font-mono font-black px-2 py-0.5 border",
                            num > 0 ? "border-emerald-500 text-emerald-300" : "border-rose-500 text-rose-300"
                          )}>
                            {statDeltaLabel(key)} {num > 0 ? '+' : ''}{num}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {(!currentEvent.choices || choicesMade[currentEvent.id]) && (
              <button
                onClick={handleNextEvent}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-sm border-4 border-white flex items-center justify-center gap-2 transition-all cursor-pointer neo-shadow-white"
              >
                {currentEvent.isDeath ? t('als_go_memorial') : t('als_continue')}
              </button>
            )}
            </div>
          </div>
          ) : (
            <div className="bg-black border-4 border-white p-6 md:p-8 neo-shadow-white text-center space-y-4">
              <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                {t('als_life_in_progress')}
              </div>
              <div className="text-6xl md:text-7xl font-black text-white font-mono leading-none">
                {Math.floor(lifeAge)}
              </div>
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                {t('als_years_unit')} · {life.birthYear + Math.floor(lifeAge)}
              </div>
              <div className="max-w-md mx-auto w-full h-2 bg-neutral-900 border border-white/30 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 via-amber-400 to-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (lifeAge / Math.max(1, life.deathAge)) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-neutral-400 font-medium max-w-xl mx-auto">
                {life.regionId && region ? regionName(region) : ''}
                {world ? ` · ${worldName(world)}` : ''}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setIsPaused(p => !p)}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs border-2 border-white cursor-pointer"
                >
                  {isPaused ? `▶ ${t('als_resume_clock')}` : `⏸ ${t('als_pause')}`}
                </button>
                <button
                  onClick={handleSkipToNext}
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-black uppercase text-xs border-2 border-white/30 cursor-pointer"
                >
                  {t('als_skip_to_next')}
                </button>
              </div>
              {isPaused && (
                <div className="text-[10px] font-black text-rose-400 uppercase tracking-wider">
                  {t('als_paused')}
                </div>
              )}
            </div>
          )}

          {/* Stats Panel */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { label: 'Guc', value: currentStats?.power ?? 0, color: 'text-rose-400' },
              { label: 'Zeka', value: currentStats?.intelligence ?? 0, color: 'text-cyan-400' },
              { label: 'Sans', value: currentStats?.luck ?? 0, color: 'text-amber-400' },
              { label: 'Sosyal', value: currentStats?.socialClass ?? 0, color: 'text-emerald-400' },
              { label: 'Saglik', value: currentStats?.health ?? 0, color: 'text-purple-400' }
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
              {memorialText}
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

            {/* World Fidelity */}
            <div className="mt-4 flex items-center gap-3 bg-neutral-900 border-2 border-amber-400/50 p-4">
              <span className="text-3xl" aria-hidden="true">🎯</span>
              <div className="flex-1">
                <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block">{t('als_world_fidelity')}</span>
                <span className="text-lg font-black text-white">{worldFidelity}%</span>
                <span className="ml-2 text-[10px] font-black uppercase text-neutral-400">
                  {worldFidelity >= 15 ? t('als_fidelity_high') : worldFidelity >= 5 ? t('als_fidelity_moderate') : t('als_fidelity_low')}
                </span>
              </div>
            </div>

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
                        {(() => {
                          const s = idx === 0 && finalLifeStats ? finalLifeStats : pl.finalStats;
                          return `${t('als_stat_power')}:${s.power} ${t('als_stat_intelligence')}:${s.intelligence} ${t('als_stat_luck')}:${s.luck}`;
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {eduMode && (
                <div className="flex-1 py-3 px-4 bg-neutral-900 border-2 border-white/30 text-neutral-400 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center text-center">
                  {t('als_edu_share_disabled')}
                </div>
              )}
              {!eduMode && (
                <>
                  <button
                    onClick={async () => {
                      const shareLife = { ...life, finalStats: finalLifeStats ?? life.finalStats };
                      const text = generateShareText(shareLife, world!, region!);
                      if (navigator.share) {
                        try {
                          await navigator.share({ title: t('als_page_title'), text });
                          addToast(t('als_share_success'), 'success');
                          return;
                        } catch {
                          // paylaşım iptal edildi → panoya kopyalamayı dene
                        }
                      }
                      try {
                        await navigator.clipboard.writeText(text);
                        addToast(t('als_copied'), 'success');
                      } catch {
                        addToast(t('als_copy_failed'), 'error');
                      }
                    }}
                    className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-sm border-4 border-white flex items-center justify-center gap-2 transition-all cursor-pointer neo-shadow-white"
                  >
                    {t('als_copy_result')}
                  </button>
                  <button
                    onClick={() => {
                      if (!life || !world || !region) return;
                      const stats = finalLifeStats ?? life.finalStats;
                      const family = getFamilyStatus(stats.socialClass);
                      const edu = getEducationTier(stats.intelligence);
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
                      ctx.fillText(t('als_hero_title'), 20, 34);
                      ctx.fillStyle = '#fff';
                      ctx.font = 'bold 14px monospace';
                      ctx.fillText(`${displayName} · ${world.emoji} ${worldName(world)} - ${regionName(region)}`, 20, 70);
                      ctx.fillText(`${t('als_event_age', { age: life.deathAge, year: life.deathYear })} | ${life.deathCause}`, 20, 95);
                      ctx.fillText(`${t('als_family')}: ${familyLabel(family)}  ${t('als_profile_education')}: ${educationLabel(edu)}`, 20, 120);
                      ctx.fillText(`${t('als_stat_power')}: ${stats.power}  ${t('als_stat_intelligence')}: ${stats.intelligence}  ${t('als_stat_luck')}: ${stats.luck}`, 20, 145);
                      ctx.fillText(`${t('als_stat_social')}: ${stats.socialClass}  ${t('als_stat_health')}: ${stats.health}  ${t('als_assets')}: ${currentAssets}`, 20, 170);
                      ctx.fillText(`${t('als_world_fidelity')}: ${worldFidelity}%`, 20, 195);
                      if (life.achievements.length > 0) {
                        ctx.fillText(`${t('als_achievements_title')}: ${life.achievements.slice(0, 3).join(', ')}`, 20, 215);
                      }
                      if (life.isCanonEncountered) {
                        ctx.fillStyle = '#fbbf24';
                        ctx.fillText(`${t('als_canon_encounters_title')}: ${life.canonEncounters.join(', ')}`, 20, 240);
                      }
                      ctx.fillStyle = '#666';
                      ctx.font = '10px monospace';
                      ctx.fillText('AniSync · 1 in 8 Billion Universes', 20, 380);
                      canvas.toBlob((blob) => {
                        if (!blob) return;
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'anime-life-sim.png';
                        a.click();
                        URL.revokeObjectURL(url);
                        addToast(t('als_card_downloaded'), 'success');
                      });
                    }}
                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-sm border-4 border-white flex items-center justify-center gap-2 transition-all cursor-pointer neo-shadow-white"
                  >
                    {t('als_download_card')}
                  </button>
                  <button
                    onClick={async () => {
                      const user = auth.currentUser;
                      if (!user) {
                        addToast(t('als_login_required'), 'info');
                        return;
                      }
                      if (!life || !world || !region) return;
                      try {
                        await addDoc(collection(db, 'recentActivities'), {
                          userId: user.uid,
                          userName: user.displayName || 'AniSync User',
                          userAvatar: user.photoURL || null,
                          animeId: 'anime-life-sim',
                          animeTitle: `Anime Life Sim: ${worldName(world)} - ${regionName(region)}`,
                          animeImage: null,
                          actionType: 'life_sim_completed',
                          deathAge: life.deathAge,
                          deathCause: life.deathCause,
                          world: world.id,
                          region: region.id,
                          createdAt: serverTimestamp()
                        });
                        addToast(t('als_share_success'), 'success');
                      } catch (e) {
                        console.warn('Could not share life sim result:', e);
                        addToast(t('als_share_failed'), 'error');
                      }
                    }}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-sm border-4 border-white flex items-center justify-center gap-2 transition-all cursor-pointer neo-shadow-white"
                  >
                    {t('als_share_community')}
                  </button>
                </>
              )}
              {!eduMode && (
                <button
                  onClick={handleAddToBoard}
                  className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-sm border-4 border-white flex items-center justify-center gap-2 transition-all cursor-pointer neo-shadow-white"
                >
                  🕯️ {t('als_board_add')}
                </button>
              )}
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

      {/* ── Anma Defteri Modalı ── */}
      <MemorialBoardModal open={showBoard} onClose={() => setShowBoard(false)} />

      {/* ── Doğum Özeti Modalı ── */}
      {showBirthSummary && life && world && region && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={t('als_birth_title')}
        >
          <div className="max-w-lg w-full bg-neutral-950 border-4 border-amber-400 neo-shadow-white p-6 space-y-5 my-8">
            <div className="text-center space-y-2">
              <span className="inline-block bg-amber-400 text-black font-black text-[9px] px-2 py-1 border border-white uppercase tracking-widest">
                {worldName(world)} · {regionName(region)}
              </span>
              <h2 className="text-xl md:text-2xl font-black text-neutral-400 uppercase tracking-[0.25em]">
                {t('als_birth_title')}
              </h2>
              <p className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none">
                {displayName}
              </p>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                {life.gender === 'female' ? '♀' : '♂'} · {life.birthYear}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              {[
                { label: t('als_birth_gender'), value: life.gender === 'female' ? t('als_birth_gender_female') : t('als_birth_gender_male') },
                { label: t('als_birth_era'), value: life.period === 'past' ? t('als_period_past') : life.period === 'future' ? t('als_period_future') : t('als_period_today') },
                { label: t('als_birth_family'), value: familyLabel(life.familyStatus) },
                { label: t('als_birth_education'), value: educationLabel(life.education) },
                { label: t('als_birth_assets'), value: `💰 ${life.assets}` },
                { label: t('als_birth_le'), value: t('als_birth_years', { min: region.lifeExpectancy[0], max: region.lifeExpectancy[1] }) },
                { label: t('als_birth_danger'), value: dangerLabel(world.dangerLevel) },
                { label: t('als_birth_year'), value: String(life.birthYear) },
              ].map((row) => (
                <div key={row.label} className="bg-neutral-900 border border-white/15 p-2">
                  <span className="text-[9px] font-black text-neutral-500 uppercase block">{row.label}</span>
                  <span className="text-white font-bold leading-snug">{row.value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setShowBirthSummary(false);
                playSound(440, 200, 'sine');
              }}
              className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-sm tracking-widest border-4 border-white cursor-pointer neo-shadow-white transition-all"
            >
              {t('als_birth_start')}
            </button>
          </div>
        </div>
      )}

      {/* ── Bölge Detay Modalı ── */}
      {regionDetail && (() => {
        const detailWorld = getWorldById(regionDetail.worldId);
        const statBars = [
          { label: t('als_region_war'), v: regionDetail.stats.warRate },
          { label: t('als_region_disease'), v: regionDetail.stats.diseaseRate },
          { label: t('als_region_poverty'), v: regionDetail.stats.povertyRate },
          { label: t('als_region_adventure'), v: regionDetail.stats.adventureRate },
        ];
        return (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={t('als_region_details')}
            onClick={() => setRegionDetail(null)}
          >
            <div className="max-w-md w-full bg-neutral-950 border-4 border-white p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{regionDetail.emoji}</span>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight leading-tight">{regionName(regionDetail)}</h3>
                    {detailWorld && (
                      <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{worldName(detailWorld)}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setRegionDetail(null)}
                  className="p-2 text-white border-2 border-white/20 hover:border-white cursor-pointer"
                  aria-label={t('als_detail_close')}
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-neutral-300 font-medium leading-relaxed">{regionDesc(regionDetail)}</p>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-[9px] font-black text-neutral-500 uppercase block">{t('als_birth_le')}</span>
                  <span className="text-white font-bold">{regionDetail.lifeExpectancy[0]}-{regionDetail.lifeExpectancy[1]}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-neutral-500 uppercase block">{t('als_region_population')}</span>
                  <span className="text-white font-bold">{regionDetail.population.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-neutral-500 uppercase block">{t('als_region_birth_rate')}</span>
                  <span className="text-white font-bold">{Math.round(regionDetail.birthRate * 1000) / 10}%</span>
                </div>
                {detailWorld && (
                  <div>
                    <span className="text-[9px] font-black text-neutral-500 uppercase block">{t('als_birth_danger')}</span>
                    <span className="text-white font-bold">{dangerLabel(detailWorld.dangerLevel)}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {statBars.map((s) => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-0.5">
                      <span className="text-neutral-400">{s.label}</span>
                      <span className="text-white font-mono">{Math.round(s.v * 100)}%</span>
                    </div>
                    <div className="h-2 bg-neutral-800 border border-white/10 overflow-hidden">
                      <div className="h-full bg-rose-600" style={{ width: `${Math.min(100, s.v * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setRegionDetail(null)}
                className="w-full py-2 bg-black hover:bg-neutral-800 text-white font-black uppercase text-xs border-2 border-white/30 cursor-pointer"
              >
                {t('als_detail_close')}
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── Zaman Çizelgesi ── */}
      {showTimeline && life && (
        <>
          <div className="fixed inset-0 z-40 bg-black/70" onClick={() => setShowTimeline(false)} aria-hidden="true" />
          <aside
            className="fixed top-0 right-0 h-full w-full max-w-md z-50 bg-neutral-950 border-l-4 border-white flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label={t('als_timeline')}
          >
            <div className="flex items-center justify-between p-4 border-b-2 border-white/10">
              <h3 className="text-lg font-black text-white uppercase tracking-widest">📜 {t('als_timeline')}</h3>
              <button
                onClick={() => setShowTimeline(false)}
                className="p-2 text-white border-2 border-white/20 hover:border-white cursor-pointer"
                aria-label={t('als_detail_close')}
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 [scrollbar-width:thin]">
              {life.events.slice(0, currentEventIndex + 1).map((e) => {
                const chosen = e.choices?.find((c) => c.id === choicesMade[e.id]);
                const icon = e.type === 'birth' ? '👶' :
                  e.type === 'childhood' ? '🧒' :
                  e.type === 'faction' ? '⚔️' :
                  e.type === 'crisis' ? '⚠️' :
                  e.type === 'special' ? '✨' :
                  e.type === 'death' ? '💀' : '📖';
                return (
                  <div key={e.id} className="flex gap-3 border-2 border-white/10 bg-neutral-900/60 p-3">
                    <div className="text-xl w-8 shrink-0 pt-0.5">{icon}</div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase">
                          {t('als_event_age', { age: e.age, year: e.year })}
                        </span>
                        <span className="text-[11px] font-black text-white uppercase tracking-tight">{e.title}</span>
                      </div>
                      {chosen && (
                        <p className="text-[10px] text-amber-400/90 font-bold mt-1 leading-snug">
                          {t('als_timeline_you_chose', { choice: chosen.label })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              {life.events.length === 0 && (
                <p className="text-xs text-neutral-500 font-bold uppercase text-center py-8">{t('als_timeline_empty')}</p>
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  );
};