import { useCallback, useState } from 'react';

const STORAGE_PREFIX = 'anisync.arcade.';

/**
 * Arcade rekorlarını localStorage'da tutar.
 * `lowerIsBetter` memory gibi "az hamle daha iyi" oyunlar için kullanılır.
 */
export function useHighScore(key: string, lowerIsBetter = false) {
  const storageKey = `${STORAGE_PREFIX}${key}`;

  const [best, setBest] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? Number(raw) : 0;
      return Number.isFinite(parsed) ? parsed : 0;
    } catch {
      return 0;
    }
  });

  const submit = useCallback(
    (value: number) => {
      if (!Number.isFinite(value) || value <= 0) return;
      setBest((prev) => {
        const next = lowerIsBetter ? (prev === 0 || value < prev ? value : prev) : Math.max(prev, value);
        try {
          localStorage.setItem(storageKey, String(next));
        } catch {
          // Depolama kapalıysa sessizce devam et.
        }
        return next;
      });
    },
    [lowerIsBetter, storageKey]
  );

  return [best, submit] as const;
}
