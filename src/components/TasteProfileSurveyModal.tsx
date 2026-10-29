import React, { useState } from 'react';
import { 
  Sparkles, Compass, Check, ArrowRight, ArrowLeft, X, 
  Brain, Shield, Flame, Heart, Zap, Award, Film, Bookmark 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { cn } from '../lib/utils';
import { Anime } from '../types';

interface TasteProfileSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: (result: TasteProfileResult) => void;
}

export interface TasteProfileResult {
  dnaTitle: string;
  dnaBadge: string;
  description: string;
  primaryGenres: string[];
  preferredPacing: string;
  archetype: string;
  recommendedAnimes: {
    mal_id: number;
    title: string;
    image: string;
    score: number;
    reason: string;
  }[];
}

const GENRE_OPTIONS = [
  { id: 'Action', label: 'Aksiyon & Dövüş', icon: '⚔️' },
  { id: 'Fantasy', label: 'Karanlık Fantezi & Büyü', icon: '🧙' },
  { id: 'Psychological', label: 'Psikolojik & Zeka', icon: '🧠' },
  { id: 'Sci-Fi', label: 'Bilim Kurgu & Mecha', icon: '🚀' },
  { id: 'Romance', label: 'Romantizm & Dram', icon: '💖' },
  { id: 'Comedy', label: 'Komedi & Parodi', icon: '😂' },
  { id: 'Mystery', label: 'Gizem & Gerilim', icon: '🕵️' },
  { id: 'Slice of Life', label: 'Huzurlu Yaşam (Iyashikei)', icon: '🍵' },
];

const PACING_OPTIONS = [
  { id: 'fast', title: 'Yüksek Adrenalin', desc: 'Sürekli tempolu savaşlar, şok edici ters köşeler ve hızlı ilerleyen olaylar.' },
  { id: 'deep', title: 'Derin Felsefi / Ağır', desc: 'Dünya inşasına, karakter monologlarına ve ahlaki ikilemlere zaman ayıran yapımlar.' },
  { id: 'chill', title: 'Rahatlatıcı & Dingin', desc: 'Günün yorgunluğunu unutturan, iç ısıtan atmosferik sahneler.' }
];

const ARCHETYPE_OPTIONS = [
  { id: 'strategist', title: 'Gölge Dahi / Stratejist', desc: 'Zekasıyla satranç oynar gibi düşmanlarını alt eden karakterler (Lelouch, L, Aizen).' },
  { id: 'grit', title: 'Sarsılmaz İrade & Azim', desc: 'Asla pes etmeyen, dostları için sınırları zorlayan kahramanlar (Luffy, Naruto).' },
  { id: 'antihero', title: 'Bedel Ödeyen Anti-Kahraman', desc: 'Ahlaki gri alanda yürüyen, acı ve fedakarlıkla yoğrulmuş karakterler (Guts, Eren).' },
  { id: 'sage', title: 'Esrarengiz Usta / Sakin Güç', desc: 'Gevşek görünen ama kritik anda efsaneleşen mentorlar (Gojo, Kisuke, Reigen).' }
];

export const TasteProfileSurveyModal: React.FC<TasteProfileSurveyModalProps> = ({ 
  isOpen, 
  onClose,
  onCompleted 
}) => {
  const { updateUserProfile, addToWatchlist, watchlist } = useAppStore();
  const { addToast } = useToastStore();

  const [step, setStep] = useState<number>(1);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Action', 'Fantasy']);
  const [selectedPacing, setSelectedPacing] = useState<string>('fast');
  const [selectedArchetype, setSelectedArchetype] = useState<string>('strategist');
  const [result, setResult] = useState<TasteProfileResult | null>(null);

  if (!isOpen) return null;

  const toggleGenre = (genreId: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genreId)) {
        if (prev.length === 1) return prev; // En az 1 tür seçili kalsın
        return prev.filter(g => g !== genreId);
      } else {
        if (prev.length >= 4) return prev; // Max 4 tür
        return [...prev, genreId];
      }
    });
  };

  const calculateProfileResult = (): TasteProfileResult => {
    // 1. Calculate DNA Title
    let dnaTitle = "Gölge Stratejisti";
    let dnaBadge = "🧠";
    let desc = "Akıl oyunları, zekice hamleler ve derin kurgular senin için vazgeçilmez.";

    if (selectedArchetype === 'grit') {
      dnaTitle = "Azimli Şafak Savaşçısı";
      dnaBadge = "🔥";
      desc = "Saf tutku, dostluk bağları ve sınırlara meydan okuyan epik savaşlar ruhunu besliyor.";
    } else if (selectedArchetype === 'antihero') {
      dnaTitle = "Karanlık Kader Yolcusu";
      dnaBadge = "⚔️";
      desc = "Ahlaki grilikleri, gerçekçi acıları ve fedakarlık gerektiren karanlık fantezileri seviyorsun.";
    } else if (selectedArchetype === 'sage') {
      dnaTitle = "Zen Kozmos Bilgesi";
      dnaBadge = "🌌";
      desc = "Esrarengiz güçler, derin felsefi dünya inşası ve estetik sahneler senin odağın.";
    }

    // 2. Select matching curated series
    const recs = [
      {
        mal_id: 52991,
        title: "Frieren: Beyond Journey's End",
        image: "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg",
        score: 9.32,
        reason: "Felsefi derinliği ve büyüleyici dünyasıyla izleme zevkine tam oturuyor."
      },
      {
        mal_id: 52299,
        title: "Solo Leveling",
        image: "https://cdn.myanimelist.net/images/anime/1208/135328l.jpg",
        score: 8.52,
        reason: "Yüksek adrenalin temposu ve güçlenme dinamiği aradığın heyecanı veriyor."
      },
      {
        mal_id: 1535,
        title: "Death Note",
        image: "https://cdn.myanimelist.net/images/anime/9/9453l.jpg",
        score: 8.62,
        reason: "Gölge stratejist profiline uygun kusursuz bir kedi-fare oyunu."
      }
    ];

    return {
      dnaTitle,
      dnaBadge,
      description: desc,
      primaryGenres: selectedGenres,
      preferredPacing: selectedPacing,
      archetype: selectedArchetype,
      recommendedAnimes: recs
    };
  };

  const handleFinishSurvey = () => {
    const computedResult = calculateProfileResult();
    setResult(computedResult);
    
    // Save to AppStore userProfile
    updateUserProfile({
      favoriteGenres: selectedGenres,
      bio: `Otaku DNA: ${computedResult.dnaBadge} ${computedResult.dnaTitle}`
    });

    localStorage.setItem('anisync_user_taste_dna', JSON.stringify(computedResult));
    addToast(`Zevk profilin oluşturuldu: ${computedResult.dnaTitle}!`, 'success');

    if (onCompleted) {
      onCompleted(computedResult);
    }
  };

  const handleQuickAdd = (animeData: TasteProfileResult['recommendedAnimes'][0]) => {
    const mockAnime: Anime = {
      mal_id: animeData.mal_id,
      title: animeData.title,
      title_english: animeData.title,
      images: {
        jpg: { image_url: animeData.image, large_image_url: animeData.image },
        webp: { image_url: animeData.image, large_image_url: animeData.image }
      },
      synopsis: animeData.reason,
      score: animeData.score,
      episodes: 24,
      status: 'Finished Airing',
      genres: [{ mal_id: 1, name: selectedGenres[0] || 'Aksiyon' }],
      year: 2024
    };
    addToWatchlist(mockAnime, 'plan_to_watch');
    addToast(`${animeData.title} izleme listenize eklendi!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-white border-4 border-black neo-shadow flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-3.5 bg-neutral-950 text-white border-b-4 border-black flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-400 text-black border border-black flex items-center justify-center font-black">
              <Compass size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-black text-xs uppercase tracking-wider text-amber-400">
                KİŞİSELLEŞTİRİLMİŞ ANİME ZEVK ANALİZİ
              </h3>
              <p className="text-[10px] text-neutral-400 font-bold uppercase">
                {result ? "OTAKU DNA KARTIN VE ÖZEL LİSTEN" : `ADIM ${step} / 3: ZEVKİNİ BELİRLE`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {!result ? (
            <div className="space-y-5">
              
              {/* Step 1: Genres */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-black text-black uppercase tracking-tight">
                      1. HANGİ TÜR VE TEMALARDAN HOŞLANIRSIN?
                    </h4>
                    <p className="text-xs text-neutral-600 font-bold uppercase mt-0.5">
                      En çok ilgini çeken 1 ila 4 türü seç (Seçili: {selectedGenres.length}/4)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {GENRE_OPTIONS.map((g) => {
                      const isSelected = selectedGenres.includes(g.id);
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => toggleGenre(g.id)}
                          className={cn(
                            "p-3 border-2 border-black font-black text-xs uppercase text-left flex items-center justify-between transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000]",
                            isSelected ? "bg-amber-400 text-black" : "bg-neutral-50 text-black hover:bg-neutral-100"
                          )}
                        >
                          <span className="flex items-center gap-1.5">
                            <span>{g.icon}</span>
                            <span>{g.label}</span>
                          </span>
                          {isSelected && <Check size={14} strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Pacing */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-black text-black uppercase tracking-tight">
                      2. İDEAL İZLEME TEMPON VE MODUN NASILDIR?
                    </h4>
                    <p className="text-xs text-neutral-600 font-bold uppercase mt-0.5">
                      Bir anime izlerken seni en çok içine çeken atmosferi seç
                    </p>
                  </div>

                  <div className="space-y-3">
                    {PACING_OPTIONS.map((p) => {
                      const isSelected = selectedPacing === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPacing(p.id)}
                          className={cn(
                            "w-full p-3.5 border-2 border-black text-left font-black transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000]",
                            isSelected ? "bg-rose-600 text-white" : "bg-neutral-50 text-black hover:bg-neutral-100"
                          )}
                        >
                          <div className="text-xs uppercase mb-1 flex items-center justify-between">
                            <span>{p.title}</span>
                            {isSelected && <Check size={14} strokeWidth={3} />}
                          </div>
                          <p className={cn("text-[11px] font-bold leading-relaxed", isSelected ? "text-rose-100" : "text-neutral-600")}>
                            {p.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Archetype */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-black text-black uppercase tracking-tight">
                      3. EN ÇOK HANGİ KARAKTER ARKETİPİNE ÇEKİLİRSİN?
                    </h4>
                    <p className="text-xs text-neutral-600 font-bold uppercase mt-0.5">
                      Başrolde veya kilit noktada görmeyi sevdiğin kişilik tarzı
                    </p>
                  </div>

                  <div className="space-y-3">
                    {ARCHETYPE_OPTIONS.map((a) => {
                      const isSelected = selectedArchetype === a.id;
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setSelectedArchetype(a.id)}
                          className={cn(
                            "w-full p-3.5 border-2 border-black text-left font-black transition-all cursor-pointer shadow-[2px_2px_0px_0px_#000]",
                            isSelected ? "bg-amber-400 text-black" : "bg-neutral-50 text-black hover:bg-neutral-100"
                          )}
                        >
                          <div className="text-xs uppercase mb-1 flex items-center justify-between">
                            <span>{a.title}</span>
                            {isSelected && <Check size={14} strokeWidth={3} />}
                          </div>
                          <p className="text-[11px] font-bold text-neutral-700 leading-relaxed">
                            {a.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* Result DNA Screen */
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-amber-400 border-4 border-black p-5 neo-shadow text-black">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{result.dnaBadge}</span>
                  <span className="font-black text-xs uppercase bg-black text-amber-400 px-2 py-0.5">
                    SENİN OTAKU DNA&apos;N
                  </span>
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-2">
                  {result.dnaTitle}
                </h3>
                <p className="text-xs font-bold leading-relaxed">
                  {result.description}
                </p>
              </div>

              {/* Curated 3 starter recommendations */}
              <div>
                <h4 className="font-black text-xs uppercase text-black tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-rose-600" />
                  BU PROFİLE ÖZEL DERLENEN 3 BAŞYAPIT:
                </h4>

                <div className="space-y-2.5">
                  {result.recommendedAnimes.map((rec) => {
                    const isAlreadySaved = watchlist.some(w => w.anime.mal_id === rec.mal_id);
                    return (
                      <div
                        key={rec.mal_id}
                        className="p-3 bg-neutral-950 border-2 border-black text-white flex items-center justify-between gap-3 shadow-[2px_2px_0px_0px_#000]"
                      >
                        <img 
                          src={rec.image} 
                          alt={rec.title} 
                          className="w-12 h-16 object-cover border border-white shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-black text-xs uppercase truncate text-white">
                            {rec.title}
                          </h5>
                          <span className="text-[10px] text-amber-400 font-bold block mb-1">
                            ★ MAL Skoru: {rec.score}
                          </span>
                          <p className="text-[10px] text-neutral-300 font-bold line-clamp-1">
                            {rec.reason}
                          </p>
                        </div>

                        <button
                          onClick={() => handleQuickAdd(rec)}
                          disabled={isAlreadySaved}
                          className={cn(
                            "px-3 py-1.5 border border-black font-black text-[10px] uppercase flex items-center gap-1 shrink-0 cursor-pointer",
                            isAlreadySaved ? "bg-emerald-400 text-black" : "bg-white text-black hover:bg-amber-400"
                          )}
                        >
                          {isAlreadySaved ? <Check size={12} /> : <Bookmark size={12} />}
                          <span>{isAlreadySaved ? "LİSTEDE" : "EKLE"}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-black text-white hover:bg-neutral-800 border-2 border-black font-black text-xs uppercase cursor-pointer neo-shadow"
                >
                  PROFİLİME KAYDET VE TAMAMLA
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Step Navigation Footer */}
        {!result && (
          <div className="p-3.5 bg-neutral-100 border-t-2 border-black flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                className="px-4 py-2 bg-white hover:bg-neutral-200 border-2 border-black font-black text-xs uppercase flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>GERİ</span>
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev + 1)}
                className="px-5 py-2 bg-black hover:bg-neutral-800 text-white border-2 border-black font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer neo-shadow"
              >
                <span>İLERİ</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishSurvey}
                className="px-6 py-2 bg-amber-400 hover:bg-amber-300 text-black border-2 border-black font-black text-xs uppercase flex items-center gap-1.5 cursor-pointer neo-shadow shadow-[2px_2px_0px_0px_#000]"
              >
                <Sparkles size={14} />
                <span>PROFİLİMİ OLUŞTUR</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
