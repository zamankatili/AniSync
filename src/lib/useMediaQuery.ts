import { useState, useEffect } from 'react';

/** matchMedia ile boolean döndüren kanca — SSR/ortamsız güvenlidir. */
export function useMediaQuery(query: string): boolean {
  const get = () => (typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState<boolean>(get);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const m = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    if (typeof m.addEventListener === 'function') {
      m.addEventListener('change', handler);
      return () => m.removeEventListener('change', handler);
    }
    // Legacy Safari
    m.addListener(handler);
    return () => m.removeListener(handler);
  }, [query]);

  return matches;
}

/** 1024px ve üzeri = masaüstü "köşe" yerleşimi; altında yüzen panel. */
export const useIsLargeScreen = () => useMediaQuery('(min-width: 1024px)');
