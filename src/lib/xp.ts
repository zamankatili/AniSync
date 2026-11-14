/**
 * XP motoru — AniSync'te "sadakat ekonomisi"nin çekirdeği.
 *
 * İlkeler:
 *  1. Tek bir ilerleme sayısı **karma + etkileşim XP**'sidir; seviye eğrisi
 *     `lib/level.ts`'tedir. Bu modül yalnızca DAILY-CAP'li ve IDEMPOTENT
 *     "etkileşim XP" defterini üretir.
 *  2. Her XP kazanımı benzersiz bir `key`e bağlanır; aynı anahtar ikinci kez
 *     harcanamaz (ör. günlük oyun günde bir kez, gönderi başına bir kez).
 *  3. Aksiyon başına günlük tavan + global günlük tavan (300 XP) grind'i sınırlar.
 *  4. Kayıt TR gün anahtarıyla (`getDailyDateKey`) tutulur; seriler günü
 *     atlama kuralıyla çalışır.
 *
 * Bu katman bilinçli olarak Firestore'a bağımlı değildir; saf fonksiyonlardır
 * ve `store/useXpStore` ile birleşir.
 */

import { diffDateKeys } from './dailyDate';

export type XpDifficulty = 'easy' | 'medium' | 'hard';

/** Günlük hedef: günün bu kadar XP'sini toplayan kullanıcı "hedefi tutturdu" rozetine yaklaşır. */
export const DAILY_GOAL_XP = 100;

/** Global günlük tavan — kazanımın üst sınırı. */
export const DAILY_XP_CAP = 300;

/** Defter kayıt sınırı; en eskiler kırpılır (toplam ayrıca tutulur). */
export const LEDGER_LIMIT = 400;
export const SNAPSHOT_VERSION = 3;

export const XP_ACTIONS = [
  'daily_login',
  'streak_bonus',
  'game_finish',
  'forum_post',
  'forum_comment',
  'lore_read',
  'watch_party',
  'list_add',
  'quiz_finish',
] as const;

export type XpAction = (typeof XP_ACTIONS)[number];

export interface XpRule {
  /** Kazanımın tabanı (zorluk çarpanından önce). */
  baseXp: number;
  /** Günlük en fazla kaç kez sayılır. */
  dailyCountCap: number;
  /** Günlük en fazla XP (bu aksiyon için). */
  dailyXpCap: number;
}

export const XP_RULES: Record<XpAction, XpRule> = {
  daily_login: { baseXp: 10, dailyCountCap: 1, dailyXpCap: 10 },
  streak_bonus: { baseXp: 0, dailyCountCap: 1, dailyXpCap: 200 },
  /** Kumam 20; zorlukla çarpar (kolay 1.0, orta 1.5, zor 2.0 → 20/30/40). Kayıpta 5 XP. */
  game_finish: { baseXp: 20, dailyCountCap: 3, dailyXpCap: 60 },
  forum_post: { baseXp: 15, dailyCountCap: 2, dailyXpCap: 30 },
  forum_comment: { baseXp: 5, dailyCountCap: 4, dailyXpCap: 20 },
  lore_read: { baseXp: 5, dailyCountCap: 6, dailyXpCap: 30 },
  watch_party: { baseXp: 20, dailyCountCap: 1, dailyXpCap: 20 },
  list_add: { baseXp: 5, dailyCountCap: 5, dailyXpCap: 25 },
  quiz_finish: { baseXp: 10, dailyCountCap: 3, dailyXpCap: 30 },
};

/** Zorluk çarpanları: bilinirlik düştükçe ödül artar (fakat grind korunur). */
export const DIFFICULTY_XP_MULTIPLIER: Record<XpDifficulty, number> = {
  easy: 1,
  medium: 1.5,
  hard: 2,
};

/** Seri kilometre taşları: [gün, bonus XP]. Yalnızca tam gün sayılarında tetiklenir. */
export const STREAK_MILESTONES: ReadonlyArray<readonly [number, number]> = [
  [3, 10],
  [7, 25],
  [14, 60],
  [30, 150],
];

export interface XpEntry {
  /** Idempotency anahtarı — aynı anahtar ikinci kez XP vermez. */
  key: string;
  action: XpAction;
  xp: number;
  /** TR gün anahtarı (YYYY-MM-DD). */
  day: string;
  at: number;
}

export interface XpSnapshot {
  version: number;
  /** Etkileşim XP'si (karma hariç). */
  totalXp: number;
  entries: XpEntry[];
  /** Güncel giriş serisi. */
  streak: number;
  bestStreak: number;
  lastVisitDate?: string;
  updatedAt: number;
}

export const EMPTY_XP_SNAPSHOT: XpSnapshot = {
  version: SNAPSHOT_VERSION,
  totalXp: 0,
  entries: [],
  streak: 0,
  bestStreak: 0,
  updatedAt: 0,
};

const isFiniteInt = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const clampNonNegativeInt = (value: unknown): number =>
  Math.max(0, Math.floor(isFiniteInt(value) ? value : Number(value) || 0));

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
const isDateKey = (value: unknown): value is string =>
  typeof value === 'string' && DATE_KEY_RE.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`));

/** Bozuk/yarım kayıtları güvenli hâle getirir. */
export function sanitizeSnapshot(raw: unknown): XpSnapshot {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_XP_SNAPSHOT };
  const source = raw as Partial<XpSnapshot> & Record<string, unknown>;

  const entries = Array.isArray(source.entries)
    ? source.entries
        .map((entry): XpEntry | null => {
          if (!entry || typeof entry !== 'object') return null;
          const e = entry as Partial<XpEntry>;
          const action = XP_ACTIONS.includes(e.action as XpAction) ? (e.action as XpAction) : null;
          const xp = clampNonNegativeInt(e.xp);
          const at = isFiniteInt(e.at) ? e.at : Date.now();
          if (!action || !isDateKey(e.day) || typeof e.key !== 'string' || e.key.length === 0) return null;
          return { key: e.key, action, xp, day: e.day, at };
        })
        .filter((entry): entry is XpEntry => entry !== null)
    : [];

  // Anahtar tekilliği: ilk kayıt kazanır.
  const seen = new Set<string>();
  const unique = entries.filter((entry) => {
    if (seen.has(entry.key)) return false;
    seen.add(entry.key);
    return true;
  });

  const trimmed = unique.slice(-LEDGER_LIMIT);
  const streak = clampNonNegativeInt(source.streak);
  const bestStreak = Math.max(streak, clampNonNegativeInt(source.bestStreak));

  return {
    version: SNAPSHOT_VERSION,
    // Toplam defter kayıtlarından türetilebilir; yine de saklı değeri taşıyoruz
    // ve kırpılmış kayıtlar için kullanıyoruz.
    totalXp: clampNonNegativeInt(source.totalXp),
    entries: trimmed,
    streak,
    bestStreak,
    lastVisitDate: isDateKey(source.lastVisitDate) ? source.lastVisitDate : undefined,
    updatedAt: isFiniteInt(source.updatedAt) ? source.updatedAt : Date.now(),
  };
}

export function actionCountForDay(snapshot: XpSnapshot, action: XpAction, day: string): number {
  return snapshot.entries.reduce((count, entry) => (entry.day === day && entry.action === action ? count + 1 : count), 0);
}

export function actionXpForDay(snapshot: XpSnapshot, action: XpAction, day: string): number {
  return snapshot.entries.reduce((sum, entry) => (entry.day === day && entry.action === action ? sum + entry.xp : sum), 0);
}

export function dayXp(snapshot: XpSnapshot, day: string): number {
  return snapshot.entries.reduce((sum, entry) => (entry.day === day ? sum + entry.xp : sum), 0);
}

export interface AwardRequest {
  action: XpAction;
  /** Idempotency anahtarı. */
  key: string;
  /** TR gün anahtarı. */
  day: string;
  /** Oyun zorluğu (yalnızca game_finish). */
  difficulty?: XpDifficulty;
  /** Kayıpta/zafersizse false → sabit 5 XP. */
  won?: boolean;
  /** streak_bonus gibi doğrudan miktar. */
  flatXp?: number;
  now?: number;
}

export type AwardStatus =
  | 'ok'
  | 'duplicate'
  | 'day_count_cap'
  | 'action_xp_cap'
  | 'global_xp_cap';

export interface AwardResult {
  awarded: number;
  status: AwardStatus;
  snapshot: XpSnapshot;
}

function baseAmount(request: AwardRequest, rule?: XpRule): number {
  if (typeof request.flatXp === 'number' && Number.isFinite(request.flatXp)) {
    return clampNonNegativeInt(request.flatXp);
  }
  if (!rule) return 0;

  if (request.action === 'game_finish') {
    if (request.won === false) return Math.max(5, Math.round(rule.baseXp * 0.25));
    const multiplier = request.difficulty ? DIFFICULTY_XP_MULTIPLIER[request.difficulty] : 1;
    return Math.round(rule.baseXp * multiplier);
  }
  return rule.baseXp;
}

/** Kuralları uygular; kapasiteye takılırsa verilebilen kadarını verir (kısmi ödeme). */
export function awardXp(snapshot: XpSnapshot, request: AwardRequest): AwardResult {
  const base = snapshot;
  const key = String(request.key || '').trim();
  if (!key) return { awarded: 0, status: 'duplicate', snapshot: base };
  if (base.entries.some((entry) => entry.key === key)) {
    return { awarded: 0, status: 'duplicate', snapshot: base };
  }

  const rule = XP_RULES[request.action];
  if (!rule) return { awarded: 0, status: 'duplicate', snapshot: base };

  // Aksiyon başına adet tavanı
  if (rule.dailyCountCap > 0 && actionCountForDay(base, request.action, request.day) >= rule.dailyCountCap) {
    return { awarded: 0, status: 'day_count_cap', snapshot: base };
  }

  const requested = baseAmount(request, rule);
  if (requested <= 0) return { awarded: 0, status: 'ok', snapshot: base };

  const actionRemaining = rule.dailyXpCap > 0
    ? Math.max(0, rule.dailyXpCap - actionXpForDay(base, request.action, request.day))
    : requested;
  if (actionRemaining <= 0) {
    return { awarded: 0, status: 'action_xp_cap', snapshot: base };
  }

  const globalRemaining = Math.max(0, DAILY_XP_CAP - dayXp(base, request.day));
  if (globalRemaining <= 0) {
    return { awarded: 0, status: 'global_xp_cap', snapshot: base };
  }

  const awarded = Math.min(requested, actionRemaining, globalRemaining);
  const next: XpSnapshot = {
    ...base,
    totalXp: base.totalXp + awarded,
    entries: [
      ...base.entries,
      { key, action: request.action, xp: awarded, day: request.day, at: request.now ?? Date.now() },
    ].slice(-LEDGER_LIMIT),
    updatedAt: request.now ?? Date.now(),
  };

  return { awarded, status: 'ok', snapshot: next };
}

export interface DailyVisitResult {
  snapshot: XpSnapshot;
  /** Bu çağrıda fiilen giriş XP'si verildi mi. */
  loginXp: number;
  streakBonusXp: number;
  /** Ziyaret sonrası güncel seri. */
  streak: number;
  /** Bugün zaten ziyaret edilmiş miydi (XP yok). */
  alreadyVisited: boolean;
}

/**
 * Günlük giriş + seri hesabı.
 *
 * - Seri, `lastVisitDate` bugünden bir önceki günde ise +1'dir; atlanan gün
 *   serisini sıfırlar (bugün: 1).
 * - Kilometre taşlarında bonus verilir (3→+10, 7→+25, 14→+60, 30→+150).
 * - `daily_login:{day}` ve `streak:{day}` anahtarları idempotenttir.
 */
export function applyDailyVisit(snapshot: XpSnapshot, day: string, now: number = Date.now()): DailyVisitResult {
  const base = sanitizeSnapshot(snapshot);

  if (base.lastVisitDate === day) {
    return { snapshot: base, loginXp: 0, streakBonusXp: 0, streak: base.streak, alreadyVisited: true };
  }

  const gap = base.lastVisitDate ? diffDateKeys(base.lastVisitDate, day) : Number.NaN;
  const streak = Number.isNaN(gap) || gap !== 1 ? 1 : base.streak + 1;

  let next: XpSnapshot = {
    ...base,
    streak,
    bestStreak: Math.max(base.bestStreak, streak),
    lastVisitDate: day,
    updatedAt: now,
  };

  const loginAward = awardXp(next, { action: 'daily_login', key: `daily_login:${day}`, day, now });
  next = loginAward.snapshot;

  const milestone = STREAK_MILESTONES.find(([milestoneDay]) => milestoneDay === streak);
  let streakBonusXp = 0;
  if (milestone) {
    const [, bonus] = milestone;
    const bonusAward = awardXp(next, {
      action: 'streak_bonus',
      key: `streak_bonus:${day}:${streak}`,
      day,
      flatXp: bonus,
      now,
    });
    next = bonusAward.snapshot;
    streakBonusXp = bonusAward.awarded;
  }

  return {
    snapshot: next,
    loginXp: loginAward.awarded,
    streakBonusXp,
    streak,
    alreadyVisited: false,
  };
}

/** Misafir defterini hesaba taşır (giriş sonrası bir kez çağrılır). */
export function mergeSnapshots(account: XpSnapshot, guest: XpSnapshot): XpSnapshot {
  const a = sanitizeSnapshot(account);
  const b = sanitizeSnapshot(guest);

  // Defterler ve giriş kaydı da boşsa değişiklik yok.
  if (b.entries.length === 0 && !b.lastVisitDate) return a;

  const accountKeys = new Set(a.entries.map((entry) => entry.key));
  // Hem defterde hem toplamda yenişe sayılmasın: anahtar çakışan kazanımlar
  // yalnızca bir kez (hesabın toplamında) sayılır.
  const overlapXp = b.entries.reduce((sum, entry) => (accountKeys.has(entry.key) ? sum + entry.xp : sum), 0);

  const seen = new Set(accountKeys);
  const mergedEntries = [...a.entries];
  for (const entry of b.entries) {
    if (seen.has(entry.key)) continue;
    seen.add(entry.key);
    mergedEntries.push(entry);
  }
  mergedEntries.sort((x, y) => x.at - y.at);

  const lastVisitDate = !a.lastVisitDate
    ? b.lastVisitDate
    : !b.lastVisitDate
      ? a.lastVisitDate
      : (diffDateKeys(a.lastVisitDate, b.lastVisitDate) > 0 ? b.lastVisitDate : a.lastVisitDate);

  const streakSource = !a.lastVisitDate
    ? b
    : !b.lastVisitDate
      ? a
      : (diffDateKeys(a.lastVisitDate, b.lastVisitDate) > 0 ? b : a);

  return {
    version: SNAPSHOT_VERSION,
    totalXp: a.totalXp + b.totalXp - overlapXp,
    entries: mergedEntries.slice(-LEDGER_LIMIT),
    streak: lastVisitDate ? streakSource.streak : 0,
    bestStreak: Math.max(a.bestStreak, b.bestStreak, streakSource.streak),
    lastVisitDate,
    updatedAt: Date.now(),
  };
}
