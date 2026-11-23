import { ANIME_FACTS, type AnimeFact, type FactLang } from '../data/animeFacts';
import { getDailyPrompt, type PromptLang } from '../data/dailyPrompts';
import { getDailyMaarif, type DailyMaarif } from './maarif';

export type EngagementPopupType = 'anime-fact' | 'daily-question' | 'maarif';

export interface EngagementPopupPayload {
  type: EngagementPopupType;
  fact?: AnimeFact;
  question?: string;
  hint?: string;
  promptIndex?: number;
  maarif?: DailyMaarif;
}

export interface EngagementSlot {
  at: number;
  type: EngagementPopupType;
}

export interface EngagementDayState {
  day: string;
  slots: EngagementSlot[];
  shownSlotIndexes: number[];
  dismissedDay: boolean;
}

export interface EngagementHistoryState {
  shownFactIds: string[];
}

export interface EngagementStorage {
  dayState: EngagementDayState | null;
  history: EngagementHistoryState;
}

export const ENGAGEMENT_STORAGE_KEY = 'anisync-engagement-popup-v1';
export const ENGAGEMENT_MAX_PER_DAY = 2;
export const ENGAGEMENT_MIN_GAP_MS = 20 * 60 * 1000;
export const ENGAGEMENT_FIRST_SLOT_MIN_MS = 20 * 1000;
export const ENGAGEMENT_FIRST_SLOT_MAX_MS = 3 * 60 * 1000;
export const ENGAGEMENT_SECOND_SLOT_MIN_MS = 30 * 60 * 1000;
export const ENGAGEMENT_SECOND_SLOT_MAX_MS = 90 * 60 * 1000;
const FACT_HISTORY_LIMIT = 200;

const DEFAULT_HISTORY: EngagementHistoryState = { shownFactIds: [] };

export function getDayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function randomInt(min: number, max: number, rng: () => number = Math.random): number {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  if (hi <= lo) return lo;
  return Math.floor(rng() * (hi - lo + 1)) + lo;
}

function pickSecondType(rng: () => number): EngagementPopupType {
  return rng() < 0.5 ? 'anime-fact' : 'daily-question';
}

/**
 * Günün ilk yaprağı her zaman "Saatli Maarif"tir; ikinci slot anime bilgisi
 * veya günün sorusu olarak dönüşümlü seçilir. Böylece takvim yaprağı günde
 * bir kez garanti görünür, toplam cap 2 kalır.
 */
export function createDaySlots(now: number, rng: () => number = Math.random): EngagementSlot[] {
  const firstAt = now + randomInt(ENGAGEMENT_FIRST_SLOT_MIN_MS, ENGAGEMENT_FIRST_SLOT_MAX_MS, rng);
  const secondMin = Math.max(firstAt + ENGAGEMENT_MIN_GAP_MS, firstAt + ENGAGEMENT_SECOND_SLOT_MIN_MS);
  const secondAt = secondMin + randomInt(0, ENGAGEMENT_SECOND_SLOT_MAX_MS - ENGAGEMENT_SECOND_SLOT_MIN_MS, rng);
  const slots: EngagementSlot[] = [
    { at: firstAt, type: 'maarif' },
    { at: secondAt, type: pickSecondType(rng) },
  ];
  return slots.slice(0, ENGAGEMENT_MAX_PER_DAY);
}

export function loadEngagementStorage(storage: Pick<Storage, 'getItem'> | null | undefined): EngagementStorage {
  if (!storage) return { dayState: null, history: DEFAULT_HISTORY };
  try {
    const raw = storage.getItem(ENGAGEMENT_STORAGE_KEY);
    if (!raw) return { dayState: null, history: DEFAULT_HISTORY };
    const parsed = JSON.parse(raw) as Partial<EngagementStorage>;
    const history: EngagementHistoryState = {
      shownFactIds: Array.isArray(parsed.history?.shownFactIds)
        ? parsed.history!.shownFactIds.filter((id): id is string => typeof id === 'string')
        : [],
    };
    const dayState = parsed.dayState && typeof parsed.dayState === 'object' ? parsed.dayState as EngagementDayState : null;
    return { dayState, history };
  } catch {
    return { dayState: null, history: DEFAULT_HISTORY };
  }
}

export function saveEngagementStorage(storage: Pick<Storage, 'setItem'> | null | undefined, data: EngagementStorage): void {
  if (!storage) return;
  try {
    storage.setItem(ENGAGEMENT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota/private mode
  }
}

export function ensureDayState(
  data: EngagementStorage,
  now: number,
  rng: () => number = Math.random,
): EngagementStorage {
  const day = getDayKey(new Date(now));
  const existing = data.dayState;
  if (
    existing &&
    existing.day === day &&
    Array.isArray(existing.slots) &&
    existing.slots.length > 0 &&
    Array.isArray(existing.shownSlotIndexes)
  ) {
    return data;
  }
  return {
    ...data,
    dayState: {
      day,
      slots: createDaySlots(now, rng),
      shownSlotIndexes: [],
      dismissedDay: false,
    },
  };
}

export function pickAnimeFact(
  history: EngagementHistoryState,
  rng: () => number = Math.random,
): AnimeFact | null {
  const seen = new Set(history.shownFactIds);
  const unseen = ANIME_FACTS.filter((fact) => !seen.has(fact.id));
  if (unseen.length === 0) return null;
  return unseen[randomInt(0, unseen.length - 1, rng)] ?? null;
}

export function markFactShown(history: EngagementHistoryState, factId: string): EngagementHistoryState {
  if (history.shownFactIds.includes(factId)) return history;
  const next = [...history.shownFactIds, factId];
  return { shownFactIds: next.slice(-FACT_HISTORY_LIMIT) };
}

export function hasBlockingModal(doc: Document | null | undefined): boolean {
  if (!doc) return false;
  return !!doc.querySelector('[aria-modal="true"]');
}

export function isDocumentVisible(doc: Document | null | undefined): boolean {
  if (!doc) return true;
  return doc.visibilityState === 'visible';
}

export function getPendingSlotIndex(state: EngagementDayState, now: number): number | null {
  if (state.dismissedDay) return null;
  if (state.shownSlotIndexes.length >= ENGAGEMENT_MAX_PER_DAY) return null;
  for (let i = 0; i < state.slots.length; i += 1) {
    if (state.shownSlotIndexes.includes(i)) continue;
    if (now >= state.slots[i].at) return i;
  }
  return null;
}

export function getNextSlotDelay(state: EngagementDayState, now: number): number | null {
  if (state.dismissedDay) return null;
  if (state.shownSlotIndexes.length >= ENGAGEMENT_MAX_PER_DAY) return null;
  const pendingTimes = state.slots
    .map((slot, index) => ({ slot, index }))
    .filter(({ index }) => !state.shownSlotIndexes.includes(index))
    .map(({ slot }) => slot.at)
    .filter((at) => at > now);
  if (pendingTimes.length === 0) return null;
  return Math.max(0, Math.min(...pendingTimes) - now);
}

export function buildPayload(
  type: EngagementPopupType,
  lang: string,
  history: EngagementHistoryState,
  rng: () => number = Math.random,
): { payload: EngagementPopupPayload | null; history: EngagementHistoryState } {
  if (type === 'maarif') {
    return {
      payload: { type, maarif: getDailyMaarif(new Date()) },
      history,
    };
  }

  if (type === 'daily-question') {
    const prompt = getDailyPrompt(lang as PromptLang);
    return {
      payload: {
        type,
        question: prompt.question,
        hint: prompt.hint,
        promptIndex: prompt.index,
      },
      history,
    };
  }

  const fact = pickAnimeFact(history, rng);
  if (!fact) return { payload: null, history };
  return {
    payload: { type, fact },
    history: markFactShown(history, fact.id),
  };
}

export function getFactText(fact: AnimeFact, lang: string): string {
  const key = (['tr', 'en', 'ja', 'fr'].includes(lang) ? lang : 'en') as FactLang;
  return fact.text[key] || fact.text.en;
}

export function getFactTag(fact: AnimeFact, lang: string): string {
  const key = (['tr', 'en', 'ja', 'fr'].includes(lang) ? lang : 'en') as FactLang;
  return fact.tag[key] || fact.tag.en;
}
