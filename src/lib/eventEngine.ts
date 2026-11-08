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

function createFactionEvent(world: AnimeWorld, region: AnimeRegion, age: number, year: number, stats: LifeStats): LifeEvent | null {
  const l = lifeLang();
  // Faction options depend on the world
  const factionOptions: Record<string, LifeChoice[]> = {
    shonen_battle: l === 'ja' ? [
      { id: 'marine', label: '海軍になる', description: '正義と規律の道', statChanges: { socialClass: 10, power: 5 }, consequences: ['規律', '安全'], risk: 'low' },
      { id: 'pirate', label: '海賊になる', description: '自由と冒険の道', statChanges: { power: 10, luck: 5, socialClass: -10 }, consequences: ['冒険', '危険'], risk: 'high' },
      { id: 'civilian', label: '市民のままでいる', description: '穏やかで安全な人生', statChanges: { health: 10, socialClass: 5 }, consequences: ['安全', '平凡'], risk: 'low' },
      { id: 'revolutionary', label: '革命軍に加わる', description: '世界を変えるために戦う', statChanges: { power: 8, intelligence: 5, socialClass: -15 }, consequences: ['理想主義', '危険'], risk: 'extreme' }
    ] : l === 'fr' ? [
      { id: 'marine', label: 'Devenir Marine', description: 'Le chemin de la justice et de la discipline', statChanges: { socialClass: 10, power: 5 }, consequences: ['Discipline', 'Sécurité'], risk: 'low' },
      { id: 'pirate', label: 'Devenir Pirate', description: 'Le chemin de la liberté et de l\'aventure', statChanges: { power: 10, luck: 5, socialClass: -10 }, consequences: ['Aventure', 'Risque'], risk: 'high' },
      { id: 'civilian', label: 'Rester civil', description: 'Une vie paisible et sûre', statChanges: { health: 10, socialClass: 5 }, consequences: ['Sécurité', 'Ordinarité'], risk: 'low' },
      { id: 'revolutionary', label: 'Rejoindre la Révolution', description: 'Se battre pour changer le monde', statChanges: { power: 8, intelligence: 5, socialClass: -15 }, consequences: ['Idéalisme', 'Danger'], risk: 'extreme' }
    ] : l === 'en' ? [
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
    dark_fantasy: l === 'ja' ? [
      { id: 'soldier', label: '兵士になる', description: '戦い、そして生き延びる', statChanges: { power: 10, health: -5 }, consequences: ['戦闘経験', 'トラウマ'], risk: 'high' },
      { id: 'hunter', label: '狩人になる', description: '魔物を狩り、探索する', statChanges: { power: 8, luck: 5 }, consequences: ['発見', '危険'], risk: 'medium' },
      { id: 'civilian', label: '市民のままでいる', description: '生き延びようと試みる', statChanges: { health: 10, socialClass: -5 }, consequences: ['安全', '貧困'], risk: 'low' },
      { id: 'cultist', label: 'カルトに加わる', description: '闇の力と取引する', statChanges: { power: 15, health: -10, luck: -5 }, consequences: ['力', '呪い'], risk: 'extreme' }
    ] : l === 'fr' ? [
      { id: 'soldier', label: 'Devenir Soldat', description: 'Se battre et survivre', statChanges: { power: 10, health: -5 }, consequences: ['Expérience de combat', 'Traumatisme'], risk: 'high' },
      { id: 'hunter', label: 'Devenir Chasseur', description: 'Chasser les monstres et explorer', statChanges: { power: 8, luck: 5 }, consequences: ['Découverte', 'Risque'], risk: 'medium' },
      { id: 'civilian', label: 'Rester civil', description: 'Essayer de survivre', statChanges: { health: 10, socialClass: -5 }, consequences: ['Sécurité', 'Pauvreté'], risk: 'low' },
      { id: 'cultist', label: 'Rejoindre le Culte', description: 'Faire un pacte avec les forces obscures', statChanges: { power: 15, health: -10, luck: -5 }, consequences: ['Pouvoir', 'Malédiction'], risk: 'extreme' }
    ] : l === 'en' ? [
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
    isekai: l === 'ja' ? [
      { id: 'adventurer', label: '冒険者になる', description: 'クエストと冒険', statChanges: { power: 8, intelligence: 5, luck: 5 }, consequences: ['冒険', '経験値'], risk: 'medium' },
      { id: 'merchant', label: '商人になる', description: '商売と経済', statChanges: { intelligence: 10, socialClass: 10 }, consequences: ['金', '社会的地位'], risk: 'low' },
      { id: 'scholar', label: '学者になる', description: '魔法と研究', statChanges: { intelligence: 15, power: -3 }, consequences: ['知識', '非力さ'], risk: 'medium' },
      { id: 'hermit', label: '隠者になる', description: '孤独な暮らしと瞑想', statChanges: { power: 5, intelligence: 8, socialClass: -10 }, consequences: ['神秘', '孤立'], risk: 'low' }
    ] : l === 'fr' ? [
      { id: 'adventurer', label: 'Devenir aventurier', description: 'Quêtes et aventures', statChanges: { power: 8, intelligence: 5, luck: 5 }, consequences: ['Aventure', 'Expérience'], risk: 'medium' },
      { id: 'merchant', label: 'Devenir marchand', description: 'Commerce et économie', statChanges: { intelligence: 10, socialClass: 10 }, consequences: ['Argent', 'Statut social'], risk: 'low' },
      { id: 'scholar', label: 'Devenir érudit', description: 'Magie et recherche', statChanges: { intelligence: 15, power: -3 }, consequences: ['Connaissance', 'Faiblesse'], risk: 'medium' },
      { id: 'hermit', label: 'Devenir ermite', description: 'Solitude et méditation', statChanges: { power: 5, intelligence: 8, socialClass: -10 }, consequences: ['Mystère', 'Isolement'], risk: 'low' }
    ] : l === 'en' ? [
      { id: 'adventurer', label: 'Become an Adventurer', description: 'Quests and adventures', statChanges: { power: 8, intelligence: 5, luck: 5 }, consequences: ['Adventure', 'XP'], risk: 'medium' },
      { id: 'merchant', label: 'Become a Merchant', description: 'Trade and economy', statChanges: { intelligence: 10, socialClass: 10 }, consequences: ['Money', 'Social status'], risk: 'low' },
      { id: 'scholar', label: 'Become a Scholar', description: 'Magic and research', statChanges: { intelligence: 15, power: -3 }, consequences: ['Knowledge', 'Weakness'], risk: 'medium' },
      { id: 'hermit', label: 'Become a Hermit', description: 'Solitude and meditation', statChanges: { power: 5, intelligence: 8, socialClass: -10 }, consequences: ['Mystery', 'Isolation'], risk: 'low' }
    ] : [
      { id: 'adventurer', label: 'Maceracı Ol', description: 'Görevler ve maceralar', statChanges: { power: 8, intelligence: 5, luck: 5 }, consequences: ['Macera', 'XP'], risk: 'medium' },
      { id: 'merchant', label: 'Tüccar Ol', description: 'Ticaret ve ekonomi', statChanges: { intelligence: 10, socialClass: 10 }, consequences: ['Para', 'Sosyal statü'], risk: 'low' },
      { id: 'scholar', label: 'Bilgin Ol', description: 'Büyü ve araştırma', statChanges: { intelligence: 15, power: -3 }, consequences: ['Bilgi', 'Güçsüzlük'], risk: 'medium' },
      { id: 'hermit', label: 'Münzevi Ol', description: 'Yalnız yaşam ve meditasyon', statChanges: { power: 5, intelligence: 8, socialClass: -10 }, consequences: ['Gizem', 'İzolasyon'], risk: 'low' }
    ],
    cyberpunk: l === 'ja' ? [
      { id: 'corp', label: '企業に加わる', description: 'サラリーマンとして安定した道', statChanges: { socialClass: 12, intelligence: 5 }, consequences: ['安定', '従属'], risk: 'low' },
      { id: 'gang', label: 'ギャングに加わる', description: 'ストリートの仲間と生きる', statChanges: { power: 10, socialClass: -10, luck: 5 }, consequences: ['居場所', '危険'], risk: 'high' },
      { id: 'solo', label: 'ソロになる', description: '一匹狼として自由に生きる', statChanges: { power: 8, luck: 5, socialClass: -5 }, consequences: ['自由', '孤独'], risk: 'medium' },
      { id: 'netrunner', label: 'ネットランナーになる', description: 'データの海を泳ぐハッカー', statChanges: { intelligence: 12, power: -3 }, consequences: ['知識', '追われる身'], risk: 'medium' }
    ] : l === 'fr' ? [
      { id: 'corp', label: 'Rejoindre une corporation', description: 'Le chemin stable du salarié', statChanges: { socialClass: 12, intelligence: 5 }, consequences: ['Stabilité', 'Sujétion'], risk: 'low' },
      { id: 'gang', label: 'Rejoindre un gang', description: 'Vivre avec les gens de la rue', statChanges: { power: 10, socialClass: -10, luck: 5 }, consequences: ['Une place', 'Danger'], risk: 'high' },
      { id: 'solo', label: 'Devenir un solo', description: 'Vivre libre en solitaire', statChanges: { power: 8, luck: 5, socialClass: -5 }, consequences: ['Liberté', 'Solitude'], risk: 'medium' },
      { id: 'netrunner', label: 'Devenir un netrunner', description: 'Un hacker qui nage dans l\'océan des données', statChanges: { intelligence: 12, power: -3 }, consequences: ['Connaissance', 'Poursuivi'], risk: 'medium' }
    ] : l === 'en' ? [
      { id: 'corp', label: 'Join a Corporation', description: 'The stable corporate path', statChanges: { socialClass: 12, intelligence: 5 }, consequences: ['Stability', 'Subservience'], risk: 'low' },
      { id: 'gang', label: 'Join a Gang', description: 'Run with the street', statChanges: { power: 10, socialClass: -10, luck: 5 }, consequences: ['A place', 'Danger'], risk: 'high' },
      { id: 'solo', label: 'Be a Solo', description: 'Live free as a lone wolf', statChanges: { power: 8, luck: 5, socialClass: -5 }, consequences: ['Freedom', 'Solitude'], risk: 'medium' },
      { id: 'netrunner', label: 'Become a Netrunner', description: 'A hacker who swims the data ocean', statChanges: { intelligence: 12, power: -3 }, consequences: ['Knowledge', 'Hunted'], risk: 'medium' }
    ] : [
      { id: 'corp', label: 'Kurumsal Ol', description: 'Maaşlı ve istikrarlı yol', statChanges: { socialClass: 12, intelligence: 5 }, consequences: ['İstikrar', 'Boyun Eğme'], risk: 'low' },
      { id: 'gang', label: 'Çeteye Katıl', description: 'Sokakla ve çetelerle yaşa', statChanges: { power: 10, socialClass: -10, luck: 5 }, consequences: ['Bir Yer', 'Tehlike'], risk: 'high' },
      { id: 'solo', label: 'Solo Ol', description: 'Bağımsız kurt gibi özgür yaşa', statChanges: { power: 8, luck: 5, socialClass: -5 }, consequences: ['Özgürlük', 'Yalnızlık'], risk: 'medium' },
      { id: 'netrunner', label: 'Netrunner Ol', description: 'Veri denizinde yüzen hacker', statChanges: { intelligence: 12, power: -3 }, consequences: ['Bilgi', 'Kovalanan'], risk: 'medium' }
    ],
    seinen_psych: l === 'ja' ? [
      { id: 'detective', label: '探偵になる', description: '真実を追う頭脳の道', statChanges: { intelligence: 12, socialClass: 5 }, consequences: ['真実', '孤独'], risk: 'medium' },
      { id: 'ordinary', label: '平凡なままでいる', description: '静かで規則正しい生活', statChanges: { health: 10, socialClass: 5 }, consequences: ['平穏', '平凡'], risk: 'low' },
      { id: 'shadow', label: '影のブローカーになる', description: '情報を売買する冷徹な道', statChanges: { intelligence: 8, luck: 8, socialClass: -10 }, consequences: ['力', '追放'], risk: 'extreme' }
    ] : l === 'fr' ? [
      { id: 'detective', label: 'Devenir détective', description: 'Le chemin de la vérité', statChanges: { intelligence: 12, socialClass: 5 }, consequences: ['Vérités', 'Solitude'], risk: 'medium' },
      { id: 'ordinary', label: 'Rester ordinaire', description: 'Une vie calme et ordonnée', statChanges: { health: 10, socialClass: 5 }, consequences: ['Tranquillité', 'Ordinarité'], risk: 'low' },
      { id: 'shadow', label: 'Devenir courtier de l\'ombre', description: 'Vendre et acheter des informations', statChanges: { intelligence: 8, luck: 8, socialClass: -10 }, consequences: ['Pouvoir', 'Exil'], risk: 'extreme' }
    ] : l === 'en' ? [
      { id: 'detective', label: 'Become a Detective', description: 'The path of truth', statChanges: { intelligence: 12, socialClass: 5 }, consequences: ['Truths', 'Solitude'], risk: 'medium' },
      { id: 'ordinary', label: 'Stay Ordinary', description: 'A calm and ordered life', statChanges: { health: 10, socialClass: 5 }, consequences: ['Tranquility', 'Ordinariness'], risk: 'low' },
      { id: 'shadow', label: 'Become a Shadow Broker', description: 'Buy and sell information', statChanges: { intelligence: 8, luck: 8, socialClass: -10 }, consequences: ['Power', 'Exile'], risk: 'extreme' }
    ] : [
      { id: 'detective', label: 'Dedektif Ol', description: 'Gerçeğin peşinde bir kafa yolu', statChanges: { intelligence: 12, socialClass: 5 }, consequences: ['Gerçek', 'Yalnızlık'], risk: 'medium' },
      { id: 'ordinary', label: 'Sıradan Kal', description: 'Sakin ve düzenli bir hayat', statChanges: { health: 10, socialClass: 5 }, consequences: ['Huzur', 'Sıradanlık'], risk: 'low' },
      { id: 'shadow', label: 'Gölge Komisyoncusu Ol', description: 'Bilgi alıp satan soğuk bir yol', statChanges: { intelligence: 8, luck: 8, socialClass: -10 }, consequences: ['Güç', 'Sürgün'], risk: 'extreme' }
    ]
  };

  // Bazı evrenlerde fraksiyon yoktur (slice_of_life, romance_drama, sports)
  const options = factionOptions[world.id];
  if (!options) return null;
  const lore = getWorldLore(world.id);
  const factionNames = lore ? lore.factions.slice(0, 4).map(f => f.name).join(', ') : '';

  return {
    id: `faction_${age}`,
    age,
    year,
    title: L('Fraksiyon Seçimi', 'Faction Choice', '勢力選び', 'Choix de faction'),
    description: L(
      `${age} yaşındasın. ${region.nameTR} bölgesinde ${world.nameTR} evreninde bir fraksiyon seçmen gerekiyor (örn. ${factionNames}). Bu seçim hayatının yönünü belirleyecek.`,
      `You are ${age} years old. In the ${regionNameL(region)} region of the ${worldNameL(world)} world, you must choose a faction (e.g. ${factionNames}). This choice will set the course of your life.`,
      `${age}歳。${region.nameEN}地方、${world.nameEN}の世界で、勢力を選ばなければならない（例: ${factionNames}）。この選択があなたの人生の方向を決める。`,
      `Tu as ${age} ans. Dans la région de ${region.nameEN} du monde ${world.nameEN}, tu dois choisir une faction (ex. ${factionNames}). Ce choix déterminera le cours de ta vie.`
    ),
    type: 'faction',
    choices: options,
    isCanonEncounter: false
  };
}

function createCrisisEvent(world: AnimeWorld, region: AnimeRegion, age: number, year: number, stats: LifeStats, includeHeavy: boolean = true): LifeEvent | null {
  const l = lifeLang();
  const crisisTypes: { title: string; description: string; choices: LifeChoice[]; heavy: boolean }[] = l === 'ja' ? [
    {
      title: '病と死別',
      heavy: false,
      description: `${age}歳。${region.nameEN}地方で、疫病や病が広がっている。愛する者が影響を受けているかもしれない。`,
      choices: [
        { id: 'heal', label: '治療を受ける', description: '薬や魔法で治療法を探す', statChanges: { health: 10, intelligence: 5 }, consequences: ['健康', '知識'], risk: 'medium' },
        { id: 'protect', label: '愛する人を守る', description: '自分の健康を危険にさらす', statChanges: { health: -10, socialClass: 5 }, consequences: ['犠牲', '絆'], risk: 'high' },
        { id: 'flee', label: '逃げる', description: '生き延び、後で戻る', statChanges: { health: 5, socialClass: -5, luck: -3 }, consequences: ['生存', '罪悪感'], risk: 'low' }
      ]
    },
    {
      title: '戦争と紛争',
      heavy: true,
      description: `${age}歳。${world.nameEN}の世界で紛争が勃発した。${region.nameEN}地方も巻き込まれている。`,
      choices: [
        { id: 'fight', label: '戦う', description: '前線へ向かう', statChanges: { power: 10, health: -15 }, consequences: ['経験', 'トラウマ'], risk: 'extreme' },
        { id: 'hide', label: '隠れる', description: '安全な場所を見つける', statChanges: { health: 5, socialClass: -5 }, consequences: ['安全', '罪悪感'], risk: 'low' },
        { id: 'medic', label: '衛生兵になる', description: '負傷者を治療する', statChanges: { intelligence: 10, health: -5 }, consequences: ['知識', '尊敬'], risk: 'medium' }
      ]
    },
    {
      title: '力の覚醒',
      heavy: false,
      description: `${age}歳。${world.powerSystem}のシステムの中で覚醒の兆しを感じている。この力はあなたを変えるかもしれない。`,
      choices: [
        { id: 'embrace', label: '力を受け入れる', description: '力を受け入れ、鍛える', statChanges: { power: 15, health: -5 }, consequences: ['力', '危険'], risk: 'high' },
        { id: 'reject', label: '力を拒む', description: '平凡のまま、安全に', statChanges: { health: 10, socialClass: 5 }, consequences: ['安全', '平凡'], risk: 'low' },
        { id: 'study', label: '力を研究する', description: '科学的に調べる', statChanges: { intelligence: 15, power: 5 }, consequences: ['知識', '力'], risk: 'medium' }
      ]
    }
  ] : l === 'fr' ? [
    {
      title: 'Maladie et perte',
      heavy: false,
      description: `Tu as ${age} ans. Une épidémie ou une maladie se répand dans la région de ${region.nameEN}. Quelqu'un que tu aimes peut être touché.`,
      choices: [
        { id: 'heal', label: 'Chercher un traitement', description: 'Trouver un remède par la médecine ou la magie', statChanges: { health: 10, intelligence: 5 }, consequences: ['Santé', 'Connaissance'], risk: 'medium' },
        { id: 'protect', label: 'Protéger tes proches', description: 'Risquer ta propre santé', statChanges: { health: -10, socialClass: 5 }, consequences: ['Sacrifice', 'Lien'], risk: 'high' },
        { id: 'flee', label: 'Fuir', description: 'Survivre et revenir plus tard', statChanges: { health: 5, socialClass: -5, luck: -3 }, consequences: ['Survie', 'Culpabilité'], risk: 'low' }
      ]
    },
    {
      title: 'Guerre et conflit',
      heavy: true,
      description: `Tu as ${age} ans. Un conflit a éclaté dans le monde ${world.nameEN}. La région de ${region.nameEN} est également touchée.`,
      choices: [
        { id: 'fight', label: 'Combattre', description: 'Aller au front', statChanges: { power: 10, health: -15 }, consequences: ['Expérience', 'Traumatisme'], risk: 'extreme' },
        { id: 'hide', label: 'Se cacher', description: 'Trouver un endroit sûr', statChanges: { health: 5, socialClass: -5 }, consequences: ['Sécurité', 'Culpabilité'], risk: 'low' },
        { id: 'medic', label: 'Devenir médecin', description: 'Soigner les blessés', statChanges: { intelligence: 10, health: -5 }, consequences: ['Connaissance', 'Respect'], risk: 'medium' }
      ]
    },
    {
      title: 'Éveil du pouvoir',
      heavy: false,
      description: `Tu as ${age} ans. Tu ressens des signes d'éveil au sein du système ${world.powerSystem}. Ce pouvoir pourrait te transformer.`,
      choices: [
        { id: 'embrace', label: 'Accepter le pouvoir', description: 'Accepter le pouvoir et t\'entraîner', statChanges: { power: 15, health: -5 }, consequences: ['Pouvoir', 'Risque'], risk: 'high' },
        { id: 'reject', label: 'Rejeter le pouvoir', description: 'Rester ordinaire et en sécurité', statChanges: { health: 10, socialClass: 5 }, consequences: ['Sécurité', 'Ordinarité'], risk: 'low' },
        { id: 'study', label: 'Étudier le pouvoir', description: 'L\'examiner scientifiquement', statChanges: { intelligence: 15, power: 5 }, consequences: ['Connaissance', 'Pouvoir'], risk: 'medium' }
      ]
    }
  ] : l === 'en' ? [
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
  const helpNote = L(
    '\n\n💡 Yardım: Bu tür krizlerde topluluk desteği, profesyonel yardım ve aile bağları hayatta kalma şansını artırır. AniSync topluluğunda benzer deneyimler paylaşılabilir.',
    '\n\n💡 Help: In crises like these, community support, professional help and strong family bonds greatly improve your chances of survival. You can share similar experiences in the AniSync community.',
    '\n\n💡 助け: このような危機では、コミュニティの支援、専門家の助言、家族の絆が生存の可能性を大きく高めます。AniSyncコミュニティでも、似た経験を分かち合えます。',
    '\n\n💡 Aide: Dans ce type de crise, le soutien communautaire, l\'aide professionnelle et les liens familiaux augmentent considérablement vos chances de survie. Vous pouvez partager des expériences similaires sur la communauté AniSync.'
  );
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
  const encounters: Record<string, { minAge: number; maxAge: number; character: string; description: string; descriptionEN: string; descriptionJA: string; descriptionFR: string; probability: number }[]> = {
    // Shounen Battle World — bölgeye göre seri
    konoha: [
      { minAge: 8, maxAge: 15, character: 'Naruto', description: 'Turuncu kıyafetli bir ninja köyden geçiyor. "Dattebayo!" diye bağırıyor.', descriptionEN: 'An orange-clad ninja walks through the village. "Dattebayo!" he shouts.', descriptionJA: 'オレンジの服を着た忍者が村を歩いて行く。「だってばよ！」と叫んでいる。', descriptionFR: 'Un ninja vêtu d\'orange traverse le village. « Dattebayo ! » crie-t-il.', probability: 0.15 },
      { minAge: 12, maxAge: 20, character: 'Sasuke', description: 'Karanlık yüzlü bir genç, Sharingan gözüyle seni süzüyor.', descriptionEN: 'A dark-faced young man gazes at you with his Sharingan eye.', descriptionJA: '暗い顔の若者が、写輪眼であなたをじっと見つめる。', descriptionFR: 'Un jeune homme au visage sombre te fixe avec son œil Sharingan.', probability: 0.10 },
      { minAge: 15, maxAge: 25, character: 'Kakashi', description: 'Gümüş saçlı, maske takan bir jonin kitabı okuyarak geçiyor.', descriptionEN: 'A silver-haired, masked jonin walks past while reading a book.', descriptionJA: '銀髪でマスク姿の上忍が、本を読みながら通り過ぎる。', descriptionFR: 'Un jonin aux cheveux argentés et masqué passe en lisant un livre.', probability: 0.08 }
    ],
    kanton: [
      { minAge: 8, maxAge: 15, character: 'Luffy', description: 'Uzakta, deniz kenarında bir çocuk koşuyor. "Korsanlar Kralı olacağım!" diye bağırıyor.', descriptionEN: 'Far away, by the sea, a kid runs. "I\'m gonna be the Pirate King!" he shouts.', descriptionJA: '遠くで、海辺に少年が走っている。「海賊王になる！」と叫んでいる。', descriptionFR: 'Au loin, au bord de la mer, un gamin court. « Je serai le Roi des Pirates ! » crie-t-il.', probability: 0.15 },
      { minAge: 12, maxAge: 20, character: 'Zoro', description: 'Bir kılıç ustası, antrenman yaparken görürsün. Üç kılıç kullanıyor.', descriptionEN: 'You spot a swordsman training. He wields three swords.', descriptionJA: '剣士が鍛錬しているのが見える。三本の刀を使っている。', descriptionFR: 'Tu aperçois un épéiste à l\'entraînement. Il manie trois sabres.', probability: 0.10 },
      { minAge: 15, maxAge: 25, character: 'Nami', description: 'Turuncu saçlı bir kız, harita çizerek geçiyor.', descriptionEN: 'An orange-haired girl walks past while drawing a map.', descriptionJA: 'オレンジの髪の少女が、地図を描きながら通り過ぎる。', descriptionFR: 'Une fille aux cheveux orange passe en dessinant une carte.', probability: 0.08 }
    ],
    soul_society: [
      { minAge: 10, maxAge: 20, character: 'Ichigo', description: 'Turuncu saçlı bir genç, dev kılıç taşıyor. Hollow avında.', descriptionEN: 'An orange-haired youth carries a massive sword. He is hunting a Hollow.', descriptionJA: 'オレンジの髪の青年が、大刀を携えている。ホロウを狩っている。', descriptionFR: 'Un jeune homme aux cheveux orange porte un énorme sabre. Il chasse un Hollow.', probability: 0.12 },
      { minAge: 12, maxAge: 22, character: 'Rukia', description: 'Küçük boylu bir shinigami, kılıç dansı yapıyor.', descriptionEN: 'A short-statured shinigami performing a sword dance.', descriptionJA: '背の低い護廷十三隊士が、剣の舞を舞っている。', descriptionFR: 'Un shinigami de petite taille exécute sa danse de l\'épée.', probability: 0.08 },
      { minAge: 15, maxAge: 25, character: 'Byakuya', description: 'Sakin ve soğuk bir kaptan, sakura yaprakları savuruyor.', descriptionEN: 'A calm and cold captain scattering sakura petals.', descriptionJA: '穏やかで冷たい隊長が、桜の花びらを舞わせている。', descriptionFR: 'Un capitaine calme et froid disperse des pétales de sakura.', probability: 0.06 }
    ],
    marley: [
      { minAge: 12, maxAge: 20, character: 'Eren', description: 'Yeşil gözlü bir genç, özgürlükten bahsediyor.', descriptionEN: 'A green-eyed youth talks about freedom.', descriptionJA: '緑の目をした青年が、自由について語っている。', descriptionFR: 'Un jeune homme aux yeux verts parle de liberté.', probability: 0.12 },
      { minAge: 15, maxAge: 25, character: 'Levi', description: 'Kısa boylu, temizlik takıntılı bir asker komutan geçiyor.', descriptionEN: 'A short, cleanliness-obsessed military commander walks past.', descriptionJA: '背の低い、潔癖な軍人が通り過ぎる。', descriptionFR: 'Un court commandant militaire maniaque de la propreté passe.', probability: 0.08 },
      { minAge: 10, maxAge: 18, character: 'Mikasa', description: 'Siyah saçlı bir kız, kırmızı eşarp takıyor.', descriptionEN: 'A black-haired girl wearing a red scarf.', descriptionJA: '黒髪の少女が、赤いマフラーをつけている。', descriptionFR: 'Une fille aux cheveux noirs porte une écharpe rouge.', probability: 0.07 }
    ],
    jujutsu_high: [
      { minAge: 15, maxAge: 25, character: 'Gojo', description: 'Beyaz saçlı, körbandı takan bir adam seni geçip gidiyor. Çevresinde hava farklı hissediliyor.', descriptionEN: 'A white-haired, blindfold-wearing man walks past you. The air feels different around him.', descriptionJA: '白い髪で目隠しをした男があなたを素通りしていく。周りの空気が違って感じられる。', descriptionFR: 'Un homme aux cheveux blancs et bandeau sur les yeux te dépasse. L\'air autour de lui semble différent.', probability: 0.10 },
      { minAge: 14, maxAge: 22, character: 'Yuji', description: 'Pembe saçlı bir genç, yumruk sallayarak antrenman yapıyor.', descriptionEN: 'A pink-haired youth training by throwing punches.', descriptionJA: 'ピンクの髪の青年が、パンチを振って鍛錬している。', descriptionFR: 'Un jeune aux cheveux roses s\'entraîne en frappant.', probability: 0.08 },
      { minAge: 15, maxAge: 25, character: 'Nobara', description: 'Turuncu saçlı bir büyücü, çekiciyle lanetli ruhlara meydan okuyor.', descriptionEN: 'An orange-haired sorcerer challenging cursed spirits with her hammer.', descriptionJA: 'オレンジの髪の呪術師が、ハンマーで呪霊に挑んでいる。', descriptionFR: 'Une sorcière aux cheveux orange défie des esprits maudits avec son marteau.', probability: 0.07 }
    ],
    // Diğer dünyalar (tek havuz)
    dark_fantasy: [
      { minAge: 10, maxAge: 20, character: 'Guts', description: 'Dev kılıç taşıyan bir adam gece yarısı geçip gidiyor. Gözlerinde derin bir hüzün var.', descriptionEN: 'A man carrying a giant sword walks past at midnight. Deep sorrow in his eyes.', descriptionJA: '大剣を持った男が深夜に通り過ぎる。深い悲しみが瞳の奥にある。', descriptionFR: 'Un homme portant une épée géante passe à minuit. Une profonde tristesse dans les yeux.', probability: 0.08 },
      { minAge: 15, maxAge: 25, character: 'Levi', description: 'Kısa boylu, temizlik takıntılı bir asker komutan geçiyor.', descriptionEN: 'A short, cleanliness-obsessed military commander walks past.', descriptionJA: '背の低い、潔癖な軍人が通り過ぎる。', descriptionFR: 'Un court commandant militaire maniaque de la propreté passe.', probability: 0.07 }
    ],
    isekai: [
      { minAge: 12, maxAge: 25, character: 'Subaru', description: 'Bir genç, "Emilia-tan!" diye bağırarak koşuyor.', descriptionEN: 'A young man runs while screaming "Emilia-tan!"', descriptionJA: '青年が「エミリアたん！」と叫びながら走っている。', descriptionFR: 'Un jeune homme court en criant « Emilia-tan ! »', probability: 0.10 },
      { minAge: 10, maxAge: 20, character: 'Kazuma', description: 'Yeşil saçlı bir maceracı, "Chunchunmaru!" diye bağırarak geçiyor.', descriptionEN: 'A green-haired adventurer walks past shouting "Chunchunmaru!"', descriptionJA: '緑の髪の冒険者が「ちゅんちゅん丸！」と叫びながら通り過ぎる。', descriptionFR: 'Un aventurier aux cheveux verts passe en criant « Chunchunmaru ! »', probability: 0.08 }
    ],
    cyberpunk: [
      { minAge: 15, maxAge: 30, character: 'David', description: 'Siberpsikoz belirtileri gösteren bir genç, çatıdan çatıya atlıyor.', descriptionEN: 'A youth showing signs of cyberpsychosis leaps from rooftop to rooftop.', descriptionJA: 'サイバーサイコシスの兆しを見せる青年が、屋上から屋上へと飛び移っている。', descriptionFR: 'Un jeune montrant des signes de cyberpsychose saute de toit en toit.', probability: 0.09 },
      { minAge: 18, maxAge: 35, character: 'Akane', description: 'Mavi saçlı bir müfettiş, Dominatör ile suç katsayısı ölçüyor.', descriptionEN: 'A blue-haired inspector measures crime coefficients with her Dominator.', descriptionJA: '青い髪の捜査官が、ドミネーターで殺意係数を測定している。', descriptionFR: 'Une inspectrice aux cheveux bleus mesure le coefficient de criminalité avec son Dominator.', probability: 0.07 }
    ],
    seinen_psych: [
      { minAge: 18, maxAge: 40, character: 'L', description: 'Beyaz gömlekli, çömelmiş oturan bir dedektif görürsün. Tatlı yiyor.', descriptionEN: 'You spot a detective in a white shirt squatting down. Eating sweets.', descriptionJA: '白いシャツを着てしゃがみこむ探偵が見える。甘い物を食べている。', descriptionFR: 'Tu aperçois un détective en chemise blanche accroupi. Il mange des sucreries.', probability: 0.06 },
      { minAge: 20, maxAge: 45, character: 'Johan', description: 'Sarı saçlı, masum yüzlü bir adam. Gözlerinde korkunç bir boşluk var.', descriptionEN: 'A blond, innocent-looking man. A terrifying emptiness in his eyes.', descriptionJA: '金髪で無垢な顔の男。目の奥に恐ろしい空虚がある。', descriptionFR: 'Un homme blond à l\'air innocent. Un vide terrifiant dans les yeux.', probability: 0.04 }
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
    description: (() => {
      const l = lifeLang();
      if (l === 'tr') return encounter.description;
      if (l === 'ja') return encounter.descriptionJA;
      if (l === 'fr') return encounter.descriptionFR;
      return encounter.descriptionEN;
    })(),
    type: 'special',
    outcome: L(
      `Uzaktan ${encounter.character}'ı gördün. Bu anı ömür boyu hatırlayacaksın.`,
      `From afar, you saw ${encounter.character}. You will remember this moment for the rest of your life.`,
      `遠くに${encounter.character}を見かけた。この瞬間を生涯忘れないだろう。`,
      `De loin, tu as aperçu ${encounter.character}. Tu te souviendras de cet instant toute ta vie.`
    ),
    isCanonEncounter: true,
    canonCharacter: encounter.character
  };
}

// ─── Turnuva Olayı (Tournament) ──────────────────────────
function createTournamentEvent(world: AnimeWorld, region: AnimeRegion, age: number, year: number, stats: LifeStats): LifeEvent {
  const l = lifeLang();
  const tournaments: { title: string; description: string; choices: LifeChoice[] }[] = l === 'ja' ? [
    {
      title: 'トーナメント',
      description: `${age}歳。${region.nameEN}地方で盛大なトーナメントが開かれている。${world.nameEN}の世界最強の者たちがここに集まっている。`,
      choices: [
        { id: 'enter', label: 'トーナメントに出場する', description: '力と運を試す', statChanges: { power: 10, luck: -5, health: -8 }, consequences: ['経験', '名声'], risk: 'high' },
        { id: 'train', label: '鍛錬する', description: '準備してから参加する', statChanges: { power: 5, intelligence: 5 }, consequences: ['準備', '忍耐'], risk: 'low' },
        { id: 'watch', label: '観戦して学ぶ', description: '戦術と技術を観察する', statChanges: { intelligence: 8, luck: 3 }, consequences: ['知識', '着想'], risk: 'low' },
        { id: 'bribe', label: '不正をはたらく', description: '勝つためにあらゆる手を使う', statChanges: { luck: 10, socialClass: -15 }, consequences: ['短期的な勝利', '評判の失墜'], risk: 'extreme' }
      ]
    }
  ] : l === 'fr' ? [
    {
      title: 'Tournoi',
      description: `Tu as ${age} ans. Un grand tournoi se tient dans la région de ${region.nameEN}. Les plus forts du monde ${world.nameEN} sont là.`,
      choices: [
        { id: 'enter', label: 'Participer au tournoi', description: 'Teste ta force et ta chance', statChanges: { power: 10, luck: -5, health: -8 }, consequences: ['Expérience', 'Renommée'], risk: 'high' },
        { id: 'train', label: 'S\'entraîner d\'abord', description: 'Se préparer avant de participer', statChanges: { power: 5, intelligence: 5 }, consequences: ['Préparation', 'Patience'], risk: 'low' },
        { id: 'watch', label: 'Observer et apprendre', description: 'Observer les tactiques et techniques', statChanges: { intelligence: 8, luck: 3 }, consequences: ['Connaissance', 'Inspiration'], risk: 'low' },
        { id: 'bribe', label: 'Tricher pour gagner', description: 'Essayer tous les moyens de gagner', statChanges: { luck: 10, socialClass: -15 }, consequences: ['Victoire à court terme', 'Réputation perdue'], risk: 'extreme' }
      ]
    }
  ] : l === 'en' ? [
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
  const l = lifeLang();
  const clans: { title: string; description: string; choices: LifeChoice[] }[] = l === 'ja' ? [
    {
      title: 'クラン選び',
      description: `${age}歳。${region.nameEN}地方の有力な一族があなたを招いている。この選択があなたの社会的地位と力への道を決める。`,
      choices: [
        { id: 'join', label: 'クランに加わる', description: '力と保護を得る', statChanges: { socialClass: 15, power: 5 }, consequences: ['保護', '忠誠'], risk: 'medium' },
        { id: 'independent', label: '独立のまま', description: '自分の道を切り開く', statChanges: { intelligence: 5, luck: 5, socialClass: -5 }, consequences: ['自由', '危険'], risk: 'high' },
        { id: 'rival', label: '対立するクランに加わる', description: '強力な敵と同盟する', statChanges: { power: 10, socialClass: -10 }, consequences: ['力', '敵'], risk: 'extreme' },
        { id: 'mediate', label: '仲裁者になる', description: 'クラン間の和平', statChanges: { intelligence: 8, socialClass: 8 }, consequences: ['尊敬', '危険'], risk: 'medium' }
      ]
    }
  ] : l === 'fr' ? [
    {
      title: 'Choix de clan',
      description: `Tu as ${age} ans. Un puissant clan de la région de ${region.nameEN} t'invite. Ce choix définira ton statut social et ton chemin vers le pouvoir.`,
      choices: [
        { id: 'join', label: 'Rejoindre le clan', description: 'Gagne du pouvoir et de la protection', statChanges: { socialClass: 15, power: 5 }, consequences: ['Protection', 'Loyauté'], risk: 'medium' },
        { id: 'independent', label: 'Rester indépendant', description: 'Trace ton propre chemin', statChanges: { intelligence: 5, luck: 5, socialClass: -5 }, consequences: ['Liberté', 'Risque'], risk: 'high' },
        { id: 'rival', label: 'Rejoindre le clan rival', description: 'T\'allier à un puissant ennemi', statChanges: { power: 10, socialClass: -10 }, consequences: ['Pouvoir', 'Ennemi'], risk: 'extreme' },
        { id: 'mediate', label: 'Devenir médiateur', description: 'La paix entre les clans', statChanges: { intelligence: 8, socialClass: 8 }, consequences: ['Respect', 'Risque'], risk: 'medium' }
      ]
    }
  ] : l === 'en' ? [
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
  const l = lifeLang();
  const isPowerPath = stats.power >= stats.intelligence;
  return {
    id: `evolution_${age}`,
    age,
    year,
    title: L('Güç Uyanışı', 'Power Awakening', '力の覚醒', 'Éveil du pouvoir'),
    description: L(
      `${age} yaşındasın. ${world.powerSystem} sisteminde derin bir uyanış hissediyorsun. ${isPowerPath ? 'Fiziksel gücün zirveye ulaşmak üzere.' : 'Zihinsel yeteneklerin evrilmek üzere.'}`,
      `You are ${age} years old. You feel a profound awakening within the ${world.powerSystem} system. ${isPowerPath ? 'Your physical power is about to reach its peak.' : 'Your mental abilities are on the verge of evolving.'}`,
      `${age}歳。${world.powerSystem}のシステムの中で深い覚醒を感じている。${isPowerPath ? '肉体の力が頂点に達しようとしている。' : '精神の力が進化しようとしている。'}`,
      `Tu as ${age} ans. Tu ressens un profond éveil au sein du système ${world.powerSystem}. ${isPowerPath ? 'Ta puissance physique est sur le point d\'atteindre son apogée.' : 'Tes capacités mentales sont sur le point d\'évoluer.'}`
    ),
    type: 'special',
    choices: l === 'ja' ? [
      { id: 'embrace', label: '力を受け入れる', description: '進化を完成させる', statChanges: isPowerPath ? { power: 15, health: -5 } : { intelligence: 15, health: -5 }, consequences: ['進化', '危険'], risk: 'high' },
      { id: 'reject', label: '拒否する', description: '人間のままで安全に', statChanges: { health: 10, socialClass: 5 }, consequences: ['安全', '平凡'], risk: 'low' },
      { id: 'study', label: '研究して制御する', description: '力を科学的に調べる', statChanges: { intelligence: 12, power: 5 }, consequences: ['知識', '力'], risk: 'medium' },
      { id: 'share', label: '力を分かち合う', description: '他者に教える', statChanges: { socialClass: 10, intelligence: 5, power: -3 }, consequences: ['尊敬', '力の喪失'], risk: 'medium' }
    ] : l === 'fr' ? [
      { id: 'embrace', label: 'Accepter le pouvoir', description: 'Acheve l\'évolution', statChanges: isPowerPath ? { power: 15, health: -5 } : { intelligence: 15, health: -5 }, consequences: ['Évolution', 'Risque'], risk: 'high' },
      { id: 'reject', label: 'Refuser', description: 'Rester humain et en sécurité', statChanges: { health: 10, socialClass: 5 }, consequences: ['Sécurité', 'Ordinarité'], risk: 'low' },
      { id: 'study', label: 'Étudier et contrôler', description: 'Examiner scientifiquement', statChanges: { intelligence: 12, power: 5 }, consequences: ['Connaissance', 'Pouvoir'], risk: 'medium' },
      { id: 'share', label: 'Partager le pouvoir', description: 'L\'enseigner aux autres', statChanges: { socialClass: 10, intelligence: 5, power: -3 }, consequences: ['Respect', 'Perte de pouvoir'], risk: 'medium' }
    ] : l === 'en' ? [
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
  const l = lifeLang();
  return {
    id: `timeloop_${age}`,
    age,
    year,
    title: 'Déjà Vu',
    description: L(
      `${age} yaşındasın. ${region.nameTR} bölgesinde sanki bu anı daha önce yaşamışsın gibi bir his. Zaman mı döngüye girdi?`,
      `You are ${age} years old. In the ${regionNameL(region)} region it feels like you already lived this moment. Has time looped?`,
      `${age}歳。${region.nameEN}地方で、この瞬間を前にも経験したような気がする。時はループしたのだろうか？`,
      `Tu as ${age} ans. Dans la région de ${region.nameEN}, c'est comme si tu avais déjà vécu cet instant. Le temps a-t-il bouclé ?`
    ),
    type: 'special',
    choices: l === 'ja' ? [
      { id: 'investigate', label: '調べる', description: '謎を解く', statChanges: { intelligence: 10, luck: -3 }, consequences: ['知識', '危険'], risk: 'medium' },
      { id: 'ignore', label: '無視する', description: '普通の生活を続ける', statChanges: { health: 5 }, consequences: ['安全', '好奇心'], risk: 'low' },
      { id: 'embrace', label: 'ループを受け入れる', description: '時を使う', statChanges: { luck: 15, health: -10 }, consequences: ['運', 'トラウマ'], risk: 'extreme' }
    ] : l === 'fr' ? [
      { id: 'investigate', label: 'Enquêter', description: 'Résoudre le mystère', statChanges: { intelligence: 10, luck: -3 }, consequences: ['Connaissance', 'Risque'], risk: 'medium' },
      { id: 'ignore', label: 'Ignorer', description: 'Poursuivre ta vie normale', statChanges: { health: 5 }, consequences: ['Sécurité', 'Curiosité'], risk: 'low' },
      { id: 'embrace', label: 'Accepter la boucle', description: 'Utiliser le temps', statChanges: { luck: 15, health: -10 }, consequences: ['Chance', 'Traumatisme'], risk: 'extreme' }
    ] : l === 'en' ? [
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

// ─── Evrene Özgü Olaylar (WorldEventPack — Faz 1) ───────
// Her evrenin kendine ait 2 olay şablonu; yaş pencereleri dünya lore'una göre seçilir.
// Stat kalıpları ve verilen stat güçleri ise evren bazlı.

function createWorldUniqueEvent(world: AnimeWorld, region: AnimeRegion, age: number, year: number, stats: LifeStats): LifeEvent | null {
  const l = lifeLang();
  const en4 = (tr: string, en: string, ja: string, fr: string) => (l === 'tr' ? tr : l === 'ja' ? ja : l === 'fr' ? fr : en);

  switch (world.id) {
    // ─── SPORTS: takım segasyonları ───
    case 'sports':
      if (age === 13) {
        return {
          id: 'sports_tryout_13',
          age,
          year,
          title: en4('Takım Seçmeleri', 'Team Tryouts', 'チーム入部試験', 'Essais d\'équipe'),
          description: en4(
            `${age} yaşındasın. Okul spor takımına seçmeler var. Herkes çok hevesli.`,
            `You are ${age} years old. Team tryouts are being held for your school's sports team. Everyone is super keen.`,
            `${age}歳。学校のスポーツチームの入部試験が行われている。みんなとても熱心だ。`,
            `Tu as ${age} ans. Les essais de l'équipe sportive de l'école ont lieu. Tout le monde est très enthousiaste.`
          ),
          type: 'special',
          choices: l === 'ja' ? [
            { id: 'tryout', label: '試験に出る', description: '挑戦する', statChanges: { power: 8, luck: 3 }, consequences: ['挑戦', '成長'], risk: 'medium' },
            { id: 'prepare', label: '準備してから出る', description: 'まず体を仕上げる', statChanges: { power: 5, intelligence: 5 }, consequences: ['準備', '自信'], risk: 'low' },
            { id: 'quit', label: 'やめておく', description: '別の道を探す', statChanges: { health: 5, socialClass: -3 }, consequences: ['別の道', '安定'], risk: 'low' }
          ] : l === 'fr' ? [
            { id: 'tryout', label: 'Essayer', description: 'Tenter ta chance', statChanges: { power: 8, luck: 3 }, consequences: ['Défi', 'Croissance'], risk: 'medium' },
            { id: 'prepare', label: 'Se préparer d\'abord', description: 'Se mettre en forme avant', statChanges: { power: 5, intelligence: 5 }, consequences: ['Préparation', 'Confiance'], risk: 'low' },
            { id: 'quit', label: 'Ne pas essayer', description: 'Chercher une autre voie', statChanges: { health: 5, socialClass: -3 }, consequences: ['Autre voie', 'Stabilité'], risk: 'low' }
          ] : l === 'en' ? [
            { id: 'tryout', label: 'Try Out', description: 'Take the leap', statChanges: { power: 8, luck: 3 }, consequences: ['Challenge', 'Growth'], risk: 'medium' },
            { id: 'prepare', label: 'Prepare First', description: 'Build up first', statChanges: { power: 5, intelligence: 5 }, consequences: ['Preparation', 'Confidence'], risk: 'low' },
            { id: 'quit', label: 'Don\'t Try Out', description: 'Look for another path', statChanges: { health: 5, socialClass: -3 }, consequences: ['Different path', 'Stability'], risk: 'low' }
          ] : [
            { id: 'tryout', label: 'Denemeye Gir', description: 'Atıl ve şartları gör', statChanges: { power: 8, luck: 3 }, consequences: ['Meydan Okuma', 'Gelişim'], risk: 'medium' },
            { id: 'prepare', label: 'Hazırlan, Sonra Gir', description: 'Önce bedenini hazırla', statChanges: { power: 5, intelligence: 5 }, consequences: ['Hazırlık', 'Özgüven'], risk: 'low' },
            { id: 'quit', label: 'Girme', description: 'Başka bir yol ara', statChanges: { health: 5, socialClass: -3 }, consequences: ['Başka Yol', 'İstikrar'], risk: 'low' }
          ],
          isCanonEncounter: false
        };
      }
      if (age === 17) {
        return {
          id: 'sports_championship_17',
          age,
          year,
          title: en4('Bölge Turnuvası', 'Regional Tournament', '地区大会', 'Tournoi régional'),
          description: en4(
            `${age} yaşındasın. Bölgesel turnuva başlıyor. Okulun kazanmayı hedefliyor.`,
            `You are ${age} years old. The regional tournament starts. Your school aims to win.`,
            `${age}歳。地区大会が始まる。学校は優勝を目指している。`,
            `Tu as ${age} ans. Le tournoi régional commence. Ton école vise la victoire.`
          ),
          type: 'special',
          choices: l === 'ja' ? [
            { id: 'all_in', label: '全力で行く', description: '全てを出し切る', statChanges: { power: 12, health: -8 }, consequences: ['挑戦', '怪我'], risk: 'high' },
            { id: 'safe', label: '堅実に行く', description: '無理せず確実に', statChanges: { intelligence: 8, luck: 5 }, consequences: ['確実', '安定'], risk: 'low' },
            { id: 'team', label: 'チームを優先', description: '個人よりチーム', statChanges: { socialClass: 10, luck: 5 }, consequences: ['絆', '信頼'], risk: 'low' }
          ] : l === 'fr' ? [
            { id: 'all_in', label: 'Tout donner', description: 'Donner tout ce que tu as', statChanges: { power: 12, health: -8 }, consequences: ['Tout ou rien', 'Blessure'], risk: 'high' },
            { id: 'safe', label: 'Jouer la sécurité', description: 'Ne pas se surestimer', statChanges: { intelligence: 8, luck: 5 }, consequences: ['Sûr', 'Stable'], risk: 'low' },
            { id: 'team', label: 'Privilégier l\'équipe', description: 'L\'équipe avant tout', statChanges: { socialClass: 10, luck: 5 }, consequences: ['Lien', 'Confiance'], risk: 'low' }
          ] : l === 'en' ? [
            { id: 'all_in', label: 'Go All In', description: 'Give it everything', statChanges: { power: 12, health: -8 }, consequences: ['All or nothing', 'Injury'], risk: 'high' },
            { id: 'safe', label: 'Play It Safe', description: 'Don\'t overreach', statChanges: { intelligence: 8, luck: 5 }, consequences: ['Safe', 'Stable'], risk: 'low' },
            { id: 'team', label: 'Prioritize the Team', description: 'Team over self', statChanges: { socialClass: 10, luck: 5 }, consequences: ['Bond', 'Trust'], risk: 'low' }
          ] : [
            { id: 'all_in', label: 'Her Şeyini Ver', description: 'Kazanmak için her şeyi feda et', statChanges: { power: 12, health: -8 }, consequences: ['Kazan ya da Kaybet', 'Sakatlık'], risk: 'high' },
            { id: 'safe', label: 'Güvenli Oyna', description: 'Oyna ama riske girme', statChanges: { intelligence: 8, luck: 5 }, consequences: ['Güvenli', 'İstikrar'], risk: 'low' },
            { id: 'team', label: 'Takımı Önce Koy', description: 'Bireyden önce takım', statChanges: { socialClass: 10, luck: 5 }, consequences: ['Bağ', 'Güven'], risk: 'low' }
          ],
          isCanonEncounter: false
        };
      }
      return null;

    // ─── ROMANCE: itiraf ve yıllar sonra ───
    case 'romance_drama':
      if (age === 16) {
        return {
          id: 'romance_confession_16',
          age,
          year,
          title: en4('İtiraf', 'Confession', '告白', 'Confession'),
          description: en4(
            `${age} yaşındasın. Okulda birini fark ettin. Ona ne hissettiğini söylemek istiyorsun ama korkuyorsun.`,
            `You are ${age} years old. You noticed someone at school. You want to tell them how you feel, but you're scared.`,
            `${age}歳。学校で誰かに気づいた。その人に気持ちを伝えたいが、怖くて言えない。`,
            `Tu as ${age} ans. Tu as remarqué quelqu'un à l'école. Tu veux lui dire ce que tu ressens, mais tu as peur.`
          ),
          type: 'special',
          choices: l === 'ja' ? [
            { id: 'confess', label: '告白する', description: '思い切って', statChanges: { socialClass: 12, luck: 5 }, consequences: ['告白', '宝物'], risk: 'high' },
            { id: 'wait', label: '待つ', description: 'タイミングを見計らう', statChanges: { socialClass: 5, luck: 3 }, consequences: ['忍耐', '機会'], risk: 'medium' },
            { id: 'give_up', label: '諦める', description: 'その気持ちを胸に', statChanges: { health: 5, socialClass: -5 }, consequences: ['あきらめ', '平穏'], risk: 'low' }
          ] : l === 'fr' ? [
            { id: 'confess', label: 'Avouer', description: 'Oser le dire', statChanges: { socialClass: 12, luck: 5 }, consequences: ['Aveu', 'Trésor'], risk: 'high' },
            { id: 'wait', label: 'Attendre', description: 'Attendre le bon moment', statChanges: { socialClass: 5, luck: 3 }, consequences: ['Patience', 'Opportunité'], risk: 'medium' },
            { id: 'give_up', label: 'Abandonner', description: 'Garder ça pour toi', statChanges: { health: 5, socialClass: -5 }, consequences: ['Résignation', 'Tranquillité'], risk: 'low' }
          ] : l === 'en' ? [
            { id: 'confess', label: 'Confess', description: 'Take the leap', statChanges: { socialClass: 12, luck: 5 }, consequences: ['Confession', 'Treasure'], risk: 'high' },
            { id: 'wait', label: 'Wait', description: 'Wait for the right moment', statChanges: { socialClass: 5, luck: 3 }, consequences: ['Patience', 'Opportunity'], risk: 'medium' },
            { id: 'give_up', label: 'Give Up', description: 'Keep it to yourself', statChanges: { health: 5, socialClass: -5 }, consequences: ['Resignation', 'Peace'], risk: 'low' }
          ] : [
            { id: 'confess', label: 'İtiraf Et', description: 'Cesurca', statChanges: { socialClass: 12, luck: 5 }, consequences: ['İtiraf', 'Hazine'], risk: 'high' },
            { id: 'wait', label: 'Bekle', description: 'Doğru zamanı bekle', statChanges: { socialClass: 5, luck: 3 }, consequences: ['Sabır', 'Fırsat'], risk: 'medium' },
            { id: 'give_up', label: 'Vazgeç', description: 'İçine göm', statChanges: { health: 5, socialClass: -5 }, consequences: ['Vazgeçme', 'Huzur'], risk: 'low' }
          ],
          isCanonEncounter: false
        };
      }
      if (age === 30) {
        return {
          id: 'romance_reunion_30',
          age,
          year,
          title: en4('Yıllar Sonra', 'Years Later', '何年も経った後', 'Des années plus tard'),
          description: en4(
            `${age} yaşındasın. Yıllar sonra o okul arkadaşınıza festivalde rastladın...`,
            `You are ${age} years old. You run into that school friend again at the festival...`,
            `${age}歳。何年も経って、あの学校の友達に祭りで再会した…`,
            `Tu as ${age} ans. Tu recroises cet ami d'école au festival...`
          ),
          type: 'special',
          choices: l === 'ja' ? [
            { id: 'restart', label: 'もう一度始める', description: '今こそ', statChanges: { socialClass: 15, luck: 10 }, consequences: ['再出発', '希望'], risk: 'medium' },
            { id: 'friends', label: '友達でいる', description: 'いい思い出', statChanges: { socialClass: 8, luck: 0 }, consequences: ['友情', '思い出'], risk: 'low' },
            { id: 'accept', label: '受け入れる', description: '過去は過去', statChanges: { health: 8, luck: 0 }, consequences: ['受容', '平穏'], risk: 'low' }
          ] : l === 'fr' ? [
            { id: 'restart', label: 'Recommencer', description: 'Maintenant', statChanges: { socialClass: 15, luck: 10 }, consequences: ['Nouveau départ', 'Espoir'], risk: 'medium' },
            { id: 'friends', label: 'Rester amis', description: 'De bons souvenirs', statChanges: { socialClass: 8, luck: 0 }, consequences: ['Amitié', 'Souvenir'], risk: 'low' },
            { id: 'accept', label: 'Accepter', description: 'Le passé est le passé', statChanges: { health: 8, luck: 0 }, consequences: ['Acceptation', 'Tranquillité'], risk: 'low' }
          ] : l === 'en' ? [
            { id: 'restart', label: 'Start Over', description: 'Now is the time', statChanges: { socialClass: 15, luck: 10 }, consequences: ['Fresh Start', 'Hope'], risk: 'medium' },
            { id: 'friends', label: 'Stay Friends', description: 'Good memories', statChanges: { socialClass: 8, luck: 0 }, consequences: ['Friendship', 'Memory'], risk: 'low' },
            { id: 'accept', label: 'Accept', description: 'The past is the past', statChanges: { health: 8, luck: 0 }, consequences: ['Acceptance', 'Peace'], risk: 'low' }
          ] : [
            { id: 'restart', label: 'Yeniden Başla', description: 'Şimdi zamanı', statChanges: { socialClass: 15, luck: 10 }, consequences: ['Yeni Başlangıç', 'Umut'], risk: 'medium' },
            { id: 'friends', label: 'Dost Kal', description: 'İyi anılar', statChanges: { socialClass: 8, luck: 0 }, consequences: ['Dostluk', 'Anı'], risk: 'low' },
            { id: 'accept', label: 'Kabullen', description: 'Geçmiş geçmiştir', statChanges: { health: 8, luck: 0 }, consequences: ['Kabullenme', 'Huzur'], risk: 'low' }
          ],
          isCanonEncounter: false
        };
      }
      return null;

    // ─── SLICE_OF_LIFE: yaz festivali + müzik kulübü ───
    case 'slice_of_life':
      if (age === 12) {
        return {
          id: 'sol_summer_festival_12',
          age,
          year,
          title: en4('Yaz Festivali', 'Summer Festival', '夏祭り', 'Festival d\'été'),
          description: en4(
            `${age} yaşındasın. Köydeki yaz festivali yakında. Herkes hazırlanıyor.`,
            `You are ${age} years old. The village summer festival is coming soon. Everyone is preparing.`,
            `${age}歳。町の夏祭りがもうすぐ。みんな準備している。`,
            `Tu as ${age} ans. Le festival d'été du village approche. Tout le monde prépare.`
          ),
          type: 'special',
          choices: l === 'ja' ? [
            { id: 'help', label: '準備を手伝う', description: '町の役に立つ', statChanges: { socialClass: 10, luck: 5 }, consequences: ['貢献', '繋がり'], risk: 'low' },
            { id: 'friends', label: '友達と行く', description: '楽しい一日', statChanges: { luck: 8, health: 3 }, consequences: ['友情', '思い出'], risk: 'low' },
            { id: 'stay', label: '家にいる', description: '静かな時間', statChanges: { intelligence: 8, health: 3 }, consequences: ['平和', '読書'], risk: 'low' }
          ] : l === 'fr' ? [
            { id: 'help', label: 'Aider aux préparatifs', description: 'Être utile au village', statChanges: { socialClass: 10, luck: 5 }, consequences: ['Contribution', 'Lien'], risk: 'low' },
            { id: 'friends', label: 'Y aller avec des amis', description: 'Une journée amusante', statChanges: { luck: 8, health: 3 }, consequences: ['Amitié', 'Souvenir'], risk: 'low' },
            { id: 'stay', label: 'Rester à la maison', description: 'Un moment tranquille', statChanges: { intelligence: 8, health: 3 }, consequences: ['Tranquillité', 'Lecture'], risk: 'low' }
          ] : l === 'en' ? [
            { id: 'help', label: 'Help Prepare', description: 'Help the village', statChanges: { socialClass: 10, luck: 5 }, consequences: ['Contribution', 'Belonging'], risk: 'low' },
            { id: 'friends', label: 'Go With Friends', description: 'A fun day', statChanges: { luck: 8, health: 3 }, consequences: ['Friendship', 'Memory'], risk: 'low' },
            { id: 'stay', label: 'Stay Home', description: 'Quiet time', statChanges: { intelligence: 8, health: 3 }, consequences: ['Peace', 'Reading'], risk: 'low' }
          ] : [
            { id: 'help', label: 'Hazırlıklara Yardım Et', description: 'Köye faydalı ol', statChanges: { socialClass: 10, luck: 5 }, consequences: ['Katkı', 'Ait Olma'], risk: 'low' },
            { id: 'friends', label: 'Arkadaşlarla Git', description: 'Eğlenceli bir gün', statChanges: { luck: 8, health: 3 }, consequences: ['Dostluk', 'Anı'], risk: 'low' },
            { id: 'stay', label: 'Evde Kal', description: 'Sakin zaman', statChanges: { intelligence: 8, health: 3 }, consequences: ['Huzur', 'Okuma'], risk: 'low' }
          ],
          isCanonEncounter: false
        };
      }
      if (age === 17) {
        return {
          id: 'sol_music_club_17',
          age,
          year,
          title: en4('Müzik Kulübü', 'Music Club', '音楽部', 'Club de musique'),
          description: en4(
            `${age} yaşındasın. Okuldaki müzik kulübünün performansı yakında. Katılmak ister misin?`,
            `You are ${age} years old. The school music club's performance is coming up. Want to join?`,
            `${age}歳。学校の音楽部の公演がもうすぐ。参加したい？`,
            `Tu as ${age} ans. La performance du club de musique de l'école approche. Tu veux participer ?`
          ),
          type: 'special',
          choices: l === 'ja' ? [
            { id: 'join', label: '参加する', description: '音楽に触れる', statChanges: { socialClass: 10, intelligence: 5 }, consequences: ['音楽', '友情'], risk: 'low' },
            { id: 'watch', label: '観るだけ', description: '応援する', statChanges: { luck: 5, health: 3 }, consequences: ['応援', '楽しみ'], risk: 'low' },
            { id: 'deny', label: '断る', description: '不得意だ', statChanges: { power: 3, luck: 0 }, consequences: ['素直さ', '別の道'], risk: 'low' }
          ] : l === 'fr' ? [
            { id: 'join', label: 'Participer', description: 'Découvrir la musique', statChanges: { socialClass: 10, intelligence: 5 }, consequences: ['Musique', 'Amitié'], risk: 'low' },
            { id: 'watch', label: 'Juste regarder', description: 'Encourager', statChanges: { luck: 5, health: 3 }, consequences: ['Encouragement', 'Plaisir'], risk: 'low' },
            { id: 'deny', label: 'Refuser', description: 'Tu n\'es pas doué', statChanges: { power: 3, luck: 0 }, consequences: ['Honnêteté', 'Autre voie'], risk: 'low' }
          ] : l === 'en' ? [
            { id: 'join', label: 'Join', description: 'Experience music', statChanges: { socialClass: 10, intelligence: 5 }, consequences: ['Music', 'Belonging'], risk: 'low' },
            { id: 'watch', label: 'Just Watch', description: 'Cheer them on', statChanges: { luck: 5, health: 3 }, consequences: ['Support', 'Fun'], risk: 'low' },
            { id: 'deny', label: 'Decline', description: 'Not your thing', statChanges: { power: 3, luck: 0 }, consequences: ['Honesty', 'Another path'], risk: 'low' }
          ] : [
            { id: 'join', label: 'Katıl', description: 'Müziği deneyimle', statChanges: { socialClass: 10, intelligence: 5 }, consequences: ['Müzik', 'Aidiyet'], risk: 'low' },
            { id: 'watch', label: 'Sadece İzle', description: 'Takımları destekle', statChanges: { luck: 5, health: 3 }, consequences: ['Destek', 'Keyif'], risk: 'low' },
            { id: 'deny', label: 'Katılma', description: 'Bu sana göre değil', statChanges: { power: 3, luck: 0 }, consequences: ['Dürüstlük', 'Başka Yol'], risk: 'low' }
          ],
          isCanonEncounter: false
        };
      }
      return null;

    // ─── CYBERPUNK: iş ve implant ───
    case 'cyberpunk':
      if (age === 22) {
        return {
          id: 'cyber_gig_22',
          age,
          year,
          title: en4('Bir İş', 'A Gig', '仕事', 'Un boulot'),
          description: en4(
            `${age} yaşındasın. Bir megacorp seni işe almak istiyor. Ya da kara pazara çıkarsın.`,
            `You are ${age} years old. A megacorp wants to hire you. Or you take it to the black market.`,
            `${age}歳。メガコーポが君を雇いたがっている。あるいは闇市場へ出るか。`,
            `Tu as ${age} ans. Un mégacorre veut t'embaucher. Ou tu prends le marché noir.`
          ),
          type: 'special',
          choices: l === 'ja' ? [
            { id: 'corp', label: 'メガコーポの仕事', description: '安定と引き換えに', statChanges: { socialClass: 12, intelligence: 5 }, consequences: ['安定', '従属'], risk: 'low' },
            { id: 'black', label: '闇市場', description: '危険だが報酬は高い', statChanges: { power: 8, luck: 8 }, consequences: ['危険', '報酬'], risk: 'high' },
            { id: 'solo', label: 'ソロでいく', description: '誰の下にもつかない', statChanges: { health: 5, socialClass: -5 }, consequences: ['自由', '孤独'], risk: 'medium' }
          ] : l === 'fr' ? [
            { id: 'corp', label: 'Le méga-corporatif', description: 'La stabilité en échange', statChanges: { socialClass: 12, intelligence: 5 }, consequences: ['Stabilité', 'Sujétion'], risk: 'low' },
            { id: 'black', label: 'Le marché noir', description: 'Dangereux mais payant', statChanges: { power: 8, luck: 8 }, consequences: ['Danger', 'Gains'], risk: 'high' },
            { id: 'solo', label: 'En solo', description: 'Dépendre de personne', statChanges: { health: 5, socialClass: -5 }, consequences: ['Liberté', 'Solitude'], risk: 'medium' }
          ] : l === 'en' ? [
            { id: 'corp', label: 'Megacorp Gig', description: 'Stability in exchange', statChanges: { socialClass: 12, intelligence: 5 }, consequences: ['Stability', 'Subservience'], risk: 'low' },
            { id: 'black', label: 'Black Market', description: 'Dangerous but lucrative', statChanges: { power: 8, luck: 8 }, consequences: ['Danger', 'Gains'], risk: 'high' },
            { id: 'solo', label: 'Go Solo', description: 'Depend on no one', statChanges: { health: 5, socialClass: -5 }, consequences: ['Freedom', 'Solitude'], risk: 'medium' }
          ] : [
            { id: 'corp', label: 'Megacorp İş', description: 'İstikrar karşılığı', statChanges: { socialClass: 12, intelligence: 5 }, consequences: ['İstikrar', 'Boyun Eğme'], risk: 'low' },
            { id: 'black', label: 'Kara Pazar', description: 'Tehlikeli ama kazançlı', statChanges: { power: 8, luck: 8 }, consequences: ['Tehlike', 'Kazanç'], risk: 'high' },
            { id: 'solo', label: 'Solo', description: 'Kimseye bağlı kalma', statChanges: { health: 5, socialClass: -5 }, consequences: ['Özgürlük', 'Yalnızlık'], risk: 'medium' }
          ],
          isCanonEncounter: false
        };
      }
      if (age === 25) {
        return {
          id: 'cyber_augment_25',
          age,
          year,
          title: en4('İmplant', 'Augmentation', 'インプラント', 'Implant'),
          description: en4(
            `${age} yaşındasın. Sokak doktoru bir implant öneriyor. Ama riski var.`,
            `You are ${age} years old. A street doc offers you an implant. But there's a risk.`,
            `${age}歳。ストリートドクターがインプラントを勧めている。だが危険もある。`,
            `Tu as ${age} ans. Un médecin de rue te propose un implant. Mais il y a un risque.`
          ),
          type: 'special',
          choices: l === 'ja' ? [
            { id: 'cheap', label: '安いインプラント', description: '手頃だがリスク高', statChanges: { power: 12, health: -12 }, consequences: ['強化', 'サイバネ詐病'], risk: 'high' },
            { id: 'military', label: '軍用インプラント', description: '最高品質だが高価', statChanges: { power: 18, health: -5, socialClass: -10 }, consequences: ['最強', 'コスト'], risk: 'medium' },
            { id: 'none', label: '拒否する', description: '人間でいたい', statChanges: { health: 10, socialClass: 5 }, consequences: ['人間性', '強化しない'], risk: 'low' }
          ] : l === 'fr' ? [
            { id: 'cheap', label: 'Un implant bon marché', description: 'Abordable mais risqué', statChanges: { power: 12, health: -12 }, consequences: ['Renforcement', 'Cyberpsychose'], risk: 'high' },
            { id: 'military', label: 'Un implant militaire', description: 'Le meilleur, mais cher', statChanges: { power: 18, health: -5, socialClass: -10 }, consequences: ['Le plus puissant', 'Coût'], risk: 'medium' },
            { id: 'none', label: 'Refuser', description: 'Rester humain', statChanges: { health: 10, socialClass: 5 }, consequences: ['Humanité', 'Pas de boost'], risk: 'low' }
          ] : l === 'en' ? [
            { id: 'cheap', label: 'Cheap Implant', description: 'Affordable but risky', statChanges: { power: 12, health: -12 }, consequences: ['Boost', 'Cyberpsychosis'], risk: 'high' },
            { id: 'military', label: 'Military Implant', description: 'Top quality but pricey', statChanges: { power: 18, health: -5, socialClass: -10 }, consequences: ['Strongest', 'Costly'], risk: 'medium' },
            { id: 'none', label: 'Refuse', description: 'Stay human', statChanges: { health: 10, socialClass: 5 }, consequences: ['Humanity', 'No boost'], risk: 'low' }
          ] : [
            { id: 'cheap', label: 'Ucuz İmplant', description: 'Uygun ama riskli', statChanges: { power: 12, health: -12 }, consequences: ['Güçlenme', 'Siberpsikoz'], risk: 'high' },
            { id: 'military', label: 'Askerî İmplant', description: 'En iyisi ama pahalı', statChanges: { power: 18, health: -5, socialClass: -10 }, consequences: ['En Güçlü', 'Bedel'], risk: 'medium' },
            { id: 'none', label: 'Reddet', description: 'İnsan kal', statChanges: { health: 10, socialClass: 5 }, consequences: ['İnsanlık', 'Güçlenmeme'], risk: 'low' }
          ],
          isCanonEncounter: false
        };
      }
      return null;

    // ─── SEINEN_PSYCH: vaka ve müttefik ───
    case 'seinen_psych':
      if (age === 25) {
        return {
          id: 'seinen_case_25',
          age,
          year,
          title: en4('Vaka', 'A Case', '事件', 'Une affaire'),
          description: en4(
            `${age} yaşındasın. Yeni bir olay masanda bekliyor. Büyük bir sır barındırıyor.`,
            `You are ${age} years old. A new case awaits you. It holds a dark secret.`,
            `${age}歳。新しい事件が机の上にある。これは深い秘密を秘めている。`,
            `Tu as ${age} ans. Une nouvelle affaire t'attend. Elle cache un secret sombre.`
          ),
          type: 'special',
          choices: l === 'ja' ? [
            { id: 'investigate', label: '調査する', description: '真相を追う', statChanges: { intelligence: 12, socialClass: 5 }, consequences: ['真実', '危険'], risk: 'medium' },
            { id: 'withdraw', label: '引き下がる', description: '深入りしない', statChanges: { health: 5, socialClass: -3 }, consequences: ['安全', '沈黙'], risk: 'low' },
            { id: 'accuse', label: '誰かを非難する', description: 'もう分かる', statChanges: { luck: 8, socialClass: -8 }, consequences: ['判断', '間違い'], risk: 'high' }
          ] : l === 'fr' ? [
            { id: 'investigate', label: 'Enquêter', description: 'Poursuivre la vérité', statChanges: { intelligence: 12, socialClass: 5 }, consequences: ['Vérité', 'Danger'], risk: 'medium' },
            { id: 'withdraw', label: 'Se retirer', description: 'Ne pas trop creuser', statChanges: { health: 5, socialClass: -3 }, consequences: ['Sécurité', 'Silence'], risk: 'low' },
            { id: 'accuse', label: 'Accuser quelqu\'un', description: 'Tu crois savoir', statChanges: { luck: 8, socialClass: -8 }, consequences: ['Jugement', 'Erreur'], risk: 'high' }
          ] : l === 'en' ? [
            { id: 'investigate', label: 'Investigate', description: 'Chase the truth', statChanges: { intelligence: 12, socialClass: 5 }, consequences: ['Truth', 'Danger'], risk: 'medium' },
            { id: 'withdraw', label: 'Withdraw', description: 'Don\'t dig too deep', statChanges: { health: 5, socialClass: -3 }, consequences: ['Safety', 'Silence'], risk: 'low' },
            { id: 'accuse', label: 'Accuse Someone', description: 'You think you know', statChanges: { luck: 8, socialClass: -8 }, consequences: ['Judgment', 'Error'], risk: 'high' }
          ] : [
            { id: 'investigate', label: 'Araştır', description: 'Gerçeğin peşinde', statChanges: { intelligence: 12, socialClass: 5 }, consequences: ['Gerçek', 'Tehlike'], risk: 'medium' },
            { id: 'withdraw', label: 'Geri Çekil', description: 'Çok derine inme', statChanges: { health: 5, socialClass: -3 }, consequences: ['Güven', 'Sessizlik'], risk: 'low' },
            { id: 'accuse', label: 'Birini Suçla', description: 'Sanırım biliyorum', statChanges: { luck: 8, socialClass: -8 }, consequences: ['Karar', 'Hata'], risk: 'high' }
          ],
          isCanonEncounter: false
        };
      }
      if (age === 30) {
        return {
          id: 'seinen_ally_30',
          age,
          year,
          title: en4('Müttefik mi, Düşman mı?', 'Ally or Enemy?', '味方か、敵か？', 'Allié ou ennemi ?'),
          description: en4(
            `${age} yaşındasın. Güvendiğin biri seni satabilir. Peki kim o?`,
            `You are ${age} years old. Someone you trusted might betray you. But who?`,
            `${age}歳。信頼していた誰かが君を裏切るかもしれない。誰だ？`,
            `Tu as ${age} ans. Quelqu'un en qui tu avais confiance pourrait te trahir. Mais qui ?`
          ),
          type: 'special',
          choices: l === 'ja' ? [
            { id: 'trust', label: '信じる', description: '人を信じる', statChanges: { socialClass: 12, luck: 5 }, consequences: ['信頼', '試練'], risk: 'high' },
            { id: 'question', label: '問いただす', description: '疑問をぶつける', statChanges: { intelligence: 10, socialClass: -5 }, consequences: ['確認', '距離'], risk: 'medium' },
            { id: 'use', label: '利用する', description: '彼らを利用する', statChanges: { power: 5, socialClass: -10, luck: 8 }, consequences: ['利益', '最後'], risk: 'high' }
          ] : l === 'fr' ? [
            { id: 'trust', label: 'Faire confiance', description: 'Faire confiance aux gens', statChanges: { socialClass: 12, luck: 5 }, consequences: ['Confiance', 'Épreuve'], risk: 'high' },
            { id: 'question', label: 'Questionner', description: 'Poser les questions', statChanges: { intelligence: 10, socialClass: -5 }, consequences: ['Vérification', 'Distance'], risk: 'medium' },
            { id: 'use', label: 'Les utiliser', description: 'Les utiliser à ton avantage', statChanges: { power: 5, socialClass: -10, luck: 8 }, consequences: ['Gain', 'Fin'], risk: 'high' }
          ] : l === 'en' ? [
            { id: 'trust', label: 'Trust Them', description: 'Trust people', statChanges: { socialClass: 12, luck: 5 }, consequences: ['Trust', 'Test'], risk: 'high' },
            { id: 'question', label: 'Question Them', description: 'Ask the hard questions', statChanges: { intelligence: 10, socialClass: -5 }, consequences: ['Verification', 'Distance'], risk: 'medium' },
            { id: 'use', label: 'Use Them', description: 'Use them to your advantage', statChanges: { power: 5, socialClass: -10, luck: 8 }, consequences: ['Gain', 'End'], risk: 'high' }
          ] : [
            { id: 'trust', label: 'Güven', description: 'İnsanlara güven', statChanges: { socialClass: 12, luck: 5 }, consequences: ['Güven', 'Sınav'], risk: 'high' },
            { id: 'question', label: 'Sorgula', description: 'Zor sorular sor', statChanges: { intelligence: 10, socialClass: -5 }, consequences: ['Doğrulama', 'Mesafe'], risk: 'medium' },
            { id: 'use', label: 'Kullan', description: 'Onları lehine kullan', statChanges: { power: 5, socialClass: -10, luck: 8 }, consequences: ['Kazanç', 'Son'], risk: 'high' }
          ],
          isCanonEncounter: false
        };
      }
      return null;

    // ─── ISEKAI: ilk görev ve şeytan lord ───
    case 'isekai':
      if (age === 7) {
        return {
          id: 'isekai_tutorial_7',
          age,
          year,
          title: en4('İlk Görev', 'First Quest', '初めての依頼', 'Première quête'),
          description: en4(
            `${age} yaşındasın. Maceracılar loncası sana ilk görevini veriyor.`,
            `You are ${age} years old. The Adventurers Guild gives you your first quest.`,
            `${age}歳。冒険者ギルドが初めての依頼をくれた。`,
            `Tu as ${age} ans. La guilde des aventuriers te donne ta première quête.`
          ),
          type: 'special',
          choices: l === 'ja' ? [
            { id: 'accept', label: '依頼を受ける', description: '冒険の始まり', statChanges: { power: 5, intelligence: 5 }, consequences: ['冒険', '成長'], risk: 'medium' },
            { id: 'decline', label: '断る', description: 'また今度でいい', statChanges: { health: 5, socialClass: -3 }, consequences: ['平穏', '遅れ'], risk: 'low' },
            { id: 'register', label: 'ギルドに登録する', description: '正式な冒険者になる', statChanges: { socialClass: 8, intelligence: 3 }, consequences: ['認知', '登録'], risk: 'low' }
          ] : l === 'fr' ? [
            { id: 'accept', label: 'Accepter la quête', description: 'Le début de l\'aventure', statChanges: { power: 5, intelligence: 5 }, consequences: ['Aventure', 'Croissance'], risk: 'medium' },
            { id: 'decline', label: 'Décliner', description: 'Une autre fois', statChanges: { health: 5, socialClass: -3 }, consequences: ['Tranquillité', 'Retard'], risk: 'low' },
            { id: 'register', label: 'S\'inscrire à la guilde', description: 'Devenir un aventurier officiel', statChanges: { socialClass: 8, intelligence: 3 }, consequences: ['Reconnaissance', 'Inscription'], risk: 'low' }
          ] : l === 'en' ? [
            { id: 'accept', label: 'Accept the Quest', description: 'The beginning of adventure', statChanges: { power: 5, intelligence: 5 }, consequences: ['Adventure', 'Growth'], risk: 'medium' },
            { id: 'decline', label: 'Decline', description: 'Maybe another time', statChanges: { health: 5, socialClass: -3 }, consequences: ['Peace', 'Delay'], risk: 'low' },
            { id: 'register', label: 'Register with the Guild', description: 'Become an official adventurer', statChanges: { socialClass: 8, intelligence: 3 }, consequences: ['Recognition', 'Registration'], risk: 'low' }
          ] : [
            { id: 'accept', label: 'Görevi Kabul Et', description: 'Maceranın başı', statChanges: { power: 5, intelligence: 5 }, consequences: ['Macera', 'Gelişim'], risk: 'medium' },
            { id: 'decline', label: 'Reddet', description: 'Başka sefere', statChanges: { health: 5, socialClass: -3 }, consequences: ['Huzur', 'Gecikme'], risk: 'low' },
            { id: 'register', label: 'Loncaya Kayıt Ol', description: 'Resmi maceracı ol', statChanges: { socialClass: 8, intelligence: 3 }, consequences: ['Tanınma', 'Kayıt'], risk: 'low' }
          ],
          isCanonEncounter: false
        };
      }
      if (age === 30) {
        return {
          id: 'isekai_demon_lord_30',
          age,
          year,
          title: en4('Şeytan Lord', 'Demon Lord', '魔王', 'Le Seigneur Démon'),
          description: en4(
            `${age} yaşındasın. Şeytan Lord'un kaleye ulaşması an meselesi. Onunla yüzleşecek misin?`,
            `You are ${age} years old. The Demon Lord is about to reach the castle. Will you face him?`,
            `${age}歳。魔王が城に迫っている。彼と向き合うのか？`,
            `Tu as ${age} ans. Le Seigneur Démon est sur le point d'atteindre le château. Vas-tu l'affronter ?`
          ),
          type: 'special',
          choices: l === 'ja' ? [
            { id: 'challenge', label: '挑む', description: '全てかける', statChanges: { power: 15, luck: 5 }, consequences: ['決闘', '伝承'], risk: 'extreme' },
            { id: 'diplomacy', label: '外交的解決', description: '言葉で止める', statChanges: { intelligence: 12, socialClass: 8 }, consequences: ['平和', '知恵'], risk: 'high' },
            { id: 'flee', label: '逃げる', description: '生き延びる', statChanges: { health: 10, socialClass: -10 }, consequences: ['生存', '逃亡'], risk: 'low' }
          ] : l === 'fr' ? [
            { id: 'challenge', label: 'Le défier', description: 'Tout risquer', statChanges: { power: 15, luck: 5 }, consequences: ['Duel', 'Légende'], risk: 'extreme' },
            { id: 'diplomacy', label: 'La diplomatie', description: 'L\'arrêter par les mots', statChanges: { intelligence: 12, socialClass: 8 }, consequences: ['Paix', 'Sagesse'], risk: 'high' },
            { id: 'flee', label: 'Fuir', description: 'Survivre', statChanges: { health: 10, socialClass: -10 }, consequences: ['Survie', 'Fuite'], risk: 'low' }
          ] : l === 'en' ? [
            { id: 'challenge', label: 'Challenge Him', description: 'Bet everything', statChanges: { power: 15, luck: 5 }, consequences: ['Duel', 'Legend'], risk: 'extreme' },
            { id: 'diplomacy', label: 'Diplomacy', description: 'Stop him with words', statChanges: { intelligence: 12, socialClass: 8 }, consequences: ['Peace', 'Wisdom'], risk: 'high' },
            { id: 'flee', label: 'Flee', description: 'Survive', statChanges: { health: 10, socialClass: -10 }, consequences: ['Survival', 'Flight'], risk: 'low' }
          ] : [
            { id: 'challenge', label: 'Meydan Oku', description: 'Her şeyi riske at', statChanges: { power: 15, luck: 5 }, consequences: ['Düello', 'Efsane'], risk: 'extreme' },
            { id: 'diplomacy', label: 'Diplomasiyi Dene', description: 'Kelimelerle durdur', statChanges: { intelligence: 12, socialClass: 8 }, consequences: ['Barış', 'Bilgelik'], risk: 'high' },
            { id: 'flee', label: 'Kaç', description: 'Hayatta kal', statChanges: { health: 10, socialClass: -10 }, consequences: ['Hayatta Kalma', 'Kaçış'], risk: 'low' }
          ],
          isCanonEncounter: false
        };
      }
      return null;

    // ─── SHONEN: antrenman ve rakip ───
    case 'shonen_battle':
      if (age === 9) {
        return {
          id: 'shonen_training_9',
          age,
          year,
          title: en4('Yoğun Antrenman', 'Intensive Training', '猛特訓', 'Entraînement intensif'),
          description: en4(
            `${age} yaşındasın. Ninja köyüne kayıt oldun. Her gün antrenman yapman gerek.`,
            `You are ${age} years old. You enrolled at the ninja village. You must train every day.`,
            `${age}歳。忍の里に入門した。毎日特訓しなければならない。`,
            `Tu as ${age} ans. Tu t'es inscrit au village ninja. Tu dois t'entraîner chaque jour.`
          ),
          type: 'special',
          choices: l === 'ja' ? [
            { id: 'hard', label: '毎日特訓する', description: '限界を超える', statChanges: { power: 10, health: -3 }, consequences: ['成長', '疲労'], risk: 'medium' },
            { id: 'balanced', label: 'バランスよく鍛える', description: '体と頭', statChanges: { power: 5, intelligence: 5 }, consequences: ['均衡', '安定'], risk: 'low' },
            { id: 'play', label: '遊ぶ', description: '子供時代を楽しむ', statChanges: { luck: 8, socialClass: 3 }, consequences: ['友情', '楽しみ'], risk: 'low' }
          ] : l === 'fr' ? [
            { id: 'hard', label: 'S\'entraîner tous les jours', description: 'Dépasser tes limites', statChanges: { power: 10, health: -3 }, consequences: ['Croissance', 'Fatigue'], risk: 'medium' },
            { id: 'balanced', label: 'S\'entraîner équilibré', description: 'Corps et esprit', statChanges: { power: 5, intelligence: 5 }, consequences: ['Équilibre', 'Stabilité'], risk: 'low' },
            { id: 'play', label: 'Jouer', description: 'Profiter de l\'enfance', statChanges: { luck: 8, socialClass: 3 }, consequences: ['Amitié', 'Plaisir'], risk: 'low' }
          ] : l === 'en' ? [
            { id: 'hard', label: 'Train Every Day', description: 'Break your limits', statChanges: { power: 10, health: -3 }, consequences: ['Growth', 'Fatigue'], risk: 'medium' },
            { id: 'balanced', label: 'Train Balanced', description: 'Body and mind', statChanges: { power: 5, intelligence: 5 }, consequences: ['Equilibrium', 'Stability'], risk: 'low' },
            { id: 'play', label: 'Play', description: 'Enjoy being a kid', statChanges: { luck: 8, socialClass: 3 }, consequences: ['Friendship', 'Fun'], risk: 'low' }
          ] : [
            { id: 'hard', label: 'Her Gün Antrenman', description: 'Sınırlarını zorla', statChanges: { power: 10, health: -3 }, consequences: ['Gelişim', 'Yorgunluk'], risk: 'medium' },
            { id: 'balanced', label: 'Dengeli Çalış', description: 'Beden ve zihin', statChanges: { power: 5, intelligence: 5 }, consequences: ['Denge', 'İstikrar'], risk: 'low' },
            { id: 'play', label: 'Oyna', description: 'Çocukluğunu yaşa', statChanges: { luck: 8, socialClass: 3 }, consequences: ['Dostluk', 'Eğlence'], risk: 'low' }
          ],
          isCanonEncounter: false
        };
      }
      if (age === 12) {
        return {
          id: 'shonen_rival_12',
          age,
          year,
          title: en4('Rakip', 'Rival', 'ライバル', 'Rival'),
          description: en4(
            `${age} yaşındasın. Aynı yaşta, seninle aynı hedefte biri var. Onunla rekabet edeceksin.`,
            `You are ${age} years old. Someone your age shares your goal. You will compete with them.`,
            `${age}歳。同い年で、同じ目標を持つ誰かがいる。彼と競い合うことになる。`,
            `Tu as ${age} ans. Quelqu'un de ton âge partage ton objectif. Tu vas rivaliser avec lui.`
          ),
          type: 'special',
          choices: l === 'ja' ? [
            { id: 'challenge', label: '挑む', description: '正面から勝負', statChanges: { power: 10, socialClass: 5 }, consequences: ['挑戦', '成長'], risk: 'medium' },
            { id: 'observe', label: '観察する', description: '強さを学ぶ', statChanges: { intelligence: 8, luck: 3 }, consequences: ['学び', '忍耐'], risk: 'low' },
            { id: 'retreat', label: '退く', description: '今は戦わない', statChanges: { health: 5, socialClass: -5 }, consequences: ['待機', '安全'], risk: 'low' }
          ] : l === 'fr' ? [
            { id: 'challenge', label: 'Le défier', description: 'Affronter de face', statChanges: { power: 10, socialClass: 5 }, consequences: ['Défi', 'Croissance'], risk: 'medium' },
            { id: 'observe', label: 'Observer', description: 'Apprendre sa force', statChanges: { intelligence: 8, luck: 3 }, consequences: ['Apprentissage', 'Patience'], risk: 'low' },
            { id: 'retreat', label: 'Reculer', description: 'Pas maintenant', statChanges: { health: 5, socialClass: -5 }, consequences: ['Attente', 'Sécurité'], risk: 'low' }
          ] : l === 'en' ? [
            { id: 'challenge', label: 'Challenge Him', description: 'Face him head-on', statChanges: { power: 10, socialClass: 5 }, consequences: ['Challenge', 'Growth'], risk: 'medium' },
            { id: 'observe', label: 'Observe', description: 'Learn from his strength', statChanges: { intelligence: 8, luck: 3 }, consequences: ['Learning', 'Patience'], risk: 'low' },
            { id: 'retreat', label: 'Back Off', description: 'Not now', statChanges: { health: 5, socialClass: -5 }, consequences: ['Waiting', 'Safety'], risk: 'low' }
          ] : [
            { id: 'challenge', label: 'Meydan Oku', description: 'Karşısına geç', statChanges: { power: 10, socialClass: 5 }, consequences: ['Rekabet', 'Gelişim'], risk: 'medium' },
            { id: 'observe', label: 'Gözlemle', description: 'Onun gücünü öğren', statChanges: { intelligence: 8, luck: 3 }, consequences: ['Öğrenme', 'Sabır'], risk: 'low' },
            { id: 'retreat', label: 'Geri Çekil', description: 'Şimdi değil', statChanges: { health: 5, socialClass: -5 }, consequences: ['Bekleme', 'Güven'], risk: 'low' }
          ],
          isCanonEncounter: false
        };
      }
      return null;

    // ─── DARK_FANTASY: lanet ve av ───
    case 'dark_fantasy':
      if (age === 20) {
        return {
          id: 'df_curse_20',
          age,
          year,
          title: en4('Lanet', 'Curse', '呪い', 'Malédiction'),
          description: en4(
            `${age} yaşındasın. Bir lanet sana bulaştı. Bir cadı seni kurtarmadan önce köpeklere gider.`,
            `You are ${age} years old. A curse has infected you. A witch must cure you before it's too late.`,
            `${age}歳。呪いが君に降りかかった。魔女に治してもらわなければならない。`,
            `Tu as ${age} ans. Une malédiction t'a frappé. Une sorcière doit te guérir avant qu'il ne soit trop tard.`
          ),
          type: 'special',
          choices: l === 'ja' ? [
            { id: 'ritual', label: '儀式に参加する', description: '呪いを払う', statChanges: { intelligence: 8, health: -8 }, consequences: ['浄化', '代償'], risk: 'medium' },
            { id: 'hide', label: '隠れる', description: '村を守る', statChanges: { health: 5, socialClass: -5 }, consequences: ['孤独', '安全'], risk: 'low' },
            { id: 'fight', label: '戦う', description: '呪いに打ち勝つ', statChanges: { power: 12, luck: -5 }, consequences: ['戦い', '負担'], risk: 'high' }
          ] : l === 'fr' ? [
            { id: 'ritual', label: 'Participer au rituel', description: 'Lever la malédiction', statChanges: { intelligence: 8, health: -8 }, consequences: ['Purification', 'Coût'], risk: 'medium' },
            { id: 'hide', label: 'Se cacher', description: 'Protéger le village', statChanges: { health: 5, socialClass: -5 }, consequences: ['Solitude', 'Sécurité'], risk: 'low' },
            { id: 'fight', label: 'Combattre', description: 'Vaincre la malédiction', statChanges: { power: 12, luck: -5 }, consequences: ['Combat', 'Poids'], risk: 'high' }
          ] : l === 'en' ? [
            { id: 'ritual', label: 'Join the Ritual', description: 'Lift the curse', statChanges: { intelligence: 8, health: -8 }, consequences: ['Purification', 'Cost'], risk: 'medium' },
            { id: 'hide', label: 'Hide', description: 'Protect the village', statChanges: { health: 5, socialClass: -5 }, consequences: ['Solitude', 'Safety'], risk: 'low' },
            { id: 'fight', label: 'Fight', description: 'Beat the curse', statChanges: { power: 12, luck: -5 }, consequences: ['Battle', 'Burden'], risk: 'high' }
          ] : [
            { id: 'ritual', label: 'Ritüele Katıl', description: 'Laneti kaldır', statChanges: { intelligence: 8, health: -8 }, consequences: ['Arınma', 'Bedel'], risk: 'medium' },
            { id: 'hide', label: 'Saklan', description: 'Köyü koru', statChanges: { health: 5, socialClass: -5 }, consequences: ['Yalnızlık', 'Güven'], risk: 'low' },
            { id: 'fight', label: 'Savaş', description: 'Laneti yen', statChanges: { power: 12, luck: -5 }, consequences: ['Savaş', 'Yük'], risk: 'high' }
          ],
          isCanonEncounter: false
        };
      }
      if (age === 25) {
        return {
          id: 'df_hunt_25',
          age,
          year,
          title: en4('Mahlukat Avı', 'Monster Hunt', '魔物狩り', 'Chasse aux monstres'),
          description: en4(
            `${age} yaşındasın. Köyün yakınında bir canavar belirdi. Onu avlamak zorundasın.`,
            `You are ${age} years old. A monster appeared near the village. You must hunt it down.`,
            `${age}歳。村の近くに魔物が現れた。狩らなければならない。`,
            `Tu as ${age} ans. Un monstre est apparu près du village. Tu dois le chasser.`
          ),
          type: 'special',
          choices: l === 'ja' ? [
            { id: 'hunt', label: '狩る', description: '村を守る', statChanges: { power: 15, health: -10 }, consequences: ['戦い', '勝利'], risk: 'high' },
            { id: 'observe', label: '観察する', description: '弱点を探る', statChanges: { intelligence: 10, luck: 3 }, consequences: ['学び', '忍耐'], risk: 'low' },
            { id: 'flee', label: '逃げる', description: '自分を守る', statChanges: { health: 10, socialClass: -8 }, consequences: ['生存', '逃亡'], risk: 'low' }
          ] : l === 'fr' ? [
            { id: 'hunt', label: 'Chasser', description: 'Protéger le village', statChanges: { power: 15, health: -10 }, consequences: ['Combat', 'Victoire'], risk: 'high' },
            { id: 'observe', label: 'Observer', description: 'Trouver le point faible', statChanges: { intelligence: 10, luck: 3 }, consequences: ['Apprentissage', 'Patience'], risk: 'low' },
            { id: 'flee', label: 'Fuir', description: 'Te protéger', statChanges: { health: 10, socialClass: -8 }, consequences: ['Survie', 'Fuite'], risk: 'low' }
          ] : l === 'en' ? [
            { id: 'hunt', label: 'Hunt It', description: 'Protect the village', statChanges: { power: 15, health: -10 }, consequences: ['Battle', 'Victory'], risk: 'high' },
            { id: 'observe', label: 'Observe', description: 'Find the weak point', statChanges: { intelligence: 10, luck: 3 }, consequences: ['Learning', 'Patience'], risk: 'low' },
            { id: 'flee', label: 'Flee', description: 'Protect yourself', statChanges: { health: 10, socialClass: -8 }, consequences: ['Survival', 'Flight'], risk: 'low' }
          ] : [
            { id: 'hunt', label: 'Avla', description: 'Köyü koru', statChanges: { power: 15, health: -10 }, consequences: ['Savaş', 'Zafer'], risk: 'high' },
            { id: 'observe', label: 'Gözlemle', description: 'Zayıf noktasını bul', statChanges: { intelligence: 10, luck: 3 }, consequences: ['Öğrenme', 'Sabır'], risk: 'low' },
            { id: 'flee', label: 'Kaç', description: 'Kendini koru', statChanges: { health: 10, socialClass: -8 }, consequences: ['Hayatta Kalma', 'Kaçış'], risk: 'low' }
          ],
          isCanonEncounter: false
        };
      }
      return null;

    default:
      return null;
  }
}

// ─── Dönüm Noktası Olayı (Milestone: 5/15/30/50/70) ────
function createMilestoneEvent(world: AnimeWorld, region: AnimeRegion, age: number, year: number, stats: LifeStats): LifeEvent {
  const l = lifeLang();
  const milestonesJA: Record<number, { title: string; description: string; choices: LifeChoice[] }> = {
    5: {
      title: '幼少期の転機',
      description: `${age}歳。${region.nameEN}地方で、幼少期のはじめの数年が過ぎた。${world.nameEN}の世界で、自分がどんな人間になるか選ぶときだ。`,
      choices: [
        { id: 'curious', label: '好奇心旺盛に', description: '世界を探求し、質問する', statChanges: { intelligence: 8, luck: 5 }, consequences: ['好奇心', '知識'], risk: 'low' },
        { id: 'obedient', label: '従順になる', description: 'ルールに従い、安全に過ごす', statChanges: { socialClass: 5, health: 5 }, consequences: ['安全', '同調'], risk: 'low' },
        { id: 'rebel', label: '反逆者になる', description: 'ルールに疑問を投げかける', statChanges: { power: 5, socialClass: -5, luck: 3 }, consequences: ['自立', '危険'], risk: 'medium' }
      ]
    },
    15: {
      title: '青年期の転機',
      description: `${age}歳。${region.nameEN}地方で、あなたは十代だ。${world.nameEN}の世界で、将来のための最初の大きな決断のときだ。`,
      choices: [
        { id: 'study', label: '勉強に集中する', description: '学校と知識', statChanges: { intelligence: 12, socialClass: 5 }, consequences: ['知識', 'キャリア'], risk: 'low' },
        { id: 'train', label: '力を鍛える', description: '肉体的な力', statChanges: { power: 12, health: -3 }, consequences: ['力', '規律'], risk: 'medium' },
        { id: 'social', label: '社交の人脈', description: '人間関係とつながり', statChanges: { socialClass: 10, luck: 5 }, consequences: ['人脈', '機会'], risk: 'medium' },
        { id: 'freedom', label: '自由を選ぶ', description: '自分の道を切り開く', statChanges: { luck: 8, power: 5, socialClass: -5 }, consequences: ['自由', '危険'], risk: 'high' }
      ]
    },
    30: {
      title: '成人期の転機',
      description: `${age}歳。${region.nameEN}地方で、成人としての人生の折り返しだ。${world.nameEN}の世界で、これまで積み上げたものを刈り取るか、方向を変えるときだ。`,
      choices: [
        { id: 'settle', label: '落ち着く', description: '家族と仕事', statChanges: { socialClass: 10, health: 5 }, consequences: ['安定', '安全'], risk: 'low' },
        { id: 'adventure', label: '冒険を求める', description: '新しい境地へ', statChanges: { luck: 10, power: 5, health: -5 }, consequences: ['冒険', '危険'], risk: 'high' },
        { id: 'mentor', label: '導く者になる', description: '若い者を導く', statChanges: { socialClass: 8, intelligence: 8 }, consequences: ['尊敬', '影響力'], risk: 'medium' },
        { id: 'change', label: '方向を変える', description: '新しい始まり', statChanges: { intelligence: 8, luck: 8, socialClass: -3 }, consequences: ['刷新', '不確かさ'], risk: 'medium' }
      ]
    },
    50: {
      title: '成熟期の転機',
      description: `${age}歳。${region.nameEN}地方で、人生の後半戦だ。${world.nameEN}の世界で、あなたの遺すものと影響は何か？`,
      choices: [
        { id: 'legacy', label: '遺産を残す', description: '何かを創り、教える', statChanges: { socialClass: 10, intelligence: 5 }, consequences: ['遺産', '尊敬'], risk: 'low' },
        { id: 'enjoy', label: '人生を楽しむ', description: '休み、生きる', statChanges: { health: 10, luck: 5 }, consequences: ['幸福', '健康'], risk: 'low' },
        { id: 'fight', label: '戦い続ける', description: 'まだ強い', statChanges: { power: 10, health: -5 }, consequences: ['力', '危険'], risk: 'high' },
        { id: 'reflect', label: '振り返る', description: '自分の人生を見直す', statChanges: { intelligence: 10, socialClass: 5 }, consequences: ['知恵', '平穏'], risk: 'low' }
      ]
    },
    70: {
      title: '老齢期の転機',
      description: `${age}歳。${region.nameEN}地方で、人生の最終段階だ。${world.nameEN}の世界で、どのように記憶されたいか？`,
      choices: [
        { id: 'peace', label: '穏やかに', description: '穏やかに幸せに生きる', statChanges: { health: 10, luck: 5 }, consequences: ['平穏', '健康'], risk: 'low' },
        { id: 'story', label: '物語を語る', description: '経験を分かち合う', statChanges: { socialClass: 10, intelligence: 5 }, consequences: ['遺産', '尊敬'], risk: 'low' },
        { id: 'final', label: '最後の冒険', description: 'もう一度だけ、危険を冒す', statChanges: { power: 8, luck: 8, health: -10 }, consequences: ['冒険', '危険'], risk: 'extreme' },
        { id: 'family', label: '家族と過ごす', description: '愛する人たちと時間を過ごす', statChanges: { socialClass: 8, health: 5 }, consequences: ['絆', '幸福'], risk: 'low' }
      ]
    }
  };
  const milestonesFR: Record<number, { title: string; description: string; choices: LifeChoice[] }> = {
    5: {
      title: 'Tournant de l\'enfance',
      description: `Tu as ${age} ans. Les premières années de ton enfance sont passées dans la région de ${region.nameEN}. Il est temps de choisir qui tu deviendras dans le monde ${world.nameEN}.`,
      choices: [
        { id: 'curious', label: 'Être curieux', description: 'Explore le monde, pose des questions', statChanges: { intelligence: 8, luck: 5 }, consequences: ['Curiosité', 'Connaissance'], risk: 'low' },
        { id: 'obedient', label: 'Être obéissant', description: 'Suis les règles, reste en sécurité', statChanges: { socialClass: 5, health: 5 }, consequences: ['Sécurité', 'Conformisme'], risk: 'low' },
        { id: 'rebel', label: 'Être un rebelle', description: 'Remets les règles en question', statChanges: { power: 5, socialClass: -5, luck: 3 }, consequences: ['Indépendance', 'Risque'], risk: 'medium' }
      ]
    },
    15: {
      title: 'Tournant de l\'adolescence',
      description: `Tu as ${age} ans. Tu es adolescent dans la région de ${region.nameEN}. Il est temps pour la première grande décision vers ton avenir dans le monde ${world.nameEN}.`,
      choices: [
        { id: 'study', label: 'Se concentrer sur les études', description: 'École et connaissances', statChanges: { intelligence: 12, socialClass: 5 }, consequences: ['Connaissance', 'Carrière'], risk: 'low' },
        { id: 'train', label: 'Entraînement physique', description: 'Force physique', statChanges: { power: 12, health: -3 }, consequences: ['Pouvoir', 'Discipline'], risk: 'medium' },
        { id: 'social', label: 'Réseau social', description: 'Relations et connexions', statChanges: { socialClass: 10, luck: 5 }, consequences: ['Réseau', 'Opportunité'], risk: 'medium' },
        { id: 'freedom', label: 'Choisir la liberté', description: 'Trace ton propre chemin', statChanges: { luck: 8, power: 5, socialClass: -5 }, consequences: ['Liberté', 'Risque'], risk: 'high' }
      ]
    },
    30: {
      title: 'Tournant de l\'âge adulte',
      description: `Tu as ${age} ans. Tu es au milieu de ta vie d'adulte dans la région de ${region.nameEN}. Il est temps de récolter les fruits de ta vie, ou de changer de direction.`,
      choices: [
        { id: 'settle', label: 'S\'installer', description: 'Famille et carrière', statChanges: { socialClass: 10, health: 5 }, consequences: ['Stabilité', 'Sécurité'], risk: 'low' },
        { id: 'adventure', label: 'Poursuivre l\'aventure', description: 'Nouveaux horizons', statChanges: { luck: 10, power: 5, health: -5 }, consequences: ['Aventure', 'Risque'], risk: 'high' },
        { id: 'mentor', label: 'Devenir mentor', description: 'Guide les jeunes', statChanges: { socialClass: 8, intelligence: 8 }, consequences: ['Respect', 'Influence'], risk: 'medium' },
        { id: 'change', label: 'Changer de direction', description: 'Un nouveau départ', statChanges: { intelligence: 8, luck: 8, socialClass: -3 }, consequences: ['Renouveau', 'Incertitude'], risk: 'medium' }
      ]
    },
    50: {
      title: 'Tournant de la maturité',
      description: `Tu as ${age} ans. Tu es dans la deuxième moitié de ta vie dans la région de ${region.nameEN}. Quel sera ton héritage et ton influence dans le monde ${world.nameEN} ?`,
      choices: [
        { id: 'legacy', label: 'Laisser un héritage', description: 'Crée quelque chose et enseigne', statChanges: { socialClass: 10, intelligence: 5 }, consequences: ['Héritage', 'Respect'], risk: 'low' },
        { id: 'enjoy', label: 'Profiter de la vie', description: 'Repose-toi et vis', statChanges: { health: 10, luck: 5 }, consequences: ['Bonheur', 'Santé'], risk: 'low' },
        { id: 'fight', label: 'Continuer à se battre', description: 'Tu es encore fort', statChanges: { power: 10, health: -5 }, consequences: ['Pouvoir', 'Risque'], risk: 'high' },
        { id: 'reflect', label: 'Réfléchir et évaluer', description: 'Revois ta vie', statChanges: { intelligence: 10, socialClass: 5 }, consequences: ['Sagesse', 'Paix'], risk: 'low' }
      ]
    },
    70: {
      title: 'Tournant de la vieillesse',
      description: `Tu as ${age} ans. Tu es dans la dernière étape de ta vie dans la région de ${region.nameEN}. Comment aimerais-tu être rappelé dans le monde ${world.nameEN} ?`,
      choices: [
        { id: 'peace', label: 'En paix', description: 'Vis calmement et heureux', statChanges: { health: 10, luck: 5 }, consequences: ['Paix', 'Santé'], risk: 'low' },
        { id: 'story', label: 'Raconter ton histoire', description: 'Partage tes expériences', statChanges: { socialClass: 10, intelligence: 5 }, consequences: ['Héritage', 'Respect'], risk: 'low' },
        { id: 'final', label: 'Une dernière aventure', description: 'Prends un risque, une dernière fois', statChanges: { power: 8, luck: 8, health: -10 }, consequences: ['Aventure', 'Risque'], risk: 'extreme' },
        { id: 'family', label: 'Être avec la famille', description: 'Passe du temps avec tes proches', statChanges: { socialClass: 8, health: 5 }, consequences: ['Lien', 'Bonheur'], risk: 'low' }
      ]
    }
  };
  const milestones: Record<number, { title: string; description: string; choices: LifeChoice[] }> = (l === 'ja' ? milestonesJA : l === 'fr' ? milestonesFR : (l === 'en' ? {
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
  }));
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
    events.push({
      id: `focus_${age}`,
      age,
      year: birthYear + age,
      title: L(`Odak Kontrolü: ${age} Yaşında`, `Focus Check-in: Age ${age}`, `注目点チェックイン: ${age}歳`, `Point de concentration : ${age} ans`),
      description: L(
        `${age} yaşındasın. Hayatının yönünü bir kez daha gözden geçirme zamanı. Bundan sonra hangi odağa geçeceksin? Seçimin önümüzdeki yılların gelişimini belirleyecek.`,
        `You are ${age} years old. It is time to review the direction of your life once more. Where do you want to focus next? Your choice will shape your growth over the next years.`,
        `${age}歳。人生の方向をもう一度見直すときだ。次はどの注目点に焦点を当てるか？あなたの選択が今後の成長を決める。`,
        `Tu as ${age} ans. Il est temps de revoir une fois de plus la direction de ta vie. Sur quoi veux-tu te concentrer maintenant ? Ton choix façonne ton évolution pour les prochaines années.`
      ),
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

  // Faction choice (age 15) — fraksiyonu olmayan evrenlerde atlanır
  if (deathAge > 15) {
    const factionEvent = createFactionEvent(world, region, 15, birthYear + 15, stats);
    if (factionEvent) events.push(factionEvent);
  }

  // Evrene özgü olaylar (Faz 1) — shonen/dark_fantasy/isekai/sports/romance/slice_of_life/cyberpunk/seinen_psych
  const uniqueEventAges = [7, 9, 12, 13, 16, 17, 20, 22, 25, 30];
  for (const uniqueAge of uniqueEventAges) {
    if (uniqueAge < deathAge) {
      const uniqueEvent = createWorldUniqueEvent(world, region, uniqueAge, birthYear + uniqueAge, stats);
      if (uniqueEvent) events.push(uniqueEvent);
    }
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
  const lc = lifeLang();
  const pick4 = (tr: string, en: string, ja: string, fr: string) => (lc === 'tr' ? tr : lc === 'ja' ? ja : lc === 'fr' ? fr : en);
  let deathCause: string;
  const disease = pick4('Hastalık', 'Disease', '病気', 'Maladie');
  const accident = pick4('Kaza', 'Accident', '事故', 'Accident');
  if (deathAge < 1) {
    deathCause = pick4('Bebeklik hastalığı', 'Infant disease', '乳児の病気', 'Maladie infantile');
  } else if (deathAge < 5) {
    deathCause = pick4('Çocukluk hastalığı', 'Childhood illness', '幼少期の病気', 'Maladie de l\'enfance');
  } else if (deathAge < 15) {
    deathCause = Math.random() < 0.6 ? disease : accident;
  } else {
    const violence = pick4('Şiddet/Savaş', 'Violence/War', '暴力・戦争', 'Violence/Guerre');
    const disaster = pick4('Doğa felaketi', 'Natural disaster', '自然災害', 'Catastrophe naturelle');
    const substance = pick4('Madde bağımlılığı', 'Substance abuse', '薬物乱用', 'Toxicomanie');
    const suicide = pick4('İntihar', 'Suicide', '自殺', 'Suicide');
    const oldAge = pick4('Yaşlılık', 'Old age', '老齢', 'Vieillesse');
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
    description: L(
      `${deathAge} yaşında ${region.nameTR} bölgesinde hayatın sona erdi. Neden: ${deathCause}.`,
      `Your life came to an end at the age of ${deathAge} in the ${regionNameL(region)} region. Cause: ${deathCause}.`,
      `${deathAge}歳、${region.nameEN}地方で生涯を終えた。死因: ${deathCause}.`,
      `Votre vie s'est achevée à l'âge de ${deathAge} dans la région de ${region.nameEN}. Cause : ${deathCause}.`
    ),
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

export // ─── Anma Sayfası: 4 dil metin havuzu ─────────────────────
const MEMORIAL_TEXT: Record<LifeLang, {
  titleLine: string; world: string; region: string; name: string; gender: string;
  family: string; education: string; assets: string; era: string; born: string; died: string;
  genderM: string; genderF: string; famPoor: string; famMid: string; famNoble: string;
  eduNone: string; eduBasic: string; eduHigh: string; eduUni: string;
  eraPast: string; eraFuture: string; eraToday: string;
  cause: string; stats: string; power: string; intelligence: string; luck: string;
  socialClass: string; health: string; canonTitle: string; canonLine: (c: string) => string;
  summary: string; eventsHappened: (n: number) => string; livedYears: (n: number, r: string) => string;
  poorLine: string; middleLine: string; nobleLine: string;
  powerHigh: string; intelligenceHigh: string; luckHigh: string;
  footer: (n: string) => string;
}> = {
  tr: {
    titleLine: '         ANMA SAYFASI — HATIRLANAN HAYAT', world: '🌍 Evren', region: '📍 Bölge', name: '👤 İsim', gender: '👤 Cinsiyet',
    family: '👨‍👩‍👧 Aile', education: '🎓 Eğitim', assets: '💰 Varlıklar', era: '⏳ Dönem', born: '📅 Doğum', died: '💀 Ölüm',
    genderM: 'Erkek', genderF: 'Kadın', famPoor: 'Yoksul', famMid: 'Orta halli', famNoble: 'Soylu',
    eduNone: 'Yok', eduBasic: 'Temel', eduHigh: 'Lise', eduUni: 'Üniversite',
    eraPast: 'Geçmiş', eraFuture: 'Gelecek', eraToday: 'Bugün',
    cause: 'Ölüm nedeni', stats: '📊 İstatistikler:', power: 'Güç', intelligence: 'Zeka', luck: 'Şans', socialClass: 'Sosyal Sınıf', health: 'Sağlık',
    canonTitle: '✨ Kanon Karakter Karşılaşmaları:', canonLine: (c) => `   • ${c} ile karşılaştın`,
    summary: '📝 Hayat Özeti:', eventsHappened: (n) => `   ${n} olay yaşandı.`, livedYears: (n, r) => `   ${n} yıl boyunca ${r} bölgesinde yaşadın.\n\n`,
    poorLine: '   Yoksul bir aileden doğdun, hayatta kalmak için mücadele ettin.', middleLine: '   Orta halli bir aileden doğdun, dengeli bir yaşam sürdün.', nobleLine: '   Soylu bir aileden doğdun, konforlu bir yaşam sürdün.',
    powerHigh: '   Güçlü bir savaşçıydın.', intelligenceHigh: '   Zeki ve stratejik biriydin.', luckHigh: '   Şanslı bir hayat sürdün.',
    footer: (n) => `${n} hatırlanacak. Bir hayat yaşandı.`,
  },
  en: {
    titleLine: '         IN MEMORY — A LIFE REMEMBERED', world: '🌍 World', region: '📍 Region', name: '👤 Name', gender: '👤 Gender',
    family: '👨‍👩‍👧 Family', education: '🎓 Education', assets: '💰 Assets', era: '⏳ Era', born: '📅 Born', died: '💀 Died',
    genderM: 'Male', genderF: 'Female', famPoor: 'Poor', famMid: 'Average', famNoble: 'Noble',
    eduNone: 'None', eduBasic: 'Basic', eduHigh: 'High School', eduUni: 'University',
    eraPast: 'Past', eraFuture: 'Future', eraToday: 'Present Day',
    cause: 'Cause of death', stats: '📊 Stats:', power: 'Power', intelligence: 'Intelligence', luck: 'Luck', socialClass: 'Social Class', health: 'Health',
    canonTitle: '✨ Canon Character Encounters:', canonLine: (c) => `   • Met ${c}`,
    summary: '📝 Life Summary:', eventsHappened: (n) => `   ${n} events happened.`, livedYears: (n, r) => `   You lived ${n} years in the ${r} region.\n\n`,
    poorLine: '   You were born into a poor family and struggled to survive.', middleLine: '   You were born into an average family and lived a balanced life.', nobleLine: '   You were born into a noble family and lived a comfortable life.',
    powerHigh: '   You were a powerful fighter.', intelligenceHigh: '   You were a clever, strategic person.', luckHigh: '   You lived a lucky life.',
    footer: (n) => `${n} will be remembered. A life was lived.`,
  },
  ja: {
    titleLine: '         追悼 — 記憶に残された人生', world: '🌍 世界', region: '📍 地域', name: '👤 名前', gender: '👤 性別',
    family: '👨‍👩‍👧 家族', education: '🎓 教育', assets: '💰 資産', era: '⏳ 時代', born: '📅 誕生', died: '💀 死亡',
    genderM: '男性', genderF: '女性', famPoor: '貧しい', famMid: '普通', famNoble: '貴族',
    eduNone: 'なし', eduBasic: '基礎', eduHigh: '高校', eduUni: '大学',
    eraPast: '過去', eraFuture: '未来', eraToday: '現在',
    cause: '死因', stats: '📊 ステータス:', power: '筋力', intelligence: '知力', luck: '運', socialClass: '社会階級', health: '健康',
    canonTitle: '✨ 原作キャラクターとの遭遇:', canonLine: (c) => `   • ${c}に会った`,
    summary: '📝 人生のまとめ:', eventsHappened: (n) => `   ${n}件の出来事があった。`, livedYears: (n, r) => `   ${r}地方で${n}年間生きた。\n\n`,
    poorLine: '   貧しい家に生まれ、生き延びるために戦った。', middleLine: '   普通の家に生まれ、バランスの取れた人生を送った。', nobleLine: '   貴族の家に生まれ、快適な人生を送った。',
    powerHigh: '   強靭な戦士だった。', intelligenceHigh: '   頭脳明晰で戦略的な人物だった。', luckHigh: '   幸運な人生を送った。',
    footer: (n) => `${n}は記憶されるだろう。一つの人生が生きられた。`,
  },
  fr: {
    titleLine: '         À LA MÉMOIRE — UNE VIE SOUVENUE', world: '🌍 Monde', region: '📍 Région', name: '👤 Nom', gender: '👤 Genre',
    family: '👨‍👩‍👧 Famille', education: '🎓 Éducation', assets: '💰 Fortune', era: '⏳ Époque', born: '📅 Né', died: '💀 Mort',
    genderM: 'Homme', genderF: 'Femme', famPoor: 'Pauvre', famMid: 'Moyenne', famNoble: 'Noble',
    eduNone: 'Aucune', eduBasic: 'Basique', eduHigh: 'Lycée', eduUni: 'Université',
    eraPast: 'Passé', eraFuture: 'Futur', eraToday: 'Présent',
    cause: 'Cause du décès', stats: '📊 Statistiques:', power: 'Force', intelligence: 'Intelligence', luck: 'Chance', socialClass: 'Classe sociale', health: 'Santé',
    canonTitle: '✨ Rencontres avec des personnages canon:', canonLine: (c) => `   • Rencontre avec ${c}`,
    summary: '📝 Résumé de la vie:', eventsHappened: (n) => `   ${n} événements vécus.`, livedYears: (n, r) => `   Tu as vécu ${n} ans dans la région de ${r}.\n\n`,
    poorLine: '   Tu es né dans une famille pauvre et tu t\'es battu pour survivre.', middleLine: '   Tu es né dans une famille moyenne et tu as mené une vie équilibrée.', nobleLine: '   Tu es né dans une famille noble et tu as mené une vie confortable.',
    powerHigh: '   Tu étais un combattant puissant.', intelligenceHigh: '   Tu étais une personne intelligente et stratégique.', luckHigh: '   Tu as mené une vie chanceuse.',
    footer: (n) => `${n} sera rappelé. Une vie a été vécue.`,
  },
};

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
  const canonEncounters = events.filter(e => e.isCanonEncounter && e.canonCharacter).map(e => e.canonCharacter as string);
  const finalEducation = getEducationTier(stats.intelligence);
  const l = lifeLang();
  const T = MEMORIAL_TEXT[l];

  let text = `═══════════════════════════════════════\n`;
  text += `         ${T.titleLine.trim()}\n`;
  text += `═══════════════════════════════════════\n\n`;
  text += `${T.world}: ${worldNameL(world)}\n`;
  text += `${T.region}: ${regionNameL(region)}\n`;
  text += `${T.name}: ${characterName}\n`;
  text += `${T.gender}: ${gender === 'male' ? T.genderM : T.genderF}\n`;
  text += `${T.family}: ${familyStatus === 'poor' ? T.famPoor : familyStatus === 'noble' ? T.famNoble : T.famMid}\n`;
  text += `${T.education}: ${finalEducation === 'none' ? T.eduNone : finalEducation === 'basic' ? T.eduBasic : finalEducation === 'high' ? T.eduHigh : T.eduUni}\n`;
  text += `${T.assets}: ${assets}\n`;
  text += `${T.era}: ${period === 'past' ? T.eraPast : period === 'future' ? T.eraFuture : T.eraToday}\n`;
  text += `${T.born}: ${birthYear}\n`;
  text += `${T.died}: ${birthYear + deathAge} (${deathAge})\n`;
  text += `${T.cause}: ${deathCause}\n\n`;
  text += `${T.stats}\n`;
  text += `   ${T.power}: ${stats.power}/100\n`;
  text += `   ${T.intelligence}: ${stats.intelligence}/100\n`;
  text += `   ${T.luck}: ${stats.luck}/100\n`;
  text += `   ${T.socialClass}: ${stats.socialClass}/100\n`;
  text += `   ${T.health}: ${stats.health}/100\n\n`;

  if (canonEncounters.length > 0) {
    text += `${T.canonTitle}\n`;
    canonEncounters.forEach(c => {
      text += `${T.canonLine(c)}\n`;
    });
    text += `\n`;
  }

  text += `${T.summary}\n`;
  text += `${T.eventsHappened(events.length)}\n`;
  text += `${T.livedYears(deathAge, regionNameL(region))}`;

  if (stats.socialClass < 30) {
    text += `${T.poorLine}\n`;
  } else if (stats.socialClass > 70) {
    text += `${T.nobleLine}\n`;
  } else {
    text += `${T.middleLine}\n`;
  }

  if (stats.power > 60) {
    text += `${T.powerHigh}\n`;
  }
  if (stats.intelligence > 60) {
    text += `${T.intelligenceHigh}\n`;
  }
  if (stats.luck > 60) {
    text += `${T.luckHigh}\n`;
  }

  text += `\n═══════════════════════════════════════\n`;
  text += `${T.footer(characterName)}\n`;
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
  const l = lifeLang();
  const pick = (tr: string, en: string, ja: string, fr: string) => (l === 'tr' ? tr : l === 'ja' ? ja : l === 'fr' ? fr : en);

  if (deathAge >= 80) achievements.push(pick('Yaşlılık', 'Old Age', '長寿', 'Vieillesse'));
  if (deathAge >= 60 && deathAge < 80) achievements.push(pick('Uzun Yaşam', 'Long Life', '長命', 'Longue vie'));
  if (deathAge < 20) achievements.push(pick('Erken Vefat', 'Early Passing', '若くして逝く', 'Décès précoce'));
  if (stats.power > 70) achievements.push(pick('Güçlü Savaşçı', 'Mighty Fighter', '剛勇の戦士', 'Combattant puissant'));
  if (stats.intelligence > 70) achievements.push(pick('Zeka Küpü', 'Brainbox', '天才', 'Cerveau'));
  if (stats.luck > 70) achievements.push(pick('Şanslı', 'Lucky One', '幸運な者', 'Chanceux'));
  if (stats.socialClass > 70) achievements.push(pick('Soylu', 'Noble', '貴族', 'Noble'));
  if (stats.socialClass < 20) achievements.push(pick('Yoksul', 'Poor', '貧しい', 'Pauvre'));
  if (stats.health > 80) achievements.push(pick('Sağlıklı', 'Healthy', '健康', 'En bonne santé'));
  if (events.some(e => e.isCanonEncounter)) achievements.push(pick('Kanon Karakterle Karşılaştı', 'Canon Character Encounter', '原作キャラと遭遇', 'Rencontre avec un personnage canon'));
  if (world.dangerLevel === 'extreme' && deathAge >= 30) achievements.push(pick('Hayatta Kalma Ustası', 'Survival Master', '生存の達人', 'Maître de la survie'));
  if (world.dangerLevel === 'low' && deathAge >= 70) achievements.push(pick('Huzurlu Yaşam', 'Peaceful Life', '穏やかな人生', 'Vie paisible'));
  if (events.filter(e => e.type === 'crisis').length >= 3) achievements.push(pick('Kriz Yöneticisi', 'Crisis Manager', '危機管理者', 'Gestionnaire de crise'));
  if (events.filter(e => e.type === 'choice' || (e.choices && e.choices.length > 0)).length >= 2) achievements.push(pick('Seçimci', 'Decisive', '決断力のある者', 'Décisif'));

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
  const l = lifeLang();
  const pick = (tr: string, en: string, ja: string, fr: string) => (l === 'tr' ? tr : l === 'ja' ? ja : l === 'fr' ? fr : en);
  const line1 = pick(
    `🌍 ${world.nameTR} evreninde ${region.nameTR} bölgesinde ${life.deathAge} yıl yaşadım.`,
    `🌍 I lived ${life.deathAge} years in ${region.nameEN}, ${world.nameEN}.`,
    `🌍 ${world.nameEN}の世界、${region.nameEN}地方で${life.deathAge}年間生きた。`,
    `🌍 J'ai vécu ${life.deathAge} ans à ${region.nameEN}, dans le monde ${world.nameEN}.`
  );
  const lineDeath = pick(`Ölüm nedeni: ${life.deathCause}`, `Cause of death: ${life.deathCause}`, `死因: ${life.deathCause}`, `Cause du décès : ${life.deathCause}`);
  const lineStats = pick(`Güç: ${life.finalStats.power} | Zeka: ${life.finalStats.intelligence} | Şans: ${life.finalStats.luck}`, `Power: ${life.finalStats.power} | Intelligence: ${life.finalStats.intelligence} | Luck: ${life.finalStats.luck}`, `筋力: ${life.finalStats.power} | 知力: ${life.finalStats.intelligence} | 運: ${life.finalStats.luck}`, `Force : ${life.finalStats.power} | Intelligence : ${life.finalStats.intelligence} | Chance : ${life.finalStats.luck}`);
  const lineEncounters = life.isCanonEncountered ? pick(
    `✨ Kanon karakterlerle karşılaştım: ${life.canonEncounters.join(', ')}\n`,
    `✨ I met canon characters: ${life.canonEncounters.join(', ')}\n`,
    `✨ 原作キャラに会った: ${life.canonEncounters.join(', ')}\n`,
    `✨ J'ai rencontré des personnages canon : ${life.canonEncounters.join(', ')}\n`
  ) : '';
  return `${line1}\n` +
    `👤 ${life.characterName}\n` +
    `${lineDeath}\n` +
    `${lineStats}\n` +
    lineEncounters +
    pick('AniSync 8 Milyar Evrende 1', 'AniSync 1 in 8 Billion', 'AniSync 1 in 8 Billion', 'AniSync 1 sur 8 milliards');
}