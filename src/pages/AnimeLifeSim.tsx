import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { ANIME_WORLDS, getWorldById, getWorldsByDangerLevel } from '../data/animeWorlds';
import { ANIME_REGIONS, getRegionsByWorld } from '../data/animeRegions';
import { cn } from '../lib/utils';

export const AnimeLifeSim: React.FC = () => {
  const { t } = useAppTranslation();
  const [selectedWorld, setSelectedWorld] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [lifeDuration, setLifeDuration] = useState<'30min' | '1h' | '1.5h'>('1h');
  const [isPlaying, setIsPlaying] = useState(false);

  const world = selectedWorld ? getWorldById(selectedWorld) : null;
  const regions = selectedWorld ? getRegionsByWorld(selectedWorld) : [];
  const region = selectedRegion ? regions.find(r => r.id === selectedRegion) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <Helmet>
        <title>Anime Yaşam Simülasyonu (8 Milyar Evrende 1) | AniSync</title>
        <meta name="description" content="Anime ve manga evrenlerinde rastgele doğ, bir hayatı sonuna kadar yaşa. Shounen, Isekai, Dark Fantasy ve daha fazlası." />
      </Helmet>

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
            Nerede, kimin çocuğu olarak doğacağını seçemezsin. Tıpkı senin de seçmediğin gibi.
            Ama bu sefer anime/manga evrenlerinde!
          </p>
        </div>
      </div>

      {!isPlaying ? (
        <div className="space-y-6">
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
                📍 Doğacağın Bölge
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
              ⏱️ Bir Hayatın Uzunluğu
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
              onClick={() => setIsPlaying(true)}
              className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase text-sm tracking-widest border-4 border-white neo-shadow-white flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              🎲 DOĞ VE YAŞA
            </button>
          )}
        </div>
      ) : (
        <div className="bg-black border-4 border-white neo-shadow-white p-8 text-center space-y-4">
          <div className="text-6xl mb-4">{world?.emoji}</div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            {region?.nameTR} — {world?.nameTR}
          </h2>
          <p className="text-neutral-400 font-bold text-sm">
            Yaşam simülasyonu motoru hazırlanıyor... (Faz 2: Olay Motoru)
          </p>
          <p className="text-[11px] text-neutral-500 font-mono">
            Güç Sistemi: {world?.powerSystem} | Tehlike: {world?.dangerLevel}
          </p>
          <button
            onClick={() => setIsPlaying(false)}
            className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-black text-xs uppercase border-2 border-white/30 transition-colors cursor-pointer"
          >
            ← Geri Dön
          </button>
        </div>
      )}
    </div>
  );
};