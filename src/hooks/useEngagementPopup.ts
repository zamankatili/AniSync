import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppTranslation } from './useAppTranslation';
import {
  buildPayload,
  ensureDayState,
  ENGAGEMENT_STORAGE_KEY,
  getNextSlotDelay,
  getPendingSlotIndex,
  hasBlockingModal,
  isDocumentVisible,
  loadEngagementStorage,
  saveEngagementStorage,
  type EngagementDayState,
  type EngagementPopupPayload,
  type EngagementStorage,
} from '../lib/engagementPopup';

const CHECK_INTERVAL_MS = 15_000;

function readStorage(): EngagementStorage {
  if (typeof window === 'undefined') return { dayState: null, history: { shownFactIds: [] } };
  return loadEngagementStorage(window.localStorage);
}

function writeStorage(data: EngagementStorage) {
  if (typeof window === 'undefined') return;
  saveEngagementStorage(window.localStorage, data);
}

export function useEngagementPopup() {
  const { currentLang } = useAppTranslation();
  const location = useLocation();
  const [payload, setPayload] = useState<EngagementPopupPayload | null>(null);
  const payloadRef = useRef<EngagementPopupPayload | null>(null);
  const timerRef = useRef<number | null>(null);
  const checkingRef = useRef(false);
  const tryShowDueRef = useRef<() => void>(() => {});

  const setCurrentPayload = useCallback((next: EngagementPopupPayload | null) => {
    payloadRef.current = next;
    setPayload(next);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleNext = useCallback(() => {
    clearTimer();
    if (typeof window === 'undefined') return;
    const data = ensureDayState(readStorage(), Date.now());
    writeStorage(data);
    const dayState = data.dayState;
    if (!dayState) return;
    const delay = getNextSlotDelay(dayState, Date.now());
    if (delay === null) return;
    timerRef.current = window.setTimeout(() => {
      tryShowDueRef.current();
    }, Math.min(delay, 2_147_483_647));
  }, [clearTimer]);

  const tryShowDue = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (checkingRef.current) return;
    if (payloadRef.current) return;
    if (!isDocumentVisible(document)) {
      scheduleNext();
      return;
    }
    if (hasBlockingModal(document)) {
      scheduleNext();
      return;
    }

    checkingRef.current = true;
    try {
      let data = ensureDayState(readStorage(), Date.now());
      const dayState = data.dayState;
      if (!dayState) return;
      const slotIndex = getPendingSlotIndex(dayState, Date.now());
      if (slotIndex === null) {
        writeStorage(data);
        scheduleNext();
        return;
      }

      const slot = dayState.slots[slotIndex];
      const built = buildPayload(slot.type, currentLang, data.history);
      data = { ...data, history: built.history };

      const nextDayState: EngagementDayState = {
        ...dayState,
        shownSlotIndexes: [...dayState.shownSlotIndexes, slotIndex],
      };
      data = { ...data, dayState: nextDayState };
      writeStorage(data);

      if (built.payload) {
        setCurrentPayload(built.payload);
      } else {
        scheduleNext();
      }
    } finally {
      checkingRef.current = false;
    }
  }, [currentLang, scheduleNext, setCurrentPayload]);

  useEffect(() => {
    tryShowDueRef.current = tryShowDue;
  }, [tryShowDue]);

  const dismiss = useCallback(() => {
    setCurrentPayload(null);
    scheduleNext();
  }, [scheduleNext, setCurrentPayload]);

  const dismissForDay = useCallback(() => {
    const data = ensureDayState(readStorage(), Date.now());
    if (data.dayState) {
      data.dayState = { ...data.dayState, dismissedDay: true };
      writeStorage(data);
    }
    setCurrentPayload(null);
    clearTimer();
  }, [clearTimer, setCurrentPayload]);

  useEffect(() => {
    scheduleNext();
    const interval = window.setInterval(() => {
      if (!payloadRef.current) tryShowDueRef.current();
    }, CHECK_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === 'visible' && !payloadRef.current) {
        tryShowDueRef.current();
      } else {
        scheduleNext();
      }
    };
    const onFocus = () => {
      if (!payloadRef.current) tryShowDueRef.current();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === ENGAGEMENT_STORAGE_KEY) scheduleNext();
    };

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);
    return () => {
      clearTimer();
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
    };
  }, [clearTimer, scheduleNext]);

  useEffect(() => {
    if (!payloadRef.current) {
      const id = window.setTimeout(() => tryShowDueRef.current(), 1200);
      return () => window.clearTimeout(id);
    }
  }, [location.pathname]);

  return { payload, dismiss, dismissForDay };
}
