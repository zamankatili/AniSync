import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { ANIME_WORLDS, getWorldById, getWorldsByDangerLevel } from '../data/animeWorlds';
import { ANIME_REGIONS, getRegionsByWorld } from '../data/animeRegions';
import { generateLife, LifeResult, generateShareText } from '../lib/eventEngine';
import { cn } from '../lib/utils';

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

  const world = selectedWorld ? getWorldById(selectedWorld) : null;
  const regions = selectedWorld ? getRegionsByWorld(selectedWorld) : [];
  const region = selectedRegion ? regions.find(r => r.id === selectedRegion) : null;

  const handleStartLife = () => {
    if (!world || !region) return;
    const result = generateLife(world, region, lifeDuration);
    setLife(result);
    setPhase('playing');
    setCurrentEventIndex(0);
    setChoicesMade({});
  };

  const handleChoice = (eventId: string, choiceId: string) => {
    setChoicesMade(prev => ({ ...prev, [eventId]: choiceId }));
    setTimeout(() => {
      if (life && currentEventIndex < life.events.length - 1) {
        setCurrentEventIndex(prev => prev + 1);
      } else {
        setPhase('memorial');
      }
    }, 800);
  };

  const handleNextEvent = () => {
    if (life && currentEventIndex < life.events.length - 1) {
      setCurrentEventIndex(prev => prev + 1);
    } else {
      setPhase('memorial');
    }
  };

  const handleRestart = () => {
    setPhase('select');
    setLife(null);
    setCurrentEventIndex(0);
    setChoicesMade({});
    setSelectedWorld(null);
    setSelectedRegion(null);
  };

  const currentEvent = life?.events[currentEventIndex];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <Helmet>
        <title>Anime Yaşam Simülasyonu (8 Milyar Evrende 1) | AniSync</title>
        <meta name="description" content="Anime ve manga evrenlerinde rastgele doğ, bir hayatı sonuna kadar yaşa." />
      </Helmet>

      {phase === 'select' && (
        <div className="space-y-6">
          {/* Hero */}
          <div className="bg-black border-4 border-white neo-shadow-white p-6 md:p-8 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
              <span className="text-[280px]">🌍</span>
            </div>
            <div className="relative z-10 max-w-3xl">
              <span className="bg-rose-600 text-white font-black text-xs px-2.5 py-1 border border-white uppercase tracking-wider">
                BETA — 8 MİLYAR EVRENDE 1
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-3 mt-3">
                ANİME YAŞAM SİMÜLASYONU
              </h1>
              <p className="text-sm md:text-base text-neutral-300 font-medium leading-relaxed mb-6">
                Tam bu anda bile her saniye dört bebek doğuyor. Onlardan biri olup tek bir hayatı sonuna kadar yaşarsın.
                Nerede, kimin çocuğu olarak doğacağını seçemezsin. Ama bu sefer anime/manga evrenlerinde!
              </p>
            </div>
          </div>

          {/* World Selection */}
          <div className="bg-neutral-900 border-2 border-white p-5">
            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2 mb-4">
              🌍 Doğacağın Evren
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
                      {w.dangerLevel === 'low' ? 'Düşük Tehlike' :
                       w.dangerLevel === 'medium' ? 'Orta Tehlike' :
                       w.dangerLevel === 'high' ? 'Yüksek Tehlike' : 'Aşırı Tehlike'}
                    </span>
                    <span className="text-neutral-500">
                      Yaşam: {w.lifeExpectancy[0]}-{w.lifeExpectancy[1]} yıl
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Region Selection */}
          {world && (
            <div className="bg-neutral-900 border-2 border-white p-5">
              <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                Doğacağın Bölge
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
              Bir Hayatın Uzunluğu
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
                  {dur === '30min' ? 'Yaklaşık 30 dk' : dur === '1h' ? 'Yaklaşık 1 saat' : 'Yaklaşık 1.5 saat'}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          {selectedWorld && selectedRegion && (
            <button
              onClick={handleStartLife}
              className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase text-sm tracking-widest border-4 border-white neo-shadow-white flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              DOG VE YASA
            </button>
          )}
        </div>
      )}

      {phase === 'playing' && life && currentEvent && (
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="bg-black border-4 border-white neo-shadow-white p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                {world?.nameTR} - {region?.nameTR}
              </span>
              <span className="text-xs font-mono font-bold text-neutral-400">
                {currentEvent.age} / {life.deathAge} yil
              </span>
            </div>
            <div className="w-full h-3 bg-neutral-900 border-2 border-white overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-600 via-amber-400 to-emerald-500 transition-all duration-500"
                style={{ width: `${(currentEventIndex / (life.events.length - 1)) * 100}%` }}
              />
            </div>
            <div className="mt-2 text-[10px] text-neutral-500 font-mono">
              Olay {currentEventIndex + 1} / {life.events.length}
            </div>
          </div>

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
                  {currentEvent.age} yasinda - {currentEvent.year}
                </span>
              </div>
            </div>

            <p className="text-sm text-neutral-200 font-medium leading-relaxed">
              {currentEvent.description}
            </p>

            {currentEvent.isCanonEncounter && (
              <div className="bg-amber-400/20 border-2 border-amber-400 p-3 text-amber-300 text-xs font-bold">
                Kanon Karakter Karsilasmasi: {currentEvent.canonCharacter}
              </div>
            )}

            {currentEvent.choices && currentEvent.choices.length > 0 && !choicesMade[currentEvent.id] && (
              <div className="space-y-3 mt-4">
                <p className="text-xs text-neutral-400 font-black uppercase tracking-wider">
                  Seciminizi yapin:
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
                          {choice.risk === 'low' ? 'Dusuk Risk' :
                           choice.risk === 'medium' ? 'Orta Risk' :
                           choice.risk === 'high' ? 'Yuksek Risk' : 'Asiri Risk'}
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
                Secim yapildi. Sonraki olaya geciliyor...
              </div>
            )}

            {!currentEvent.choices && (
              <button
                onClick={handleNextEvent}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-sm border-4 border-white flex items-center justify-center gap-2 transition-all cursor-pointer neo-shadow-white"
              >
                Devam Et
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
                <span className="text-[9px] font-black text-neutral-500 uppercase block">{stat.label}</span>
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
                ANMA SAYFASI
              </h2>
              <p className="text-neutral-400 font-bold text-sm">
                Hatirlanmayan bir hayat. Ama bir hayat yasandi.
              </p>
            </div>

            <div className="bg-neutral-950 border-2 border-white/20 p-4 md:p-6 font-mono text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed">
              {life.memorialText}
            </div>

            {/* Achievements */}
            {life.achievements.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-black text-white uppercase tracking-wider mb-3">
                  BASARILAR
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
                  KANON KARAKTER KARSILASMALARI
                </h3>
                <p className="text-xs text-neutral-300 font-bold">
                  Bu hayatta su kanon karakterlerle karsilastin: {life.canonEncounters.join(', ')}
                </p>
              </div>
            )}

            {/* Share */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  const text = generateShareText(life, world!, region!);
                  navigator.clipboard.writeText(text);
                }}
                className="flex-1 py-3 bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-sm border-4 border-white flex items-center justify-center gap-2 transition-all cursor-pointer neo-shadow-white"
              >
                SONUCU KOPYALA
              </button>
              <button
                onClick={handleRestart}
                className="flex-1 py-3 bg-black hover:bg-neutral-800 text-white font-black uppercase text-sm border-4 border-white/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                YENI HAYAT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};