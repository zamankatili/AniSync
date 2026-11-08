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
import i18n from '../i18n';

/** İçerik motoru dili. TR → Türkçe, JA → Japonca, FR → Fransızca, diğerleri → İngilizce. */
type LifeLang = 'tr' | 'en' | 'ja' | 'fr';
function lifeLang(): LifeLang {
  const l = (typeof i18n !== 'undefined' && i18n?.language ? i18n.language : 'tr').toLowerCase();
  if (l.startsWith('tr')) return 'tr';
  if (l.startsWith('ja')) return 'ja';
  if (l.startsWith('fr')) return 'fr';
  return 'en';
}

const L = (tr: string, en: string, ja: string, fr: string) => {
  const l = lifeLang();
  return l === 'tr' ? tr : l === 'ja' ? ja : l === 'fr' ? fr : en;
};
/** TR dışı her şey İngilizce içeriğe düşer (doğum/çocukluk/odak JA/FR tam çeviri). */
const isEn = () => lifeLang() !== 'tr';
const worldNameL = (w: AnimeWorld) => (lifeLang() === 'tr' ? w.nameTR : w.nameEN);
const regionNameL = (r: AnimeRegion) => (lifeLang() === 'tr' ? r.nameTR : r.nameEN);

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
  characterName: string;
  familyStatus: 'poor' | 'middle' | 'noble';
  education: 'none' | 'basic' | 'high' | 'university';
  assets: number; // sembolik para birimi
  birthYear: number;
  deathYear: number;
  deathAge: number;
  deathCause: string;
  /** Doğumdaki statlar. Oyuncu seçimleri buna eklenerek güncel statlar hesaplanır. */
  initialStats: LifeStats;
  /** Seçimler hariç, olayların deterministik etkisiyle oluşan statlar. */
  finalStats: LifeStats;
  events: LifeEvent[];
  memorialText: string;
  achievements: string[];
  isCanonEncountered: boolean;
  canonEncounters: string[];
}

export function applyStatChanges(stats: LifeStats, changes?: Partial<LifeStats>): LifeStats {
  if (!changes) return stats;
  const result = { ...stats };
  for (const [key, val] of Object.entries(changes)) {
    const k = key as keyof LifeStats;
    result[k] = clamp(result[k] + (val || 0), 0, 100);
  }
  return result;
}

export function getFamilyStatus(socialClass: number): LifeResult['familyStatus'] {
  return socialClass < 30 ? 'poor' : socialClass > 70 ? 'noble' : 'middle';
}

export function getEducationTier(intelligence: number): LifeResult['education'] {
  return intelligence < 25 ? 'none' : intelligence < 50 ? 'basic' : intelligence < 75 ? 'high' : 'university';
}

/**
 * Oynanış sırasında gösterilecek güncel statları hesaplar.
 * Doğum statları + o ana kadar yaşanan olaylar + yapılan seçimler.
 */
export function computeStatsAt(
  life: LifeResult,
  eventIndex: number,
  choices: Record<string, string> = {}
): LifeStats {
  let stats: LifeStats = { ...(life.initialStats ?? life.finalStats) };
  const last = Math.min(eventIndex, life.events.length - 1);
  for (let i = 0; i <= last; i++) {
    const event = life.events[i];
    stats = applyStatChanges(stats, event.statChanges);
    const choiceId = choices[event.id];
    if (choiceId && event.choices) {
      const choice = event.choices.find(c => c.id === choiceId);
      if (choice) stats = applyStatChanges(stats, choice.statChanges);
    }
  }
  return stats;
}

/** Sosyal sınıf değişimine göre güncel varlıkları hesaplar. */
export function computeAssetsAt(life: LifeResult, stats: LifeStats): number {
  const base = life.initialStats ?? life.finalStats;
  return Math.max(0, Math.round(life.assets + (stats.socialClass - base.socialClass) * 100));
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

const FOCUS_LABELS: Record<LifeFocus, { labelTR: string; labelEN: string; labelJA: string; labelFR: string; descTR: string; descEN: string; descJA: string; descFR: string }> = {
  study: { labelTR: 'Eğitim & Bilgi', labelEN: 'Study & Knowledge', labelJA: '勉強と知恵', labelFR: 'Études et savoir', descTR: 'Okul, araştırma, zeka odaklı', descEN: 'School, research, intelligence-focused', descJA: '学校、研究、知性重視', descFR: 'École, recherche, axé sur l\'intelligence' },
  combat: { labelTR: 'Güç & Savaş', labelEN: 'Power & Combat', labelJA: '力と戦い', labelFR: 'Force et combat', descTR: 'Antrenman, dövüş, güç odaklı', descEN: 'Training, fighting, power-focused', descJA: '訓練、戦い、力重視', descFR: 'Entraînement, combat, axé sur la force' },
  social: { labelTR: 'Sosyal & İlişkiler', labelEN: 'Social & Relationships', labelJA: '社交と人間関係', labelFR: 'Vie sociale et relations', descTR: 'Arkadaşlık, ağ, sosyal statü', descEN: 'Friendship, network, social status', descJA: '友情、人脈、社交的な地位', descFR: 'Amitié, réseau, statut social' },
  exploration: { labelTR: 'Keşif & Macera', labelEN: 'Exploration & Adventure', labelJA: '探求と冒険', labelFR: 'Exploration et aventure', descTR: 'Dünya keşfi, risk alma', descEN: 'Discovery, risk-taking', descJA: '世界探求、リスクを取る', descFR: 'Découverte du monde, prise de risque' },
  survival: { labelTR: 'Hayatta Kalma', labelEN: 'Survival', labelJA: '生存', labelFR: 'Survie', descTR: 'Sağlık, dayanıklılık, güvenlik', descEN: 'Health, endurance, safety', descJA: '健康、持久、安全', descFR: 'Santé, endurance, sécurité' },
};
const focusLabelL = (id: LifeFocus) => {
  const l = lifeLang();
  return l === 'tr' ? FOCUS_LABELS[id].labelTR : l === 'ja' ? FOCUS_LABELS[id].labelJA : l === 'fr' ? FOCUS_LABELS[id].labelFR : FOCUS_LABELS[id].labelEN;
};
const focusDescL = (id: LifeFocus) => {
  const l = lifeLang();
  return l === 'tr' ? FOCUS_LABELS[id].descTR : l === 'ja' ? FOCUS_LABELS[id].descJA : l === 'fr' ? FOCUS_LABELS[id].descFR : FOCUS_LABELS[id].descEN;
};

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
    title: L('Doğum', 'Birth', '誕生', 'Naissance'),
    description: L(
      `${region.nameTR} bölgesinde, ${world.nameTR} evreninde doğdun. ${hasPowerPotential ? 'Gizli bir güç potansiyelin var.' : 'Sıradan bir ailenin çocuğusun.'} ${hasAdventurePotential ? 'Macera dolu bir hayat seni bekliyor olabilir.' : 'Huzurlu bir yaşam sürmen olası.'}`,
      `You were born in the ${world.nameEN} world, in the ${region.nameEN} region. ${hasPowerPotential ? 'You carry a hidden power potential.' : 'You are an ordinary family kid.'} ${hasAdventurePotential ? 'An adventure-filled life may await you.' : 'A peaceful life is likely for you.'}`,
      `${world.nameEN}の世界、${region.nameEN}地方に生まれた。${hasPowerPotential ? '秘められた力の資質がある。' : '平凡な家の生まれだ。'} ${hasAdventurePotential ? '冒険に満ちた人生が待っているかもしれない。' : '穏やかな人生を送れそうだ。'}`,
      `Tu es né dans le monde ${world.nameEN}, dans la région de ${region.nameEN}. ${hasPowerPotential ? 'Tu portes un potentiel de pouvoir caché.' : 'Tu es un enfant de famille ordinaire.'} ${hasAdventurePotential ? 'Une vie pleine d\'aventure t\'attend peut-être.' : 'Une vie paisible t\'est sans doute promise.'}`
    ),
    type: 'birth',
    statChanges: hasPowerPotential ? { power: 5, luck: 5 } : {},
    isCanonEncounter: false
  };
}

function createChildhoodEvent(world: AnimeWorld, region: AnimeRegion, age: number, year: number, stats: LifeStats): LifeEvent {
  const l = lifeLang();
  const childhoodEvents: { title: string; description: string; choices: LifeChoice[] }[] = (() => {
    if (l === 'ja') {
      return [
        {
          title: '幼少期',
          description: `${age}歳。${region.nameEN}地方で育ち、${world.nameEN}の世界のルールを学んでいる。`,
          choices: [
            { id: 'school', label: '学校に行く', description: '知識と社交性を身につける', statChanges: { intelligence: 10, socialClass: 5 }, consequences: ['読み書き', '人との絆'], risk: 'low' },
            { id: 'work', label: '働き始める', description: '早くに収入を得て実践的な技を磨く', statChanges: { power: 5, socialClass: -5 }, consequences: ['実践的な技', '早期の自立'], risk: 'medium' },
            { id: 'explore', label: '探検して遊ぶ', description: '世界を知り自由を選ぶ', statChanges: { luck: 8, health: -3 }, consequences: ['探求心', 'リスクを取る癖'], risk: 'high' }
          ]
        },
        {
          title: '家族と社会',
          description: `家族は${region.stats.povertyRate > 0.2 ? '貧しい' : '普通の'}家庭だ。${world.dangerLevel === 'extreme' ? '毎日生きることとの戦いだ。' : '穏やかだが平凡な暮らしだ。'}`,
          choices: [
            { id: 'family', label: '家族を助ける', description: '家族の絆を深める', statChanges: { socialClass: 5, health: 5 }, consequences: ['家族の支え', '安全'], risk: 'low' },
            { id: 'friends', label: '友達と過ごす', description: '社会的なつながりを築く', statChanges: { intelligence: 3, luck: 5 }, consequences: ['人脈', '知識の共有'], risk: 'medium' },
            { id: 'alone', label: '一人で取り組む', description: '自立を選ぶ', statChanges: { power: 5, intelligence: 5, socialClass: -3 }, consequences: ['自立', '孤立'], risk: 'high' }
          ]
        }
      ];
    }
    if (l === 'fr') {
      return [
        {
          title: 'Enfance',
          description: `Tu as ${age} ans. Tu grandis dans la région de ${region.nameEN}, à apprendre les règles du monde ${world.nameEN}.`,
          choices: [
            { id: 'school', label: 'Aller à l\'école', description: 'Acquérir des connaissances et des compétences sociales', statChanges: { intelligence: 10, socialClass: 5 }, consequences: ['Alphabétisation', 'Liens sociaux'], risk: 'low' },
            { id: 'work', label: 'Commencer à travailler', description: 'Gagne de l\'argent tôt et apprenez des compétences pratiques', statChanges: { power: 5, socialClass: -5 }, consequences: ['Compétences pratiques', 'Indépendance précoce'], risk: 'medium' },
            { id: 'explore', label: 'Explorer et jouer', description: 'Découvre le monde et choisis la liberté', statChanges: { luck: 8, health: -3 }, consequences: ['Esprit de découverte', 'Habitude du risque'], risk: 'high' }
          ]
        },
        {
          title: 'Famille et société',
          description: `Ta famille est ${region.stats.povertyRate > 0.2 ? 'une famille pauvre' : 'une famille ordinaire'}. ${world.dangerLevel === 'extreme' ? 'Tu te bats chaque jour pour survivre.' : 'Tu mènes une vie paisible mais ordinaire.'}`,
          choices: [
            { id: 'family', label: 'Aider ta famille', description: 'Renforce les liens familiaux', statChanges: { socialClass: 5, health: 5 }, consequences: ['Soutien familial', 'Sécurité'], risk: 'low' },
            { id: 'friends', label: 'Passer du temps avec des amis', description: 'Construire un réseau social', statChanges: { intelligence: 3, luck: 5 }, consequences: ['Réseau social', 'Partage de connaissances'], risk: 'medium' },
            { id: 'alone', label: 'Travailler seul', description: 'Choisis l\'indépendance', statChanges: { power: 5, intelligence: 5, socialClass: -3 }, consequences: ['Indépendance', 'Isolement'], risk: 'high' }
          ]
        }
      ];
    }
    return (l === 'en' ? [
    {
      title: 'Childhood Years',
      description: `You are ${age} years old. You are growing up in the ${regionNameL(region)} region, learning the rules of the ${worldNameL(world)} world.`,
      choices: [
        { id: 'school', label: 'Go to School', description: 'Gain knowledge and social skills', statChanges: { intelligence: 10, socialClass: 5 }, consequences: ['Literacy', 'Social bonds'], risk: 'low' },
        { id: 'work', label: 'Start Working', description: 'Earn money early and learn practical skills', statChanges: { power: 5, socialClass: -5 }, consequences: ['Practical skills', 'Early independence'], risk: 'medium' },
        { id: 'explore', label: 'Explore and Play', description: 'Learn the world, choose freedom', statChanges: { luck: 8, health: -3 }, consequences: ['Spirit of discovery', 'Risk-taking habits'], risk: 'high' }
      ]
    },
    {
      title: 'Family and Community',
      description: `Your family is ${region.stats.povertyRate > 0.2 ? 'a poor' : 'an average'} family. ${world.dangerLevel === 'extreme' ? 'You fight to survive every single day.' : 'Your life is peaceful but ordinary.'}`,
      choices: [
        { id: 'family', label: 'Help Your Family', description: 'Strengthen family bonds', statChanges: { socialClass: 5, health: 5 }, consequences: ['Family support', 'Security'], risk: 'low' },
        { id: 'friends', label: 'Spend Time With Friends', description: 'Build a social network', statChanges: { intelligence: 3, luck: 5 }, consequences: ['Social network', 'Knowledge sharing'], risk: 'medium' },
        { id: 'alone', label: 'Work on Your Own', description: 'Choose independence', statChanges: { power: 5, intelligence: 5, socialClass: -3 }, consequences: ['Independence', 'Isolation'], risk: 'high' }
      ]
    }
  ] : [
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
  ]);
  })();

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
  const en = isEn();
  // Faction options depend on the world
  const factionOptions: Record<string, LifeChoice[]> = {
    shonen_battle: en ? [
      { id: 'marine', label: 'Become a Marine', description: 'The path of justice and discipline', statChanges: { socialClass: 10, power: 5 }, consequences: ['Discipline', 'Security'], risk: 'low' },
      { id: 'pirate', label: 'Become a Pirate', description: 'The path of freedom and adventure', statChanges: { power: 10, luck: 5, socialClass: -10 }, consequences: ['Adventure', 'Risk'], risk: 'high' },
      { id: 'civilian', label: 'Stay a Civilian', description: 'A peaceful and safe life', statChanges: { health: 10, socialClass: 5 }, consequences: ['Security', 'Ordinariness'], risk: 'low' },
      { id: 'revolutionary', label: 'Join the Revolutionaries', description: 'Fight to change the world', statChanges: { power: 8, intelligence: 5, socialClass: -15 }, consequences: ['Idealism', 'Danger'], risk: 'extreme' }
    ] : [
      { id: 'marine', label: 'Denizci Ol', description: 'Adalet ve disiplin yolu', statChanges: { socialClass: 10, power: 5 }, consequences: ['Disiplin', 'Güvenlik'], risk: 'low' },
      { id: 'pirate', label: 'Korsan Ol', description: 'Özgürlük ve macera yolu', statChanges: { power: 10, luck: 5, socialClass: -10 }, consequences: ['Macera', 'Risk'], risk: 'high' },
      { id: 'civilian', label: 'Sivil Kal', description: 'Huzurlu ve güvenli yaşam', statChanges: { health: 10, socialClass: 5 }, consequences: ['Güvenlik', 'Sıradanlık'], risk: 'low' },
      { id: 'revolutionary', label: 'Devrimci Katıl', description: 'Dünyayı değiştirmek için savaş', statChanges: { power: 8, intelligence: 5, socialClass: -15 }, consequences: ['İdealizm', 'Tehlike'], risk: 'extreme' }
    ],
    dark_fantasy: en ? [
      { id: 'soldier', label: 'Become a Soldier', description: 'Fight and survive', statChanges: { power: 10, health: -5 }, consequences: ['Battle experience', 'Trauma'], risk: 'high' },
      { id: 'hunter', label: 'Become a Hunter', description: 'Hunt monsters and explore', statChanges: { power: 8, luck: 5 }, consequences: ['Discovery', 'Risk'], risk: 'medium' },
      { id: 'civilian', label: 'Stay a Civilian', description: 'Try to survive', statChanges: { health: 10, socialClass: -5 }, consequences: ['Security', 'Poverty'], risk: 'low' },
      { id: 'cultist', label: 'Join the Cult', description: 'Make a deal with dark powers', statChanges: { power: 15, health: -10, luck: -5 }, consequences: ['Power', 'Curse'], risk: 'extreme' }
    ] : [
      { id: 'soldier', label: 'Asker Ol', description: 'Savaşmak ve hayatta kalmak', statChanges: { power: 10, health: -5 }, consequences: ['Savaş deneyimi', 'Travma'], risk: 'high' },
      { id: 'hunter', label: 'Avcı Ol', description: 'Canavar avlamak ve keşfetmek', statChanges: { power: 8, luck: 5 }, consequences: ['Keşif', 'Risk'], risk: 'medium' },
      { id: 'civilian', label: 'Sivil Kal', description: 'Hayatta kalmaya çalış', statChanges: { health: 10, socialClass: -5 }, consequences: ['Güvenlik', 'Yoksulluk'], risk: 'low' },
      { id: 'cultist', label: 'Kült Katıl', description: 'Karanlık güçlerle anlaşma yap', statChanges: { power: 15, health: -10, luck: -5 }, consequences: ['Güç', 'Lanet'], risk: 'extreme' }
    ],
    isekai: en ? [
      { id: 'adventurer', label: 'Become an Adventurer', description: 'Quests and adventures', statChanges: { power: 8, intelligence: 5, luck: 5 }, consequences: ['Adventure', 'XP'], risk: 'medium' },
      { id: 'merchant', label: 'Become a Merchant', description: 'Trade and economy', statChanges: { intelligence: 10, socialClass: 10 }, consequences: ['Money', 'Social status'], risk: 'low' },
      { id: 'scholar', label: 'Become a Scholar', description: 'Magic and research', statChanges: { intelligence: 15, power: -3 }, consequences: ['Knowledge', 'Weakness'], risk: 'medium' },
      { id: 'hermit', label: 'Become a Hermit', description: 'Solitude and meditation', statChanges: { power: 5, intelligence: 8, socialClass: -10 }, consequences: ['Mystery', 'Isolation'], risk: 'low' }
    ] : [
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
    title: en ? 'Faction Choice' : 'Fraksiyon Seçimi',
    description: en
      ? `You are ${age} years old. In the ${regionNameL(region)} region of the ${worldNameL(world)} world, you must choose a faction (e.g. ${factionNames}). This choice will set the course of your life.`
      : `${age} yaşındasın. ${region.nameTR} bölgesinde ${world.nameTR} evreninde bir fraksiyon seçmen gerekiyor (örn. ${factionNames}). Bu seçim hayatının yönünü belirleyecek.`,
    type: 'faction',
    choices: options,
    isCanonEncounter: false
  };
}

function createCrisisEvent(world: AnimeWorld, region: AnimeRegion, age: number, year: number, stats: LifeStats, includeHeavy: boolean = true): LifeEvent | null {
  const en = isEn();
  const crisisTypes: { title: string; description: string; choices: LifeChoice[]; heavy: boolean }[] = en ? [
    {
      title: 'Disease and Loss',
      heavy: false,
      description: `You are ${age} years old. An epidemic or illness is spreading through the ${regionNameL(region)} region. Someone you love may be affected.`,
      choices: [
        { id: 'heal', label: 'Seek Treatment', description: 'Find a cure with medicine or magic', statChanges: { health: 10, intelligence: 5 }, consequences: ['Health', 'Knowledge'], risk: 'medium' },
        { id: 'protect', label: 'Protect Your Loved Ones', description: 'Risk your own health', statChanges: { health: -10, socialClass: 5 }, consequences: ['Sacrifice', 'Bond'], risk: 'high' },
        { id: 'flee', label: 'Flee', description: 'Survive, and return later', statChanges: { health: 5, socialClass: -5, luck: -3 }, consequences: ['Survival', 'Guilt'], risk: 'low' }
      ]
    },
    {
      title: 'War and Conflict',
      heavy: true,
      description: `You are ${age} years old. A conflict has broken out in the ${worldNameL(world)} world. The ${regionNameL(region)} region is affected too.`,
      choices: [
        { id: 'fight', label: 'Fight', description: 'Go to the front line', statChanges: { power: 10, health: -15 }, consequences: ['Experience', 'Trauma'], risk: 'extreme' },
        { id: 'hide', label: 'Hide', description: 'Find a safe place', statChanges: { health: 5, socialClass: -5 }, consequences: ['Security', 'Guilt'], risk: 'low' },
        { id: 'medic', label: 'Be a Medic', description: 'Treat the wounded', statChanges: { intelligence: 10, health: -5 }, consequences: ['Knowledge', 'Respect'], risk: 'medium' }
      ]
    },
    {
      title: 'Power Awakening',
      heavy: false,
      description: `You are ${age} years old. You feel signs of an awakening within the ${world.powerSystem} system. This power could change you.`,
      choices: [
        { id: 'embrace', label: 'Embrace the Power', description: 'Accept the power and train', statChanges: { power: 15, health: -5 }, consequences: ['Power', 'Risk'], risk: 'high' },
        { id: 'reject', label: 'Reject the Power', description: 'Stay ordinary and safe', statChanges: { health: 10, socialClass: 5 }, consequences: ['Security', 'Ordinariness'], risk: 'low' },
        { id: 'study', label: 'Study the Power', description: 'Examine it scientifically', statChanges: { intelligence: 15, power: 5 }, consequences: ['Knowledge', 'Power'], risk: 'medium' }
      ]
    }
  ] : [
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
  const helpNote = isEn()
    ? '\n\n💡 Help: In crises like these, community support, professional help and strong family bonds greatly improve your chances of survival. You can share similar experiences in the AniSync community.'
    : '\n\n💡 Yardım: Bu tür krizlerde topluluk desteği, profesyonel yardım ve aile bağları hayatta kalma şansını artırır. AniSync topluluğunda benzer deneyimler paylaşılabilir.';
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
  const en = isEn();
  // Canon character encounters — bölge (region) bazlı, böylece seçilen seriye uygun karakterler çıkar
  const encounters: Record<string, { minAge: number; maxAge: number; character: string; description: string; descriptionEN: string; probability: number }[]> = {
    // Shounen Battle World — bölgeye göre seri
    konoha: [
      { minAge: 8, maxAge: 15, character: 'Naruto', description: 'Turuncu kıyafetli bir ninja köyden geçiyor. "Dattebayo!" diye bağırıyor.', descriptionEN: 'An orange-clad ninja walks through the village. "Dattebayo!" he shouts.', probability: 0.15 },
      { minAge: 12, maxAge: 20, character: 'Sasuke', description: 'Karanlık yüzlü bir genç, Sharingan gözüyle seni süzüyor.', descriptionEN: 'A dark-faced young man gazes at you with his Sharingan eye.', probability: 0.10 },
      { minAge: 15, maxAge: 25, character: 'Kakashi', description: 'Gümüş saçlı, maske takan bir jonin kitabı okuyarak geçiyor.', descriptionEN: 'A silver-haired, masked jonin walks past while reading a book.', probability: 0.08 }
    ],
    kanton: [
      { minAge: 8, maxAge: 15, character: 'Luffy', description: 'Uzakta, deniz kenarında bir çocuk koşuyor. "Korsanlar Kralı olacağım!" diye bağırıyor.', descriptionEN: 'Far away, by the sea, a kid runs. "I\'m gonna be the Pirate King!" he shouts.', probability: 0.15 },
      { minAge: 12, maxAge: 20, character: 'Zoro', description: 'Bir kılıç ustası, antrenman yaparken görürsün. Üç kılıç kullanıyor.', descriptionEN: 'You spot a swordsman training. He wields three swords.', probability: 0.10 },
      { minAge: 15, maxAge: 25, character: 'Nami', description: 'Turuncu saçlı bir kız, harita çizerek geçiyor.', descriptionEN: 'An orange-haired girl walks past while drawing a map.', probability: 0.08 }
    ],
    soul_society: [
      { minAge: 10, maxAge: 20, character: 'Ichigo', description: 'Turuncu saçlı bir genç, dev kılıç taşıyor. Hollow avında.', descriptionEN: 'An orange-haired youth carries a massive sword. He is hunting a Hollow.', probability: 0.12 },
      { minAge: 12, maxAge: 22, character: 'Rukia', description: 'Küçük boylu bir shinigami, kılıç dansı yapıyor.', descriptionEN: 'A short-statured shinigami performing a sword dance.', probability: 0.08 },
      { minAge: 15, maxAge: 25, character: 'Byakuya', description: 'Sakin ve soğuk bir kaptan, sakura yaprakları savuruyor.', descriptionEN: 'A calm and cold captain scattering sakura petals.', probability: 0.06 }
    ],
    marley: [
      { minAge: 12, maxAge: 20, character: 'Eren', description: 'Yeşil gözlü bir genç, özgürlükten bahsediyor.', descriptionEN: 'A green-eyed youth talks about freedom.', probability: 0.12 },
      { minAge: 15, maxAge: 25, character: 'Levi', description: 'Kısa boylu, temizlik takıntılı bir asker komutan geçiyor.', descriptionEN: 'A short, cleanliness-obsessed military commander walks past.', probability: 0.08 },
      { minAge: 10, maxAge: 18, character: 'Mikasa', description: 'Siyah saçlı bir kız, kırmızı eşarp takıyor.', descriptionEN: 'A black-haired girl wearing a red scarf.', probability: 0.07 }
    ],
    jujutsu_high: [
      { minAge: 15, maxAge: 25, character: 'Gojo', description: 'Beyaz saçlı, körbandı takan bir adam seni geçip gidiyor. Çevresinde hava farklı hissediliyor.', descriptionEN: 'A white-haired, blindfold-wearing man walks past you. The air feels different around him.', probability: 0.10 },
      { minAge: 14, maxAge: 22, character: 'Yuji', description: 'Pembe saçlı bir genç, yumruk sallayarak antrenman yapıyor.', descriptionEN: 'A pink-haired youth training by throwing punches.', probability: 0.08 },
      { minAge: 15, maxAge: 25, character: 'Nobara', description: 'Turuncu saçlı bir büyücü, çekiciyle lanetli ruhlara meydan okuyor.', descriptionEN: 'An orange-haired sorcerer challenging cursed spirits with her hammer.', probability: 0.07 }
    ],
    // Diğer dünyalar (tek havuz)
    dark_fantasy: [
      { minAge: 10, maxAge: 20, character: 'Guts', description: 'Dev kılıç taşıyan bir adam gece yarısı geçip gidiyor. Gözlerinde derin bir hüzün var.', descriptionEN: 'A man carrying a giant sword walks past at midnight. Deep sorrow in his eyes.', probability: 0.08 },
      { minAge: 15, maxAge: 25, character: 'Levi', description: 'Kısa boylu, temizlik takıntılı bir asker komutan geçiyor.', descriptionEN: 'A short, cleanliness-obsessed military commander walks past.', probability: 0.07 }
    ],
    isekai: [
      { minAge: 12, maxAge: 25, character: 'Subaru', description: 'Bir genç, "Emilia-tan!" diye bağırarak koşuyor.', descriptionEN: 'A young man runs while screaming "Emilia-tan!"', probability: 0.10 },
      { minAge: 10, maxAge: 20, character: 'Kazuma', description: 'Yeşil saçlı bir maceracı, "Chunchunmaru!" diye bağırarak geçiyor.', descriptionEN: 'A green-haired adventurer walks past shouting "Chunchunmaru!"', probability: 0.08 }
    ],
    cyberpunk: [
      { minAge: 15, maxAge: 30, character: 'David', description: 'Siberpsikoz belirtileri gösteren bir genç, çatıdan çatıya atlıyor.', descriptionEN: 'A youth showing signs of cyberpsychosis leaps from rooftop to rooftop.', probability: 0.09 },
      { minAge: 18, maxAge: 35, character: 'Akane', description: 'Mavi saçlı bir müfettiş, Dominatör ile suç katsayısı ölçüyor.', descriptionEN: 'A blue-haired inspector measures crime coefficients with her Dominator.', probability: 0.07 }
    ],
    seinen_psych: [
      { minAge: 18, maxAge: 40, character: 'L', description: 'Beyaz gömlekli, çömelmiş oturan bir dedektif görürsün. Tatlı yiyor.', descriptionEN: 'You spot a detective in a white shirt squatting down. Eating sweets.', probability: 0.06 },
      { minAge: 20, maxAge: 45, character: 'Johan', description: 'Sarı saçlı, masum yüzlü bir adam. Gözlerinde korkunç bir boşluk var.', descriptionEN: 'A blond, innocent-looking man. A terrifying emptiness in his eyes.', probability: 0.04 }
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
    title: L('Kanon Karakter Karşılaşması', 'Canon Character Encounter', '原作キャラクターとの遭遇', 'Rencontre avec un personnage canon'),
    description: isEn() ? encounter.descriptionEN : encounter.description,
    type: 'special',
    outcome: isEn()
      ? `From afar, you saw ${encounter.character}. You will remember this moment for the rest of your life.`
      : `Uzaktan ${encounter.character}'ı gördün. Bu anı ömür boyu hatırlayacaksın.`,
    isCanonEncounter: true,
    canonCharacter: encounter.character
  };
}

// ─── Turnuva Olayı (Tournament) ──────────────────────────
function createTournamentEvent(world: AnimeWorld, region: AnimeRegion, age: number, year: number, stats: LifeStats): LifeEvent {
  const en = isEn();
  const tournaments: { title: string; description: string; choices: LifeChoice[] }[] = en ? [
    {
      title: 'Tournament',
      description: `You are ${age} years old. A grand tournament is being held in the ${regionNameL(region)} region. The strongest of the ${worldNameL(world)} world are here.`,
      choices: [
        { id: 'enter', label: 'Enter the Tournament', description: 'Test your power and luck', statChanges: { power: 10, luck: -5, health: -8 }, consequences: ['Experience', 'Fame'], risk: 'high' },
        { id: 'train', label: 'Train First', description: 'Prepare, then compete', statChanges: { power: 5, intelligence: 5 }, consequences: ['Preparation', 'Patience'], risk: 'low' },
        { id: 'watch', label: 'Watch and Learn', description: 'Observe tactics and techniques', statChanges: { intelligence: 8, luck: 3 }, consequences: ['Knowledge', 'Inspiration'], risk: 'low' },
        { id: 'bribe', label: 'Cheat to Win', description: 'Try every way to win', statChanges: { luck: 10, socialClass: -15 }, consequences: ['Short-term victory', 'Lost reputation'], risk: 'extreme' }
      ]
    }
  ] : [
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
  const en = isEn();
  const clans: { title: string; description: string; choices: LifeChoice[] }[] = en ? [
    {
      title: 'Clan Selection',
      description: `You are ${age} years old. A powerful clan in the ${regionNameL(region)} region invites you. This choice will define your social standing and your path to power.`,
      choices: [
        { id: 'join', label: 'Join the Clan', description: 'Gain power and protection', statChanges: { socialClass: 15, power: 5 }, consequences: ['Protection', 'Loyalty'], risk: 'medium' },
        { id: 'independent', label: 'Stay Independent', description: 'Forge your own path', statChanges: { intelligence: 5, luck: 5, socialClass: -5 }, consequences: ['Freedom', 'Risk'], risk: 'high' },
        { id: 'rival', label: 'Join the Rival Clan', description: 'Ally with a powerful enemy', statChanges: { power: 10, socialClass: -10 }, consequences: ['Power', 'Enemy'], risk: 'extreme' },
        { id: 'mediate', label: 'Be the Mediator', description: 'Peace between the clans', statChanges: { intelligence: 8, socialClass: 8 }, consequences: ['Respect', 'Risk'], risk: 'medium' }
      ]
    }
  ] : [
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
  const en = isEn();
  const isPowerPath = stats.power >= stats.intelligence;
  return {
    id: `evolution_${age}`,
    age,
    year,
    title: en ? 'Power Awakening' : 'Güç Uyanışı',
    description: en
      ? `You are ${age} years old. You feel a profound awakening within the ${world.powerSystem} system. ${isPowerPath ? 'Your physical power is about to reach its peak.' : 'Your mental abilities are on the verge of evolving.'}`
      : `${age} yaşındasın. ${world.powerSystem} sisteminde derin bir uyanış hissediyorsun. ${isPowerPath ? 'Fiziksel gücün zirveye ulaşmak üzere.' : 'Zihinsel yeteneklerin evrilmek üzere.'}`,
    type: 'special',
    choices: en ? [
      { id: 'embrace', label: 'Embrace the Power', description: 'Complete the evolution', statChanges: isPowerPath ? { power: 15, health: -5 } : { intelligence: 15, health: -5 }, consequences: ['Evolution', 'Risk'], risk: 'high' },
      { id: 'reject', label: 'Refuse', description: 'Stay human and safe', statChanges: { health: 10, socialClass: 5 }, consequences: ['Security', 'Ordinariness'], risk: 'low' },
      { id: 'study', label: 'Study and Control It', description: 'Examine the power scientifically', statChanges: { intelligence: 12, power: 5 }, consequences: ['Knowledge', 'Power'], risk: 'medium' },
      { id: 'share', label: 'Share the Power', description: 'Teach it to others', statChanges: { socialClass: 10, intelligence: 5, power: -3 }, consequences: ['Respect', 'Power loss'], risk: 'medium' }
    ] : [
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
  const en = isEn();
  return {
    id: `timeloop_${age}`,
    age,
    year,
    title: 'Déjà Vu',
    description: en
      ? `You are ${age} years old. In the ${regionNameL(region)} region it feels like you already lived this moment. Has time looped?`
      : `${age} yaşındasın. ${region.nameTR} bölgesinde sanki bu anı daha önce yaşamışsın gibi bir his. Zaman mı döngüye girdi?`,
    type: 'special',
    choices: en ? [
      { id: 'investigate', label: 'Investigate', description: 'Solve the mystery', statChanges: { intelligence: 10, luck: -3 }, consequences: ['Knowledge', 'Risk'], risk: 'medium' },
      { id: 'ignore', label: 'Ignore It', description: 'Continue your normal life', statChanges: { health: 5 }, consequences: ['Safety', 'Curiosity'], risk: 'low' },
      { id: 'embrace', label: 'Embrace the Loop', description: 'Use the time', statChanges: { luck: 15, health: -10 }, consequences: ['Luck', 'Trauma'], risk: 'extreme' }
    ] : [
      { id: 'investigate', label: 'Araştır', description: 'Gizemi çöz', statChanges: { intelligence: 10, luck: -3 }, consequences: ['Bilgi', 'Risk'], risk: 'medium' },
      { id: 'ignore', label: 'Görmezden Gel', description: 'Normal yaşamına devam et', statChanges: { health: 5 }, consequences: ['Güvenlik', 'Merak'], risk: 'low' },
      { id: 'embrace', label: 'Döngüyü Kabul Et', description: 'Zamanı kullan', statChanges: { luck: 15, health: -10 }, consequences: ['Şans', 'Travma'], risk: 'extreme' }
    ],
    isCanonEncounter: false
  };
}

// ─── Dönüm Noktası Olayı (Milestone: 5/15/30/50/70) ────
function createMilestoneEvent(world: AnimeWorld, region: AnimeRegion, age: number, year: number, stats: LifeStats): LifeEvent {
  const en = isEn();
  const milestones: Record<number, { title: string; description: string; choices: LifeChoice[] }> = en ? {
    5: {
      title: 'Childhood Turning Point',
      description: `You are ${age} years old. The first years of your childhood are behind you in the ${regionNameL(region)} region. It's time to choose who you will become in the ${worldNameL(world)} world.`,
      choices: [
        { id: 'curious', label: 'Be Curious', description: 'Explore the world, ask questions', statChanges: { intelligence: 8, luck: 5 }, consequences: ['Curiosity', 'Knowledge'], risk: 'low' },
        { id: 'obedient', label: 'Be Obedient', description: 'Follow the rules, stay safe', statChanges: { socialClass: 5, health: 5 }, consequences: ['Security', 'Conformity'], risk: 'low' },
        { id: 'rebel', label: 'Be a Rebel', description: 'Question the rules', statChanges: { power: 5, socialClass: -5, luck: 3 }, consequences: ['Independence', 'Risk'], risk: 'medium' }
      ]
    },
    15: {
      title: 'Youth Turning Point',
      description: `You are ${age} years old. You are a teenager in the ${regionNameL(region)} region. It is time for the first big decision for your future in the ${worldNameL(world)} world.`,
      choices: [
        { id: 'study', label: 'Focus on Education', description: 'School and knowledge', statChanges: { intelligence: 12, socialClass: 5 }, consequences: ['Knowledge', 'Career'], risk: 'low' },
        { id: 'train', label: 'Power Training', description: 'Physical power', statChanges: { power: 12, health: -3 }, consequences: ['Power', 'Discipline'], risk: 'medium' },
        { id: 'social', label: 'Social Network', description: 'Relationships and connections', statChanges: { socialClass: 10, luck: 5 }, consequences: ['Network', 'Opportunity'], risk: 'medium' },
        { id: 'freedom', label: 'Choose Freedom', description: 'Forge your own path', statChanges: { luck: 8, power: 5, socialClass: -5 }, consequences: ['Freedom', 'Risk'], risk: 'high' }
      ]
    },
    30: {
      title: 'Adulthood Turning Point',
      description: `You are ${age} years old. You are in the middle of your adult life in the ${regionNameL(region)} region. It is time to reap the fruits of your life, or change direction.`,
      choices: [
        { id: 'settle', label: 'Settle and Stabilize', description: 'Family and career', statChanges: { socialClass: 10, health: 5 }, consequences: ['Stability', 'Security'], risk: 'low' },
        { id: 'adventure', label: 'Chase Adventure', description: 'New horizons', statChanges: { luck: 10, power: 5, health: -5 }, consequences: ['Adventure', 'Risk'], risk: 'high' },
        { id: 'mentor', label: 'Be a Mentor', description: 'Guide the young', statChanges: { socialClass: 8, intelligence: 8 }, consequences: ['Respect', 'Influence'], risk: 'medium' },
        { id: 'change', label: 'Change Direction', description: 'A new beginning', statChanges: { intelligence: 8, luck: 8, socialClass: -3 }, consequences: ['Renewal', 'Uncertainty'], risk: 'medium' }
      ]
    },
    50: {
      title: 'Maturity Turning Point',
      description: `You are ${age} years old. You are in the second half of your life in the ${regionNameL(region)} region. What will your legacy and influence be in the ${worldNameL(world)} world?`,
      choices: [
        { id: 'legacy', label: 'Leave a Legacy', description: 'Create something and teach it', statChanges: { socialClass: 10, intelligence: 5 }, consequences: ['Legacy', 'Respect'], risk: 'low' },
        { id: 'enjoy', label: 'Enjoy Life', description: 'Rest and live', statChanges: { health: 10, luck: 5 }, consequences: ['Happiness', 'Health'], risk: 'low' },
        { id: 'fight', label: 'Keep Fighting', description: 'You are still strong', statChanges: { power: 10, health: -5 }, consequences: ['Power', 'Risk'], risk: 'high' },
        { id: 'reflect', label: 'Reflect and Assess', description: 'Review your life', statChanges: { intelligence: 10, socialClass: 5 }, consequences: ['Wisdom', 'Peace'], risk: 'low' }
      ]
    },
    70: {
      title: 'Old Age Turning Point',
      description: `You are ${age} years old. You are in the final stage of your life in the ${regionNameL(region)} region. How would you like to be remembered in the ${worldNameL(world)} world?`,
      choices: [
        { id: 'peace', label: 'In Peace', description: 'Live calm and happy', statChanges: { health: 10, luck: 5 }, consequences: ['Peace', 'Health'], risk: 'low' },
        { id: 'story', label: 'Tell Your Story', description: 'Share your experiences', statChanges: { socialClass: 10, intelligence: 5 }, consequences: ['Legacy', 'Respect'], risk: 'low' },
        { id: 'final', label: 'One Last Adventure', description: 'Take a risk, one last time', statChanges: { power: 8, luck: 8, health: -10 }, consequences: ['Adventure', 'Risk'], risk: 'extreme' },
        { id: 'family', label: 'Be With Family', description: 'Spend time with your loved ones', statChanges: { socialClass: 8, health: 5 }, consequences: ['Bond', 'Happiness'], risk: 'low' }
      ]
    }
  } : {
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
  // Bölgenin kendi yaşam beklentisi varsa onu kullan (örn. Marley ≠ Konoha).
  const sourceLE = region.lifeExpectancy ?? world.lifeExpectancy;
  const adjustedLE: [number, number] = [
    Math.round(sourceLE[0] * periodMultiplier * genderMultiplier),
    Math.round(sourceLE[1] * periodMultiplier * genderMultiplier)
  ];
  const baseStats = generateInitialStats(world, region);
  const stats = applyFocusBias(baseStats, focus);

  // Karakter adı üretimi
  const maleNames: Record<string, string[]> = {
    shonen_battle: ['Ren', 'Kaito', 'Haruto', 'Sora', 'Yuki', 'Ryu', 'Kenji', 'Daichi'],
    slice_of_life: ['Yuki', 'Haru', 'Sota', 'Kota', 'Ren', 'Yuto', 'Koki', 'Shota'],
    dark_fantasy: ['Gareth', 'Aldric', 'Kael', 'Doran', 'Viktor', 'Magnus', 'Roland', 'Bran'],
    isekai: ['Hiro', 'Kazuma', 'Ren', 'Shin', 'Yuu', 'Takumi', 'Kou', 'Riku'],
    cyberpunk: ['V', 'David', 'Johnny', 'K', 'Neo', 'Axel', 'Rex', 'Zero'],
    seinen_psych: ['Light', 'L', 'Ken', 'Shin', 'Ren', 'Yuki', 'Akira', 'Takumi'],
    romance_drama: ['Haru', 'Yuki', 'Kousei', 'Ryuji', 'Miyuki', 'Ren', 'Sota', 'Kaito'],
    sports: ['Shoyo', 'Tobio', 'Tetsuya', 'Seijuro', 'Yoichi', 'Hanamichi', 'Ryota', 'Kenji']
  };
  const femaleNames: Record<string, string[]> = {
    shonen_battle: ['Sakura', 'Hinata', 'Rukia', 'Mikasa', 'Nami', 'Asuna', 'Yoruichi', 'Nobara'],
    slice_of_life: ['Yui', 'Hana', 'Sakura', 'Mio', 'Ritsu', 'Azusa', 'Nadeshiko', 'Rin'],
    dark_fantasy: ['Elsa', 'Freya', 'Lyra', 'Mira', 'Vera', 'Astrid', 'Helga', 'Sigrid'],
    isekai: ['Emilia', 'Rem', 'Raphtalia', 'Asuna', 'Shiro', 'Stephanie', 'Aqua', 'Megumin'],
    cyberpunk: ['Motoko', 'Akane', 'Lucy', 'Judy', 'Panam', 'Kiwi', 'Rebecca', 'Gloria'],
    seinen_psych: ['Misa', 'Risa', 'Yuki', 'Aya', 'Rin', 'Mai', 'Saya', 'Nana'],
    romance_drama: ['Kaori', 'Nagisa', 'Taiga', 'Kaguya', 'Miyuki', 'Hana', 'Yui', 'Sakura'],
    sports: ['Kiyoko', 'Yachi', 'Riko', 'Aoba', 'Minori', 'Yuki', 'Hana', 'Sakura']
  };
  const pool = gender === 'male' ? (maleNames[world.id] || maleNames.shonen_battle) : (femaleNames[world.id] || femaleNames.shonen_battle);
  const characterName = pool[Math.floor(Math.random() * pool.length)];

  // Aile durumu (socialClass bazlı)
  const familyStatus = getFamilyStatus(stats.socialClass);

  // Eğitim (intelligence bazlı)
  const education = getEducationTier(stats.intelligence);

  // Varlıklar (sembolik para)
  const assets = Math.round(stats.socialClass * 100 + Math.random() * 500);
  let birthYear: number;
  if (period === 'past') {
    birthYear = 1950 + Math.floor(Math.random() * 76); // 1950-2025
  } else if (period === 'future') {
    birthYear = 2027 + Math.floor(Math.random() * 24); // 2027-2050
  } else {
    birthYear = 2026;
  }
  const events: LifeEvent[] = [];

  // ── Ölüm yaşı: bölge yaşam tablosu + dönem/cinsiyet + çocuk ölümü ──
  // Referanstaki gibi ortalama değil, olasılık dağılımından çekilir.
  const childMortality = clamp(region.stats.diseaseRate * 0.35 + region.stats.povertyRate * 0.15, 0, 0.3);
  let deathAge: number;
  if (rollChance(childMortality)) {
    deathAge = rollDice(0, 4);
  } else {
    const mean = (adjustedLE[0] + adjustedLE[1]) / 2;
    const sd = Math.max(4, (adjustedLE[1] - adjustedLE[0]) / 2);
    // Box-Muller normal approximation
    const u1 = Math.max(0.0001, Math.random());
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    deathAge = Math.round(mean + z * sd);
    deathAge = clamp(deathAge, 5, adjustedLE[1] + 8);
  }
  deathAge = clamp(deathAge, 0, 120);

  // Birth event
  events.push(createBirthEvent(world, region, birthYear));

  // Childhood events (ages 5-12) — sadece ölüm yaşından önce
  if (deathAge > 5) {
    for (let age = 5; age <= 12; age += 3) {
      if (age < deathAge) {
        events.push(createChildhoodEvent(world, region, age, birthYear + age, stats));
      }
    }
  }

  // Milestone at 5 (çocukluğun ilk dönüm noktası)
  if (deathAge > 5) {
    const m5 = createMilestoneEvent(world, region, 5, birthYear + 5, stats);
    if (m5) events.push(m5);
  }

  // Odak kontrolü: her 5 yılda bir — GERÇEK SEÇİM (referanstaki gibi yön değiştirme şansı)
  for (let age = 10; age <= Math.min(60, deathAge - 1); age += 5) {
    const en = isEn();
    events.push({
      id: `focus_${age}`,
      age,
      year: birthYear + age,
      title: en ? `Focus Check-in: Age ${age}` : `Odak Kontrolü: ${age} Yaşında`,
      description: en
        ? `You are ${age} years old. It is time to review the direction of your life once more. Where do you want to focus next? Your choice will shape your growth over the next years.`
        : `${age} yaşındasın. Hayatının yönünü bir kez daha gözden geçirme zamanı. Bundan sonra hangi odağa geçeceksin? Seçimin önümüzdeki yılların gelişimini belirleyecek.`,
      type: 'special',
      choices: LIFE_FOCUSES.map(f => ({
        id: `focus_${f.id}`,
        label: focusLabelL(f.id),
        description: focusDescL(f.id),
        statChanges: f.statBias,
        consequences: [focusLabelL(f.id)],
        risk: 'low' as const
      })),
      isCanonEncounter: false
    });
  }

  // Faction choice (age 15)
  if (deathAge > 15) {
    events.push(createFactionEvent(world, region, 15, birthYear + 15, stats));
  }

  // Milestone events at key ages (15 fraksiyonla, 5 yukarıda kapsandı)
  for (const mAge of [30, 50, 70]) {
    if (mAge < deathAge) {
      const me = createMilestoneEvent(world, region, mAge, birthYear + mAge, stats);
      if (me) events.push(me);
    }
  }

  // Tournament event (age 18, chance)
  if (deathAge > 18 && rollChance(0.6)) {
    events.push(createTournamentEvent(world, region, 18, birthYear + 18, stats));
  }

  // Clan event (age 20)
  if (deathAge > 20) {
    events.push(createClanEvent(world, region, 20, birthYear + 20, stats));
  }

  // Evolution event (age 22, if stats qualify)
  if (deathAge > 22) {
    const evo = createEvolutionEvent(world, region, 22, birthYear + 22, stats);
    if (evo) events.push(evo);
  }

  // Time loop events (rare, ages 12-30)
  for (let age = 12; age <= Math.min(30, deathAge - 1); age += rollDice(6, 10)) {
    const tl = createTimeLoopEvent(world, region, age, birthYear + age, stats);
    if (tl) events.push(tl);
  }

  // Canon encounter check (age 10-25)
  for (let age = 10; age <= 25; age += 5) {
    if (age < deathAge) {
      const encounter = createCanonEncounter(world, region, age, birthYear + age);
      if (encounter) events.push(encounter);
    }
  }

  // Crisis events (ages 18-40, random)
  for (let age = 18; age <= Math.min(40, deathAge - 1); age += rollDice(5, 8)) {
    if (rollChance(0.4)) {
      const ce = createCrisisEvent(world, region, age, birthYear + age, stats, includeHeavy);
      if (ce) events.push(ce);
    }
  }

  // Ölüm nedeni: bölge istatistiklerine göre ağırlıklı (WHO GHE benzeri)
  const en = isEn();
  let deathCause: string;
  const disease = en ? 'Disease' : 'Hastalık';
  const accident = en ? 'Accident' : 'Kaza';
  if (deathAge < 1) {
    deathCause = en ? 'Infant disease' : 'Bebeklik hastalığı';
  } else if (deathAge < 5) {
    deathCause = en ? 'Childhood illness' : 'Çocukluk hastalığı';
  } else if (deathAge < 15) {
    deathCause = Math.random() < 0.6 ? disease : accident;
  } else {
    const violence = en ? 'Violence/War' : 'Şiddet/Savaş';
    const disaster = en ? 'Natural disaster' : 'Doğa felaketi';
    const substance = en ? 'Substance abuse' : 'Madde bağımlılığı';
    const suicide = en ? 'Suicide' : 'İntihar';
    const oldAge = en ? 'Old age' : 'Yaşlılık';
    const entries: [string, number][] = [
      [disease, 1 + (100 - stats.health) / 100 + region.stats.diseaseRate * 3],
      [accident, 0.5 + region.stats.accidentRate * 3],
      [violence, region.stats.violenceRate * 3 + region.stats.warRate * 3],
      [disaster, 0.2 + region.stats.deathRate * 0.5],
      [substance, region.stats.substanceRate * 3],
      [suicide, region.stats.suicideRate * 3],
    ];
    if (deathAge >= 65) entries.push([oldAge, 4]);
    else if (deathAge >= 50) entries.push([oldAge, 1.5]);

    const total = entries.reduce((sum, [, weight]) => sum + Math.max(0, weight), 0);
    let r = Math.random() * total;
    deathCause = entries[0][0];
    for (const [cause, weight] of entries) {
      r -= Math.max(0, weight);
      if (r <= 0) { deathCause = cause; break; }
    }
  }

  // Sort events by age; death is appended last so nothing can happen after it.
  events.sort((a, b) => a.age - b.age);

  const deathEvent: LifeEvent = {
    id: 'death',
    age: deathAge,
    year: birthYear + deathAge,
    title: L('Ölüm', 'Death', '死', 'La mort'),
    description: en
      ? `Your life came to an end at the age of ${deathAge} in the ${regionNameL(region)} region. Cause: ${deathCause}.`
      : `${deathAge} yaşında ${region.nameTR} bölgesinde hayatın sona erdi. Neden: ${deathCause}.`,
    type: 'death',
    isDeath: true,
    deathCause
  };
  events.push(deathEvent);

  // Olayların deterministik etkisiyle hayat sonundaki statlar
  // (oyuncu seçimleri UI tarafında computeStatsAt ile eklenir).
  let finalStats: LifeStats = { ...stats };
  for (const event of events) {
    finalStats = applyStatChanges(finalStats, event.statChanges);
  }

  // Generate memorial text
  const memorialText = generateMemorialText(world, region, birthYear, deathAge, deathCause, finalStats, events, gender, period, characterName, familyStatus, education, assets);

  // Generate achievements
  const achievements = generateAchievements(world, region, finalStats, events, deathAge);

  // Check canon encounters
  const canonEncounters = events.filter(e => e.isCanonEncounter).map(e => e.canonCharacter || '');
  const isCanonEncountered = canonEncounters.length > 0;

  return {
    worldId: world.id,
    regionId: region.id,
    period,
    gender,
    focus,
    characterName,
    familyStatus,
    education,
    assets,
    birthYear,
    deathYear: birthYear + deathAge,
    deathAge,
    deathCause,
    initialStats: stats,
    finalStats,
    events,
    memorialText,
    achievements,
    isCanonEncountered,
    canonEncounters
  };
}

// ─── Anma Sayfası (Memorial) ─────────────────────────────

export function generateMemorialText(
  world: AnimeWorld,
  region: AnimeRegion,
  birthYear: number,
  deathAge: number,
  deathCause: string,
  stats: LifeStats,
  events: LifeEvent[],
  gender: 'male' | 'female' = 'male',
  period: 'today' | 'past' | 'future' = 'today',
  characterName: string = 'İsimsiz',
  familyStatus: 'poor' | 'middle' | 'noble' = 'middle',
  education: 'none' | 'basic' | 'high' | 'university' = 'basic',
  assets: number = 0
): string {
  const canonEncounters = events.filter(e => e.isCanonEncounter).map(e => e.canonCharacter);
  const finalEducation = getEducationTier(stats.intelligence);
  const en = isEn();
  const eduNone = en ? 'None' : 'Yok';
  const eduBasic = en ? 'Basic' : 'Temel';
  const eduHigh = en ? 'High School' : 'Lise';
  const eduUni = en ? 'University' : 'Üniversite';
  const famPoor = en ? 'Poor' : 'Yoksul';
  const famNoble = en ? 'Noble' : 'Soylu';
  const famMid = en ? 'Average' : 'Orta halli';

  if (en) {
    let text = `═══════════════════════════════════════\n`;
    text += `         IN MEMORY — A LIFE REMEMBERED\n`;
    text += `═══════════════════════════════════════\n\n`;
    text += `🌍 World: ${world.nameEN}\n`;
    text += `📍 Region: ${region.nameEN}\n`;
    text += `👤 Name: ${characterName}\n`;
    text += `👤 Gender: ${gender === 'male' ? 'Male' : 'Female'}\n`;
    text += `👨‍👩‍👧 Family: ${familyStatus === 'poor' ? famPoor : familyStatus === 'noble' ? famNoble : famMid}\n`;
    text += `🎓 Education: ${finalEducation === 'none' ? eduNone : finalEducation === 'basic' ? eduBasic : finalEducation === 'high' ? eduHigh : eduUni}\n`;
    text += `💰 Assets: ${assets}\n`;
    text += `⏳ Era: ${period === 'past' ? 'Past' : period === 'future' ? 'Future' : 'Present Day'}\n`;
    text += `📅 Born: ${birthYear}\n`;
    text += `💀 Died: ${birthYear + deathAge} (age ${deathAge})\n`;
    text += `Cause of death: ${deathCause}\n\n`;
    text += `📊 Stats:\n`;
    text += `   Power: ${stats.power}/100\n`;
    text += `   Intelligence: ${stats.intelligence}/100\n`;
    text += `   Luck: ${stats.luck}/100\n`;
    text += `   Social Class: ${stats.socialClass}/100\n`;
    text += `   Health: ${stats.health}/100\n\n`;

    if (canonEncounters.length > 0) {
      text += `✨ Canon Character Encounters:\n`;
      canonEncounters.forEach(c => {
        text += `   • Met ${c}\n`;
      });
      text += `\n`;
    }

    text += `📝 Life Summary:\n`;
    text += `   ${events.length} events happened.\n`;
    text += `   You lived ${deathAge} years in the ${region.nameEN} region.\n\n`;

    if (stats.socialClass < 30) {
      text += `   You were born into a poor family and struggled to survive.\n`;
    } else if (stats.socialClass > 70) {
      text += `   You were born into a noble family and lived a comfortable life.\n`;
    } else {
      text += `   You were born into an average family and lived a balanced life.\n`;
    }

    if (stats.power > 60) {
      text += `   You were a powerful fighter.\n`;
    }
    if (stats.intelligence > 60) {
      text += `   You were a clever, strategic person.\n`;
    }
    if (stats.luck > 60) {
      text += `   You lived a lucky life.\n`;
    }

    text += `\n═══════════════════════════════════════\n`;
    text += `${characterName} will be remembered. A life was lived.\n`;
    text += `═══════════════════════════════════════`;

    return text;
  }

  let text = `═══════════════════════════════════════\n`;
  text += `         ANMA SAYFASI — HATIRLANAN HAYAT\n`;
  text += `═══════════════════════════════════════\n\n`;
  text += `🌍 Evren: ${world.nameTR}\n`;
  text += `📍 Bölge: ${region.nameTR}\n`;
  text += `👤 İsim: ${characterName}\n`;
  text += `👤 Cinsiyet: ${gender === 'male' ? 'Erkek' : 'Kadın'}\n`;
  text += `👨‍👩‍👧 Aile: ${familyStatus === 'poor' ? famPoor : familyStatus === 'noble' ? famNoble : famMid}\n`;
  text += `🎓 Eğitim: ${finalEducation === 'none' ? eduNone : finalEducation === 'basic' ? eduBasic : finalEducation === 'high' ? eduHigh : eduUni}\n`;
  text += `💰 Varlıklar: ${assets}\n`;
  text += `⏳ Dönem: ${period === 'past' ? 'Geçmiş' : period === 'future' ? 'Gelecek' : 'Bugün'}\n`;
  text += `📅 Doğum: ${birthYear}\n`;
  text += `💀 Ölüm: ${birthYear + deathAge} (${deathAge} yaşında)\n`;
  text += `Ölüm nedeni: ${deathCause}\n\n`;
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
  text += `${characterName} hatırlanacak. Bir hayat yaşandı.\n`;
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
  const en = isEn();

  if (deathAge >= 80) achievements.push(en ? 'Old Age' : 'Yaşlılık');
  if (deathAge >= 60 && deathAge < 80) achievements.push(en ? 'Long Life' : 'Uzun Yaşam');
  if (deathAge < 20) achievements.push(en ? 'Early Passing' : 'Erken Vefat');
  if (stats.power > 70) achievements.push(en ? 'Mighty Fighter' : 'Güçlü Savaşçı');
  if (stats.intelligence > 70) achievements.push(en ? 'Brainbox' : 'Zeka Küpü');
  if (stats.luck > 70) achievements.push(en ? 'Lucky One' : 'Şanslı');
  if (stats.socialClass > 70) achievements.push(en ? 'Noble' : 'Soylu');
  if (stats.socialClass < 20) achievements.push(en ? 'Poor' : 'Yoksul');
  if (stats.health > 80) achievements.push(en ? 'Healthy' : 'Sağlıklı');
  if (events.some(e => e.isCanonEncounter)) achievements.push(en ? 'Canon Character Encounter' : 'Kanon Karakterle Karşılaştı');
  if (world.dangerLevel === 'extreme' && deathAge >= 30) achievements.push(en ? 'Survival Master' : 'Hayatta Kalma Ustası');
  if (world.dangerLevel === 'low' && deathAge >= 70) achievements.push(en ? 'Peaceful Life' : 'Huzurlu Yaşam');
  if (events.filter(e => e.type === 'crisis').length >= 3) achievements.push(en ? 'Crisis Manager' : 'Kriz Yöneticisi');
  if (events.filter(e => e.type === 'choice' || (e.choices && e.choices.length > 0)).length >= 2) achievements.push(en ? 'Decisive' : 'Seçimci');

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
  const en = isEn();
  if (en) {
    return `🌍 I lived ${life.deathAge} years in ${region.nameEN}, ${world.nameEN}.\n` +
      `👤 ${life.characterName}\n` +
      `Cause of death: ${life.deathCause}\n` +
      `Power: ${life.finalStats.power} | Intelligence: ${life.finalStats.intelligence} | Luck: ${life.finalStats.luck}\n` +
      (life.isCanonEncountered ? `✨ I met canon characters: ${life.canonEncounters.join(', ')}\n` : '') +
      `AniSync 1 in 8 Billion`;
  }
  return `🌍 ${world.nameTR} evreninde ${region.nameTR} bölgesinde ${life.deathAge} yıl yaşadım.\n` +
    `👤 ${life.characterName}\n` +
    `Ölüm nedeni: ${life.deathCause}\n` +
    `Güç: ${life.finalStats.power} | Zeka: ${life.finalStats.intelligence} | Şans: ${life.finalStats.luck}\n` +
    (life.isCanonEncountered ? `✨ Kanon karakterlerle karşılaştım: ${life.canonEncounters.join(', ')}\n` : '') +
    `AniSync 8 Milyar Evrende 1`;
}