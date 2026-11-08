/**
 * Anime/Manga Yaşam Simülasyonu — Olay Motoru
 * DeepSeek konsept analizine dayalı: "1 in 8 Billion" uyarlaması
 * 
 * Temel kurallar:
 * - Plot armor yok: kanon karakterler ölmez, sen ölebilirsin
 * - Sıradan NPC olarak doğarsın (balıkçı çocuğu, köylü, çırak)
 * - Kanon karakterler sadece "hava durumu" gibi sahneye girer
 * - Gizli istatistikler: güç, zeka, şans, sosyal sınıf
 * - Seçimler 3 kart halinde sunulur
 * - Ölüm ekranında Anma Sayfası çıkar
 */

import { AnimeWorld } from '../data/animeWorlds';
import { AnimeRegion } from '../data/animeRegions';
import { getWorldLore } from '../data/lore';

// ─── Tipler ───────────────────────────────────────────────

export interface LifeStats {
  power: number;       // 0-100: fiziksel güç
  intelligence: number; // 0-100: zeka/strateji
  luck: number;         // 0-100: şans
  socialClass: number;   // 0-100: sosyal sınıf (0=yoksul, 100=soylu)
  health: number;        // 0-100: sağlık
}

export interface LifeEvent {
  id: string;
  age: number;
  year: number; // evren içi yıl
  title: string;
  description: string;
  type: 'birth' | 'childhood' | 'faction' | 'encounter' | 'crisis' | 'choice' | 'death' | 'special';
  choices?: LifeChoice[];
  outcome?: string;
  statChanges?: Partial<LifeStats>;
  isDeath?: boolean;
  deathCause?: string;
  isCanonEncounter?: boolean;
  canonCharacter?: string;
}

export interface LifeChoice {
  id: string;
  label: string;
  description: string;
  statChanges: Partial<LifeStats>;
  consequences: string[];
  risk: 'low' | 'medium' | 'high' | 'extreme';
}

export interface LifeResult {
  worldId: string;
  regionId: string;
  period: 'today' | 'past' | 'future';
  gender: 'male' | 'female';
  focus: LifeFocus;
  birthYear: number;
  deathYear: number;
  deathAge: number;
  deathCause: string;
  finalStats: LifeStats;
  events: LifeEvent[];
  memorialText: string;
  achievements: string[];
  isCanonEncountered: boolean;
  canonEncounters: string[];
}

// ─── İstatistik Hesaplama ────────────────────────────────

function rollDice(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollChance(probability: number): boolean {
  return Math.random() < probability;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ─── Odak (Focus) Seçimi ─────────────────────────────────
// Oyuncu başlangıçta bir odak seçer; bu odak stat gelişimini ve olayları etkiler.
export type LifeFocus = 'study' | 'combat' | 'social' | 'exploration' | 'survival';

export interface FocusOption {
  id: LifeFocus;
  label: string;
  description: string;
  statBias: Partial<LifeStats>;
}

export const LIFE_FOCUSES: FocusOption[] = [
  { id: 'study', label: 'Eğitim & Bilgi', description: 'Okul, araştırma, zeka odaklı', statBias: { intelligence: 15, socialClass: 5 } },
  { id: 'combat', label: 'Güç & Savaş', description: 'Antrenman, dövüş, güç odaklı', statBias: { power: 15, health: -3 } },
  { id: 'social', label: 'Sosyal & İlişkiler', description: 'Arkadaşlık, ağ, sosyal statü', statBias: { socialClass: 15, luck: 5 } },
  { id: 'exploration', label: 'Keşif & Macera', description: 'Dünya keşfi, risk alma', statBias: { luck: 12, power: 5, health: -3 } },
  { id: 'survival', label: 'Hayatta Kalma', description: 'Sağlık, dayanıklılık, güvenlik', statBias: { health: 15, socialClass: -5 } }
];

function applyFocusBias(stats: LifeStats, focus: LifeFocus): LifeStats {
  const opt = LIFE_FOCUSES.find(f => f.id === focus);
  if (!opt) return stats;
  const result = { ...stats };
  for (const [key, val] of Object.entries(opt.statBias)) {
    const k = key as keyof LifeStats;
    result[k] = clamp(result[k] + (val || 0), 0, 100);
  }
  return result;
}

function generateInitialStats(world: AnimeWorld, region: AnimeRegion): LifeStats {
  const basePower = rollDice(10, 40);
  const baseIntelligence = rollDice(10, 40);
  const baseLuck = rollDice(5, 30);
  const baseSocialClass = Math.round(region.stats.povertyRate * -50 + 50 + rollDice(-10, 10));
  const baseHealth = rollDice(60, 100);

  return {
    power: clamp(basePower, 0, 100),
    intelligence: clamp(baseIntelligence, 0, 100),
    luck: clamp(baseLuck, 0, 100),
    socialClass: clamp(baseSocialClass, 0, 100),
    health: clamp(baseHealth, 0, 100)
  };
}

// ─── Olay Üreticileri ────────────────────────────────────

function createBirthEvent(world: AnimeWorld, region: AnimeRegion, birthYear: number): LifeEvent {
  const hasPowerPotential = rollChance(region.stats.powerAwakeningRate);
  const hasAdventurePotential = rollChance(region.stats.adventureRate);

  return {
    id: 'birth',
    age: 0,
    year: birthYear,
    title: 'Doğum',
    description: `${region.nameTR} bölgesinde, ${world.nameTR} evreninde doğdun. ${hasPowerPotential ? 'Gizli bir güç potansiyelin var.' : 'Sıradan bir ailenin çocuğusun.'} ${hasAdventurePotential ? 'Macera dolu bir hayat seni bekliyor olabilir.' : 'Huzurlu bir yaşam sürmen olası.'}`,
    type: 'birth',
    statChanges: hasPowerPotential ? { power: 5, luck: 5 } : {},
    isCanonEncounter: false
  };
}

function createChildhoodEvent(world: AnimeWorld, region: AnimeRegion, age: number, year: number, stats: LifeStats): LifeEvent {
  const childhoodEvents: { title: string; description: string; choices: LifeChoice[] }[] = [
    {
      title: 'Çocukluk Yılları',
      description: `${age} yaşındasın. ${region.nameTR} bölgesinde büyüyor, ${world.nameTR} evreninin kurallarını öğreniyorsun.`,
      choices: [
        { id: 'school', label: 'Okula Git', description: 'Bilgi ve sosyal beceriler kazan', statChanges: { intelligence: 10, socialClass: 5 }, consequences: ['Okuryazarlık', 'Sosyal bağlar'], risk: 'low' },
        { id: 'work', label: 'Çalışmaya Başla', description: 'Erken para kazan, pratik beceriler edin', statChanges: { power: 5, socialClass: -5 }, consequences: ['Pratik beceriler', 'Erken bağımsızlık'], risk: 'medium' },
        { id: 'explore', label: 'Keşfet ve Oyna', description: 'Dünyayı tanı, özgürlüğü seç', statChanges: { luck: 8, health: -3 }, consequences: ['Keşif ruhu', 'Risk alma alışkanlığı'], risk: 'high' }
      ]
    },
    {
      title: 'Aile ve Toplum',
      description: `Ailen ${region.stats.povertyRate > 0.2 ? 'yoksul' : 'orta halli'} bir aile. ${world.dangerLevel === 'extreme' ? 'Hayatta kalmak için her gün mücadele ediyorsun.' : 'Huzurlu ama sıradan bir yaşamın var.'}`,
      choices: [
        { id: 'family', label: 'Aileye Yardım Et', description: 'Aile bağlarını güçlendir', statChanges: { socialClass: 5, health: 5 }, consequences: ['Aile desteği', 'Güvenlik'], risk: 'low' },
        { id: 'friends', label: 'Arkadaşlarla Zaman Geçir', description: 'Sosyal ağ oluştur', statChanges: { intelligence: 3, luck: 5 }, consequences: ['Sosyal ağ', 'Bilgi paylaşımı'], risk: 'medium' },
        { id: 'alone', label: 'Kendi Başına Çalış', description: 'Bağımsızlığı seç', statChanges: { power: 5, intelligence: 5, socialClass: -3 }, consequences: ['Bağımsızlık', 'İzolasyon'], risk: 'high' }
      ]
    }
  ];

  const event = childhoodEvents[age % childhoodEvents.length];
  return {
    id: `childhood_${age}`,
    age,
    year: year,
    title: event.title,
    description: event.description,
    type: 'childhood',
    choices: event.choices,
    isCanonEncounter: false
  };
}

function createFactionEvent(world: AnimeWorld, region: AnimeRegion, age: number, year: number, stats: LifeStats): LifeEvent {
  // Faction options depend on the world
  const factionOptions: Record<string, LifeChoice[]> = {
    shonen_battle: [
      { id: 'marine', label: 'Denizci Ol', description: 'Adalet ve disiplin yolu', statChanges: { socialClass: 10, power: 5 }, consequences: ['Disiplin', 'Güvenlik'], risk: 'low' },
      { id: 'pirate', label: 'Korsan Ol', description: 'Özgürlük ve macera yolu', statChanges: { power: 10, luck: 5, socialClass: -10 }, consequences: ['Macera', 'Risk'], risk: 'high' },
      { id: 'civilian', label: 'Sivil Kal', description: 'Huzurlu ve güvenli yaşam', statChanges: { health: 10, socialClass: 5 }, consequences: ['Güvenlik', 'Sıradanlık'], risk: 'low' },
      { id: 'revolutionary', label: 'Devrimci Katıl', description: 'Dünyayı değiştirmek için savaş', statChanges: { power: 8, intelligence: 5, socialClass: -15 }, consequences: ['İdealizm', 'Tehlike'], risk: 'extreme' }
    ],
    dark_fantasy: [
      { id: 'soldier', label: 'Asker Ol', description: 'Savaşmak ve hayatta kalmak', statChanges: { power: 10, health: -5 }, consequences: ['Savaş deneyimi', 'Travma'], risk: 'high' },
      { id: 'hunter', label: 'Avcı Ol', description: 'Canavar avlamak ve keşfetmek', statChanges: { power: 8, luck: 5 }, consequences: ['Keşif', 'Risk'], risk: 'medium' },
      { id: 'civilian', label: 'Sivil Kal', description: 'Hayatta kalmaya çalış', statChanges: { health: 10, socialClass: -5 }, consequences: ['Güvenlik', 'Yoksulluk'], risk: 'low' },
      { id: 'cultist', label: 'Kült Katıl', description: 'Karanlık güçlerle anlaşma yap', statChanges: { power: 15, health: -10, luck: -5 }, consequences: ['Güç', 'Lanet'], risk: 'extreme' }
    ],
    isekai: [
      { id: 'adventurer', label: 'Maceracı Ol', description: 'Görevler ve maceralar', statChanges: { power: 8, intelligence: 5, luck: 5 }, consequences: ['Macera', 'XP'], risk: 'medium' },
      { id: 'merchant', label: 'Tüccar Ol', description: 'Ticaret ve ekonomi', statChanges: { intelligence: 10, socialClass: 10 }, consequences: ['Para', 'Sosyal statü'], risk: 'low' },
      { id: 'scholar', label: 'Bilgin Ol', description: 'Büyü ve araştırma', statChanges: { intelligence: 15, power: -3 }, consequences: ['Bilgi', 'Güçsüzlük'], risk: 'medium' },
      { id: 'hermit', label: 'Münzevi Ol', description: 'Yalnız yaşam ve meditasyon', statChanges: { power: 5, intelligence: 8, socialClass: -10 }, consequences: ['Gizem', 'İzolasyon'], risk: 'low' }
    ]
  };

  const options = factionOptions[world.id] || factionOptions.shonen_battle;
  const lore = getWorldLore(world.id);
  const factionNames = lore ? lore.factions.slice(0, 4).map(f => f.name).join(', ') : '';

  return {
    id: `faction_${age}`,
    age,
    year,
    title: 'Fraksiyon Seçimi',
    description: `${age} yaşındasın. ${region.nameTR} bölgesinde ${world.nameTR} evreninde bir fraksiyon seçmen gerekiyor (örn. ${factionNames}). Bu seçim hayatının yönünü belirleyecek.`,
    type: 'faction',
    choices: options,
    isCanonEncounter: false
  };
}

function createCrisisEvent(world: AnimeWorld, region: AnimeRegion, age: number, year: number, stats: LifeStats, includeHeavy: boolean = true): LifeEvent | null {
  const crisisTypes: { title: string; description: string; choices: LifeChoice[]; heavy: boolean }[] = [
    {
      title: 'Hastalık ve Kayıp',
      heavy: false,
      description: `${age} yaşındasın. ${region.nameTR} bölgesinde bir salgın veya hastalık yayılıyor. Sevdiklerinden biri etkilenmiş olabilir.`,
      choices: [
        { id: 'heal', label: 'Tedavi Ara', description: 'Tıp veya büyü ile çare bul', statChanges: { health: 10, intelligence: 5 }, consequences: ['Sağlık', 'Bilgi'], risk: 'medium' },
        { id: 'protect', label: 'Sevdiklerini Koru', description: 'Kendi sağlığını riske at', statChanges: { health: -10, socialClass: 5 }, consequences: ['Fedakarlık', 'Bağ'], risk: 'high' },
        { id: 'flee', label: 'Kaç', description: 'Hayatta kal, sonra dönerim', statChanges: { health: 5, socialClass: -5, luck: -3 }, consequences: ['Hayatta kalma', 'Suçluluk'], risk: 'low' }
      ]
    },
    {
      title: 'Savaş ve Çatışma',
      heavy: true,
      description: `${age} yaşındasın. ${world.nameTR} evreninde bir çatışma patlak verdi. ${region.nameTR} bölgesi de etkileniyor.`,
      choices: [
        { id: 'fight', label: 'Savaş', description: 'Cepheye git', statChanges: { power: 10, health: -15 }, consequences: ['Deneyim', 'Travma'], risk: 'extreme' },
        { id: 'hide', label: 'Saklan', description: 'Güvenli bir yer bul', statChanges: { health: 5, socialClass: -5 }, consequences: ['Güvenlik', 'Suçluluk'], risk: 'low' },
        { id: 'medic', label: 'Medik Ol', description: 'Yaralıları tedavi et', statChanges: { intelligence: 10, health: -5 }, consequences: ['Bilgi', 'Saygı'], risk: 'medium' }
      ]
    },
    {
      title: 'Güç Uyanışı',
      heavy: false,
      description: `${age} yaşındasın. ${world.powerSystem} sisteminde bir uyanış belirtisi hissediyorsun. Bu güç seni değiştirebilir.`,
      choices: [
        { id: 'embrace', label: 'Gücü Kabul Et', description: 'Gücü kabul et ve eğit', statChanges: { power: 15, health: -5 }, consequences: ['Güç', 'Risk'], risk: 'high' },
        { id: 'reject', label: 'Gücü Reddet', description: 'Sıradan kal, güvenli ol', statChanges: { health: 10, socialClass: 5 }, consequences: ['Güvenlik', 'Sıradanlık'], risk: 'low' },
        { id: 'study', label: 'Gücü Çalış', description: 'Bilimsel olarak incele', statChanges: { intelligence: 15, power: 5 }, consequences: ['Bilgi', 'Güç'], risk: 'medium' }
      ]
    }
  ];

  const available = includeHeavy ? crisisTypes : crisisTypes.filter(c => !c.heavy);
  if (available.length === 0) return null;
  const crisis = available[Math.floor(Math.random() * available.length)];
  const helpNote = '\\n\\n💡 Yardım: Bu tür krizlerde topluluk desteği, profesyonel yardım ve aile bağları hayatta kalma şansını artırır. AniSync topluluğunda benzer deneyimler paylaşılabilir.';
  return {
    id: `crisis_${age}`,
    age,
    year,
    title: crisis.title,
    description: crisis.description + helpNote,
    type: 'crisis',
    choices: crisis.choices,
    isCanonEncounter: false
  };
}

function createCanonEncounter(world: AnimeWorld, region: AnimeRegion, age: number, year: number): LifeEvent | null {
  // Canon character encounters — bölge (region) bazlı, böylece seçilen seriye uygun karakterler çıkar
  const encounters: Record<string, { minAge: number; maxAge: number; character: string; description: string; probability: number }[]> = {
    // Shounen Battle World — bölgeye göre seri
    konoha: [
      { minAge: 8, maxAge: 15, character: 'Naruto', description: 'Turuncu kıyafetli bir ninja köyden geçiyor. "Dattebayo!" diye bağırıyor.', probability: 0.15 },
      { minAge: 12, maxAge: 20, character: 'Sasuke', description: 'Karanlık yüzlü bir genç, Sharingan gözüyle seni süzüyor.', probability: 0.10 },
      { minAge: 15, maxAge: 25, character: 'Kakashi', description: 'Gümüş saçlı, maske takan bir jonin kitabı okuyarak geçiyor.', probability: 0.08 }
    ],
    kanton: [
      { minAge: 8, maxAge: 15, character: 'Luffy', description: 'Uzakta, deniz kenarında bir çocuk koşuyor. "Korsanlar Kralı olacağım!" diye bağırıyor.', probability: 0.15 },
      { minAge: 12, maxAge: 20, character: 'Zoro', description: 'Bir kılıç ustası, antrenman yaparken görürsün. Üç kılıç kullanıyor.', probability: 0.10 },
      { minAge: 15, maxAge: 25, character: 'Nami', description: 'Turuncu saçlı bir kız, harita çizerek geçiyor.', probability: 0.08 }
    ],
    soul_society: [
      { minAge: 10, maxAge: 20, character: 'Ichigo', description: 'Turuncu saçlı bir genç, dev kılıç taşıyor. Hollow avında.', probability: 0.12 },
      { minAge: 12, maxAge: 22, character: 'Rukia', description: 'Küçük boylu bir shinigami, kılıç dansı yapıyor.', probability: 0.08 },
      { minAge: 15, maxAge: 25, character: 'Byakuya', description: 'Sakin ve soğuk bir kaptan, sakura yaprakları savuruyor.', probability: 0.06 }
    ],
    marley: [
      { minAge: 12, maxAge: 20, character: 'Eren', description: 'Yeşil gözlü bir genç, özgürlükten bahsediyor.', probability: 0.12 },
      { minAge: 15, maxAge: 25, character: 'Levi', description: 'Kısa boylu, temizlik takıntılı bir asker komutan geçiyor.', probability: 0.08 },
      { minAge: 10, maxAge: 18, character: 'Mikasa', description: 'Siyah saçlı bir kız, kırmızı eşarp takıyor.', probability: 0.07 }
    ],
    jujutsu_high: [
      { minAge: 15, maxAge: 25, character: 'Gojo', description: 'Beyaz saçlı, körbandı takan bir adam seni geçip gidiyor. Çevresinde hava farklı hissediliyor.', probability: 0.10 },
      { minAge: 14, maxAge: 22, character: 'Yuji', description: 'Pembe saçlı bir genç, yumruk sallayarak antrenman yapıyor.', probability: 0.08 },
      { minAge: 10, maxAge: 20, character: 'Tanjiro', description: 'Kırmızı gözlü bir genç, kılıç çantasıyla yolculuk ediyor. Yanında bir kutu taşıyor.', probability: 0.10 }
    ],
    // Diğer dünyalar (tek havuz)
    dark_fantasy: [
      { minAge: 10, maxAge: 20, character: 'Guts', description: 'Dev kılıç taşıyan bir adam gece yarısı geçip gidiyor. Gözlerinde derin bir hüzün var.', probability: 0.08 },
      { minAge: 15, maxAge: 25, character: 'Levi', description: 'Kısa boylu, temizlik takıntılı bir asker komutan geçiyor.', probability: 0.07 }
    ],
    isekai: [
      { minAge: 12, maxAge: 25, character: 'Subaru', description: 'Bir genç, "Emilia-tan!" diye bağırarak koşuyor.', probability: 0.10 },
      { minAge: 10, maxAge: 20, character: 'Kazuma', description: 'Yeşil saçlı bir maceracı, "Chunchunmaru!" diye bağırarak geçiyor.', probability: 0.08 }
    ],
    cyberpunk: [
      { minAge: 15, maxAge: 30, character: 'David', description: 'Siberpsikoz belirtileri gösteren bir genç, çatıdan çatıya atlıyor.', probability: 0.09 },
      { minAge: 18, maxAge: 35, character: 'Akane', description: 'Mavi saçlı bir müfettiş, Dominatör ile suç katsayısı ölçüyor.', probability: 0.07 }
    ],
    seinen_psych: [
      { minAge: 18, maxAge: 40, character: 'L', description: 'Beyaz gömlekli, çömelmiş oturan bir dedektif görürsün. Tatlı yiyor.', probability: 0.06 },
      { minAge: 20, maxAge: 45, character: 'Johan', description: 'Sarı saçlı, masum yüzlü bir adam. Gözlerinde korkunç bir boşluk var.', probability: 0.04 }
    ],
    romance_drama: [],
    slice_of_life: [],
    sports: []
  };

  // Önce region bazlı havuz, yoksa world bazlı havuz
  const regionEncounters = encounters[region.id];
  const worldEncounters = encounters[world.id] || [];
  const pool = (regionEncounters && regionEncounters.length > 0) ? regionEncounters : worldEncounters;
  const validEncounters = pool.filter(e => age >= e.minAge && age <= e.maxAge);
  if (validEncounters.length === 0) return null;

  const encounter = validEncounters[Math.floor(Math.random() * validEncounters.length)];
  if (!rollChance(encounter.probability)) return null;

  return {
    id: `canon_${encounter.character}_${age}`,
    age,
    year,
    title: 'Kanon Karakter Karşılaşması',
    description: encounter.description,
    type: 'special',
    outcome: `Uzaktan ${encounter.character}'ı gördün. Bu anı ömür boyu hatırlayacaksın.`,
    isCanonEncounter: true,
    canonCharacter: encounter.character
  };
}

// ─── Turnuva Olayı (Tournament) ──────────────────────────
function createTournamentEvent(world: AnimeWorld, region: AnimeRegion, age: number, year: number, stats: LifeStats): LifeEvent {
  const tournaments: { title: string; description: string; choices: LifeChoice[] }[] = [
    {
      title: 'Turnuva',
      description: `${age} yaşındasın. ${region.nameTR} bölgesinde büyük bir turnuva düzenleniyor. ${world.nameTR} evreninin en güçlüleri burada.`,
      choices: [
        { id: 'enter', label: 'Turnuvaya Katıl', description: 'Güç ve şansını dene', statChanges: { power: 10, luck: -5, health: -8 }, consequences: ['Deneyim', 'Ün'], risk: 'high' },
        { id: 'train', label: 'Antrenman Yap', description: 'Hazırlan, sonra katıl', statChanges: { power: 5, intelligence: 5 }, consequences: ['Hazırlık', 'Sabır'], risk: 'low' },
        { id: 'watch', label: 'İzle ve Öğren', description: 'Taktik ve teknik gözlemle', statChanges: { intelligence: 8, luck: 3 }, consequences: ['Bilgi', 'İlham'], risk: 'low' },
        { id: 'bribe', label: 'Hile Yap', description: 'Kazanmak için her yolu dene', statChanges: { luck: 10, socialClass: -15 }, consequences: ['Kısa vadeli zafer', 'İtibar kaybı'], risk: 'extreme' }
      ]
    }
  ];
  const t = tournaments[0];
  return {
    id: `tournament_${age}`,
    age,
    year,
    title: t.title,
    description: t.description,
    type: 'special',
    choices: t.choices,
    isCanonEncounter: false
  };
}

// ─── Klan Olayı (Clan) ───────────────────────────────────
function createClanEvent(world: AnimeWorld, region: AnimeRegion, age: number, year: number, stats: LifeStats): LifeEvent {
  const clans: { title: string; description: string; choices: LifeChoice[] }[] = [
    {
      title: 'Klan Seçimi',
      description: `${age} yaşındasın. ${region.nameTR} bölgesinde güçlü bir klan seni davet ediyor. Bu seçim sosyal statünü ve güç yolunu belirleyecek.`,
      choices: [
        { id: 'join', label: 'Klana Katıl', description: 'Güç ve koruma kazan', statChanges: { socialClass: 15, power: 5 }, consequences: ['Koruma', 'Bağlılık'], risk: 'medium' },
        { id: 'independent', label: 'Bağımsız Kal', description: 'Kendi yolunu çiz', statChanges: { intelligence: 5, luck: 5, socialClass: -5 }, consequences: ['Özgürlük', 'Risk'], risk: 'high' },
        { id: 'rival', label: 'Rakip Klana Katıl', description: 'Güçlü düşmanla ittifak', statChanges: { power: 10, socialClass: -10 }, consequences: ['Güç', 'Düşman'], risk: 'extreme' },
        { id: 'mediate', label: 'Arabulucu Ol', description: 'Klanlar arasında barış', statChanges: { intelligence: 8, socialClass: 8 }, consequences: ['Saygı', 'Risk'], risk: 'medium' }
      ]
    }
  ];
  const c = clans[0];
  return {
    id: `clan_${age}`,
    age,
    year,
    title: c.title,
    description: c.description,
    type: 'faction',
    choices: c.choices,
    isCanonEncounter: false
  };
}

// ─── Evrim / Dönüşüm Olayı (Evolution) ──────────────────
function createEvolutionEvent(world: AnimeWorld, region: AnimeRegion, age: number, year: number, stats: LifeStats): LifeEvent | null {
  if (stats.power < 50 && stats.intelligence < 50) return null;
  const isPowerPath = stats.power >= stats.intelligence;
  return {
    id: `evolution_${age}`,
    age,
    year,
    title: 'Güç Uyanışı',
    description: `${age} yaşındasın. ${world.powerSystem} sisteminde derin bir uyanış hissediyorsun. ${isPowerPath ? 'Fiziksel gücün zirveye ulaşmak üzere.' : 'Zihinsel yeteneklerin evrilmek üzere.'}`,
    type: 'special',
    choices: [
      { id: 'embrace', label: 'Gücü Kabul Et', description: 'Evrimi tamamla', statChanges: isPowerPath ? { power: 15, health: -5 } : { intelligence: 15, health: -5 }, consequences: ['Evrim', 'Risk'], risk: 'high' },
      { id: 'reject', label: 'Reddet', description: 'İnsan kal, güvenli ol', statChanges: { health: 10, socialClass: 5 }, consequences: ['Güvenlik', 'Sıradanlık'], risk: 'low' },
      { id: 'study', label: 'Çalış ve Kontrol Et', description: 'Gücü bilimsel olarak incele', statChanges: { intelligence: 12, power: 5 }, consequences: ['Bilgi', 'Güç'], risk: 'medium' },
      { id: 'share', label: 'Gücü Paylaş', description: 'Başkalarına öğret', statChanges: { socialClass: 10, intelligence: 5, power: -3 }, consequences: ['Saygı', 'Güç kaybı'], risk: 'medium' }
    ],
    isCanonEncounter: false
  };
}

// ─── Zaman Döngüsü Olayı (Time Loop) ────────────────────
function createTimeLoopEvent(world: AnimeWorld, region: AnimeRegion, age: number, year: number, stats: LifeStats): LifeEvent | null {
  if (!rollChance(0.08)) return null;
  return {
    id: `timeloop_${age}`,
    age,
    year,
    title: 'Deja Vu',
    description: `${age} yaşındasın. ${region.nameTR} bölgesinde sanki bu anı daha önce yaşamışsın gibi bir his. Zaman mı döngüye girdi?`,
    type: 'special',
    choices: [
      { id: 'investigate', label: 'Araştır', description: 'Gizemi çöz', statChanges: { intelligence: 10, luck: -3 }, consequences: ['Bilgi', 'Risk'], risk: 'medium' },
      { id: 'ignore', label: 'Görmezden Gel', description: 'Normal yaşamına devam et', statChanges: { health: 5 }, consequences: ['Güvenlik', 'Merak'], risk: 'low' },
      { id: 'embrace', label: 'Döngüyü Kabul Et', description: 'Zamanı kullan', statChanges: { luck: 15, health: -10 }, consequences: ['Şans', 'Travma'], risk: 'extreme' }
    ],
    isCanonEncounter: false
  };
}

// ─── Dönüm Noktası Olayı (Milestone: 5/15/30/50/70) ────
function createMilestoneEvent(world: AnimeWorld, region: AnimeRegion, age: number, year: number, stats: LifeStats): LifeEvent {
  const milestones: Record<number, { title: string; description: string; choices: LifeChoice[] }> = {
    5: {
      title: 'Çocukluk Dönüm Noktası',
      description: `${age} yaşındasın. ${region.nameTR} bölgesinde çocukluğunun ilk yılları geride kaldı. ${world.nameTR} evreninde nasıl biri olacağını seçme zamanı.`,
      choices: [
        { id: 'curious', label: 'Meraklı Ol', description: 'Dünyayı keşfet, sorular sor', statChanges: { intelligence: 8, luck: 5 }, consequences: ['Merak', 'Bilgi'], risk: 'low' },
        { id: 'obedient', label: 'İtaatkâr Ol', description: 'Kurallara uy, güvenli kal', statChanges: { socialClass: 5, health: 5 }, consequences: ['Güvenlik', 'Uyum'], risk: 'low' },
        { id: 'rebel', label: 'Asi Ol', description: 'Kuralları sorgula', statChanges: { power: 5, socialClass: -5, luck: 3 }, consequences: ['Bağımsızlık', 'Risk'], risk: 'medium' }
      ]
    },
    15: {
      title: 'Gençlik Dönüm Noktası',
      description: `${age} yaşındasın. ${region.nameTR} bölgesinde ergenlik çağındasın. ${world.nameTR} evreninde geleceğin için ilk büyük kararı verme zamanı.`,
      choices: [
        { id: 'study', label: 'Eğitime Odaklan', description: 'Okul ve bilgi', statChanges: { intelligence: 12, socialClass: 5 }, consequences: ['Bilgi', 'Kariyer'], risk: 'low' },
        { id: 'train', label: 'Güç Antrenmanı', description: 'Fiziksel güç', statChanges: { power: 12, health: -3 }, consequences: ['Güç', 'Disiplin'], risk: 'medium' },
        { id: 'social', label: 'Sosyal Ağ', description: 'İlişkiler ve bağlantılar', statChanges: { socialClass: 10, luck: 5 }, consequences: ['Ağ', 'Fırsat'], risk: 'medium' },
        { id: 'freedom', label: 'Özgürlüğü Seç', description: 'Kendi yolunu çiz', statChanges: { luck: 8, power: 5, socialClass: -5 }, consequences: ['Özgürlük', 'Risk'], risk: 'high' }
      ]
    },
    30: {
      title: 'Yetişkinlik Dönüm Noktası',
      description: `${age} yaşındasın. ${region.nameTR} bölgesinde yetişkin hayatının ortasındasın. ${world.nameTR} evreninde kurduğun hayatın meyvelerini toplama veya yön değiştirme zamanı.`,
      choices: [
        { id: 'settle', label: 'Yerleş ve İstikrar', description: 'Aile ve kariyer', statChanges: { socialClass: 10, health: 5 }, consequences: ['İstikrar', 'Güvenlik'], risk: 'low' },
        { id: 'adventure', label: 'Macera Peşinde', description: 'Yeni ufuklar', statChanges: { luck: 10, power: 5, health: -5 }, consequences: ['Macera', 'Risk'], risk: 'high' },
        { id: 'mentor', label: 'Mentor Ol', description: 'Gençlere rehberlik et', statChanges: { socialClass: 8, intelligence: 8 }, consequences: ['Saygı', 'Etki'], risk: 'medium' },
        { id: 'change', label: 'Yön Değiştir', description: 'Yeni bir başlangıç', statChanges: { intelligence: 8, luck: 8, socialClass: -3 }, consequences: ['Yenilik', 'Belirsizlik'], risk: 'medium' }
      ]
    },
    50: {
      title: 'Olgunluk Dönüm Noktası',
      description: `${age} yaşındasın. ${region.nameTR} bölgesinde hayatının ikinci yarısındasın. ${world.nameTR} evreninde mirasın ve etkin ne olacak?`,
      choices: [
        { id: 'legacy', label: 'Miras Bırak', description: 'Bir şeyler yarat ve öğret', statChanges: { socialClass: 10, intelligence: 5 }, consequences: ['Miras', 'Saygı'], risk: 'low' },
        { id: 'enjoy', label: 'Hayatın Tadını Çıkar', description: 'Dinlen ve yaşa', statChanges: { health: 10, luck: 5 }, consequences: ['Mutluluk', 'Sağlık'], risk: 'low' },
        { id: 'fight', label: 'Mücadeleye Devam', description: 'Hâlâ güçlüsün', statChanges: { power: 10, health: -5 }, consequences: ['Güç', 'Risk'], risk: 'high' },
        { id: 'reflect', label: 'Düşün ve Değerlendir', description: 'Hayatını gözden geçir', statChanges: { intelligence: 10, socialClass: 5 }, consequences: ['Bilgelik', 'Huzur'], risk: 'low' }
      ]
    },
    70: {
      title: 'Yaşlılık Dönüm Noktası',
      description: `${age} yaşındasın. ${region.nameTR} bölgesinde hayatının son evresindesin. ${world.nameTR} evreninde nasıl hatırlanmak istersin?`,
      choices: [
        { id: 'peace', label: 'Huzur İçinde', description: 'Sakin ve mutlu yaşa', statChanges: { health: 10, luck: 5 }, consequences: ['Huzur', 'Sağlık'], risk: 'low' },
        { id: 'story', label: 'Hikayeni Anlat', description: 'Deneyimlerini paylaş', statChanges: { socialClass: 10, intelligence: 5 }, consequences: ['Miras', 'Saygı'], risk: 'low' },
        { id: 'final', label: 'Son Bir Macera', description: 'Risk al, son kez', statChanges: { power: 8, luck: 8, health: -10 }, consequences: ['Macera', 'Risk'], risk: 'extreme' },
        { id: 'family', label: 'Aileyle Ol', description: 'Sevdiklerinle zaman geçir', statChanges: { socialClass: 8, health: 5 }, consequences: ['Bağ', 'Mutluluk'], risk: 'low' }
      ]
    }
  };
  const m = milestones[age];
  if (!m) return null as any;
  return {
    id: `milestone_${age}`,
    age,
    year,
    title: m.title,
    description: m.description,
    type: 'special',
    choices: m.choices,
    isCanonEncounter: false
  };
}

// ─── Ana Yaşam Üretici ───────────────────────────────────

export interface GenerateLifeOptions {
  includeHeavy?: boolean;
  period?: 'today' | 'past' | 'future';
  focus?: LifeFocus;
}

export type LifePeriod = 'today' | 'past' | 'future';

export function generateLife(
  world: AnimeWorld,
  region: AnimeRegion,
  duration: '30min' | '1h' | '1.5h',
  options: GenerateLifeOptions = {}
): LifeResult {
  const includeHeavy = options.includeHeavy !== false;
  const period = options.period || 'today';
  const focus: LifeFocus = options.focus || LIFE_FOCUSES[Math.floor(Math.random() * LIFE_FOCUSES.length)].id;
  const gender: 'male' | 'female' = Math.random() < 0.5 ? 'male' : 'female';
  // Yaşam beklentisi ve çocuk ölümü döneme göre ayarlanır
  const periodMultiplier = period === 'past' ? 0.85 : period === 'future' ? 1.1 : 1.0;
  const genderMultiplier = gender === 'female' ? 1.04 : 0.97;
  const adjustedLE: [number, number] = [
    Math.round(world.lifeExpectancy[0] * periodMultiplier * genderMultiplier),
    Math.round(world.lifeExpectancy[1] * periodMultiplier * genderMultiplier)
  ];
  const baseStats = generateInitialStats(world, region);
  const stats = applyFocusBias(baseStats, focus);
  let birthYear: number;
  if (period === 'past') {
    birthYear = 1950 + Math.floor(Math.random() * 76); // 1950-2025
  } else if (period === 'future') {
    birthYear = 2027 + Math.floor(Math.random() * 24); // 2027-2050
  } else {
    birthYear = 2026;
  }
  const events: LifeEvent[] = [];

  // Life duration mapping
  const lifeYears = duration === '30min' ? rollDice(15, 35) :
                    duration === '1h' ? rollDice(35, 65) :
                    rollDice(65, 90);

  // Clamp by world life expectancy
  const clampedLife = clamp(lifeYears, adjustedLE[0], adjustedLE[1]);

  // Birth event
  events.push(createBirthEvent(world, region, birthYear));

  // Childhood events (ages 5-12)
  for (let age = 5; age <= 12; age += 3) {
    events.push(createChildhoodEvent(world, region, age, birthYear + age, stats));
  }

  // Faction choice (age 15)
  events.push(createFactionEvent(world, region, 15, birthYear + 15, stats));

  // Yearly focus events (her 5 yılda bir odak bazlı gelişim)
  for (let age = 10; age <= Math.min(60, clampedLife - 3); age += 5) {
    const focusOpt = LIFE_FOCUSES.find(f => f.id === focus);
    if (focusOpt) {
      events.push({
        id: `focus_${age}`,
        age,
        year: birthYear + age,
        title: `Odak Gelişimi: ${focusOpt.label}`,
        description: `${age} yaşındasın. ${focusOpt.description} odaklı hayatın meyvelerini topluyorsun.`,
        type: 'special',
        statChanges: focusOpt.statBias,
        isCanonEncounter: false
      });
    }
  }

  // Milestone events at key ages
  const milestoneAges = [5, 15, 30, 50, 70];
  for (const mAge of milestoneAges) {
    if (mAge === 5 || mAge === 15) continue; // already covered by childhood/faction
    if (mAge <= clampedLife - 2) {
      const me = createMilestoneEvent(world, region, mAge, birthYear + mAge, stats);
      if (me) events.push(me);
    }
  }
  // Milestone at 5 (extra, before childhood ends) and 15 already has faction; add 5
  if (clampedLife >= 7) {
    const m5 = createMilestoneEvent(world, region, 5, birthYear + 5, stats);
    if (m5) events.push(m5);
  }

  // Tournament event (age 18, chance)
  if (rollChance(0.6)) {
    events.push(createTournamentEvent(world, region, 18, birthYear + 18, stats));
  }

  // Clan event (age 20)
  if (clampedLife >= 22) {
    events.push(createClanEvent(world, region, 20, birthYear + 20, stats));
  }

  // Evolution event (age 22, if stats qualify)
  if (clampedLife >= 25) {
    const evo = createEvolutionEvent(world, region, 22, birthYear + 22, stats);
    if (evo) events.push(evo);
  }

  // Time loop events (rare, ages 12-30)
  for (let age = 12; age <= Math.min(30, clampedLife - 5); age += rollDice(6, 10)) {
    const tl = createTimeLoopEvent(world, region, age, birthYear + age, stats);
    if (tl) events.push(tl);
  }

  // Canon encounter check (age 10-25)
  for (let age = 10; age <= 25; age += 5) {
    const encounter = createCanonEncounter(world, region, age, birthYear + age);
    if (encounter) events.push(encounter);
  }

  // Crisis events (ages 18-40, random)
  for (let age = 18; age <= Math.min(40, clampedLife - 5); age += rollDice(5, 8)) {
    if (rollChance(0.4)) {
      const ce = createCrisisEvent(world, region, age, birthYear + age, stats, includeHeavy);
      if (ce) events.push(ce);
    }
  }

  // Death — yaşam tablosu (life table) tabanlı
  // Bebeklik ölümü olasılığı + yaşa göre artan ölüm riski (Gompertz benzeri)
  const childMortality = Math.min(0.3, region.stats.diseaseRate * 0.4 + region.stats.povertyRate * 0.2);
  let deathAge: number;
  if (Math.random() < childMortality) {
    deathAge = rollDice(0, 4);
  } else {
    const mean = (adjustedLE[0] + adjustedLE[1]) / 2;
    const sd = (adjustedLE[1] - adjustedLE[0]) / 4;
    // Box-Muller normal approximation
    const u1 = Math.max(0.0001, Math.random());
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    deathAge = Math.round(mean + z * sd);
    deathAge = clamp(deathAge, 5, adjustedLE[1] + 8);
  }
  deathAge = clamp(deathAge, 0, 120);

  // Ölüm nedeni yaşa göre (DSÖ GHE bölgesel/yaşa göre kalıplar basitleştirilmiş)
  let deathCause: string;
  if (deathAge < 1) {
    deathCause = 'Bebeklik hastalığı';
  } else if (deathAge < 5) {
    deathCause = 'Çocukluk hastalığı';
  } else if (deathAge < 15) {
    deathCause = Math.random() < 0.5 ? 'Hastalık' : 'Kaza';
  } else if (deathAge < 40) {
    const r = Math.random();
    if (r < 0.35) deathCause = 'Hastalık';
    else if (r < 0.55) deathCause = 'Kaza';
    else if (r < 0.7) deathCause = 'Şiddet/Savaş';
    else deathCause = 'Doğa felaketi';
  } else if (deathAge < 65) {
    const r = Math.random();
    if (r < 0.6) deathCause = 'Hastalık';
    else if (r < 0.8) deathCause = 'Kaza';
    else deathCause = 'Yaşlılık';
  } else {
    const r = Math.random();
    if (r < 0.75) deathCause = 'Yaşlılık';
    else deathCause = 'Hastalık';
  }

  const deathEvent: LifeEvent = {
    id: 'death',
    age: deathAge,
    year: birthYear + deathAge,
    title: 'Ölüm',
    description: `${deathAge} yaşında ${region.nameTR} bölgesinde hayatın sona erdi. Neden: ${deathCause}.`,
    type: 'death',
    isDeath: true,
    deathCause
  };
  events.push(deathEvent);

  // Sort events by age
  events.sort((a, b) => a.age - b.age);

  // Generate memorial text
  const memorialText = generateMemorialText(world, region, birthYear, deathAge, deathCause, stats, events, gender, period);

  // Generate achievements
  const achievements = generateAchievements(world, region, stats, events, deathAge);

  // Check canon encounters
  const canonEncounters = events.filter(e => e.isCanonEncounter).map(e => e.canonCharacter || '');
  const isCanonEncountered = canonEncounters.length > 0;

  return {
    worldId: world.id,
    regionId: region.id,
    period,
    gender,
    focus,
    birthYear,
    deathYear: birthYear + deathAge,
    deathAge,
    deathCause,
    finalStats: stats,
    events,
    memorialText,
    achievements,
    isCanonEncountered,
    canonEncounters
  };
}

// ─── Anma Sayfası (Memorial) ─────────────────────────────

function generateMemorialText(
  world: AnimeWorld,
  region: AnimeRegion,
  birthYear: number,
  deathAge: number,
  deathCause: string,
  stats: LifeStats,
  events: LifeEvent[],
  gender: 'male' | 'female' = 'male',
  period: 'today' | 'past' | 'future' = 'today'
): string {
  const canonEncounters = events.filter(e => e.isCanonEncounter).map(e => e.canonCharacter);

  let text = `═══════════════════════════════════════\n`;
  text += `         ANMA SAYFASI — HATIRLANAN HAYAT\n`;
  text += `═══════════════════════════════════════\n\n`;
  text += `🌍 Evren: ${world.nameTR}\n`;
  text += `📍 Bölge: ${region.nameTR}\n`;
  text += `👤 Cinsiyet: ${gender === 'male' ? 'Erkek' : 'Kadın'}\n`;
  text += `⏳ Dönem: ${period === 'past' ? 'Geçmiş' : period === 'future' ? 'Gelecek' : 'Bugün'}\n`;
  text += `📅 Doğum: ${birthYear}\n`;
  text += `💀 Ölüm: ${birthYear + deathAge} (${deathAge} yaşında)\n`;
  text += `Cause: ${deathCause}\n\n`;
  text += `📊 İstatistikler:\n`;
  text += `   Güç: ${stats.power}/100\n`;
  text += `   Zeka: ${stats.intelligence}/100\n`;
  text += `   Şans: ${stats.luck}/100\n`;
  text += `   Sosyal Sınıf: ${stats.socialClass}/100\n`;
  text += `   Sağlık: ${stats.health}/100\n\n`;

  if (canonEncounters.length > 0) {
    text += `✨ Kanon Karakter Karşılaşmaları:\n`;
    canonEncounters.forEach(c => {
      text += `   • ${c} ile karşılaştın\n`;
    });
    text += `\n`;
  }

  text += `📝 Hayat Özeti:\n`;
  text += `   ${events.length} olay yaşandı.\n`;
  text += `   ${deathAge} yıl boyunca ${region.nameTR} bölgesinde yaşadın.\n\n`;

  if (stats.socialClass < 30) {
    text += `   Yoksul bir aileden doğdun, hayatta kalmak için mücadele ettin.\n`;
  } else if (stats.socialClass > 70) {
    text += `   Soylu bir aileden doğdun, konforlu bir yaşam sürdün.\n`;
  } else {
    text += `   Orta halli bir aileden doğdun, dengeli bir yaşam sürdün.\n`;
  }

  if (stats.power > 60) {
    text += `   Güçlü bir savaşçıydın.\n`;
  }
  if (stats.intelligence > 60) {
    text += `   Zeki ve stratejik biriydin.\n`;
  }
  if (stats.luck > 60) {
    text += `   Şanslı bir hayat sürdün.\n`;
  }

  text += `\n═══════════════════════════════════════\n`;
  text += `İsmin hatırlanmadı. Ama bir hayat yaşandı.\n`;
  text += `═══════════════════════════════════════`;

  return text;
}

// ─── Başarılar (Achievements) ────────────────────────────

function generateAchievements(
  world: AnimeWorld,
  region: AnimeRegion,
  stats: LifeStats,
  events: LifeEvent[],
  deathAge: number
): string[] {
  const achievements: string[] = [];

  if (deathAge >= 80) achievements.push('Yaşlılık');
  if (deathAge >= 60 && deathAge < 80) achievements.push('Uzun Yaşam');
  if (deathAge < 20) achievements.push('Erken Vefat');
  if (stats.power > 70) achievements.push('Güçlü Savaşçı');
  if (stats.intelligence > 70) achievements.push('Zeka Küpü');
  if (stats.luck > 70) achievements.push('Şanslı');
  if (stats.socialClass > 70) achievements.push('Soylu');
  if (stats.socialClass < 20) achievements.push('Yoksul');
  if (stats.health > 80) achievements.push('Sağlıklı');
  if (events.some(e => e.isCanonEncounter)) achievements.push('Kanon Karakterle Karşılaştı');
  if (world.dangerLevel === 'extreme' && deathAge >= 30) achievements.push('Hayatta Kalma Ustası');
  if (world.dangerLevel === 'low' && deathAge >= 70) achievements.push('Huzurlu Yaşam');
  if (events.filter(e => e.type === 'crisis').length >= 3) achievements.push('Kriz Yöneticisi');
  if (events.filter(e => e.type === 'choice').length >= 2) achievements.push('Seçimci');

  return achievements;
}

// ─── Hayat Süresi Hesaplama ──────────────────────────────

export function getLifeDurationMinutes(duration: '30min' | '1h' | '1.5h'): number {
  return duration === '30min' ? 30 : duration === '1h' ? 60 : 90;
}

// ─── Olay Zaman Çizelgesi ────────────────────────────────

export function getEventTimeline(life: LifeResult): { age: number; event: LifeEvent }[] {
  return life.events.map(e => ({ age: e.age, event: e }));
}

// ─── Paylaşım Metni ──────────────────────────────────────

export function generateShareText(life: LifeResult, world: AnimeWorld, region: AnimeRegion): string {
  return `🌍 ${world.nameTR} evreninde ${region.nameTR} bölgesinde ${life.deathAge} yıl yaşadım.\n` +
    `Cause of death: ${life.deathCause}\n` +
    `Güç: ${life.finalStats.power} | Zeka: ${life.finalStats.intelligence} | Şans: ${life.finalStats.luck}\n` +
    (life.isCanonEncountered ? `✨ Kanon karakterlerle karşılaştım: ${life.canonEncounters.join(', ')}\n` : '') +
    `AniSync 8 Milyar Evrende 1`;
}