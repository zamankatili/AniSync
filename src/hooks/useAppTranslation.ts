import { useState, useEffect, useCallback } from 'react';
import i18n from '../i18n';

/**
 * Robust, framework-safe translation hook for AniSync.
 * Avoids any React 19 / Vite multi-chunk context dispatcher issues
 * while ensuring reactive updates whenever the user changes language.
 */
export function useAppTranslation() {
  const [currentLang, setCurrentLang] = useState(i18n.language || 'tr');

  useEffect(() => {
    const onLanguageChanged = (lng: string) => {
      setCurrentLang(lng);
    };

    i18n.on('languageChanged', onLanguageChanged);
    return () => {
      i18n.off('languageChanged', onLanguageChanged);
    };
  }, []);

  const t = useCallback((key: string, options?: any): string => {
    try {
      const res = i18n.t(key, options);
      return typeof res === 'string' ? res : (key || '');
    } catch {
      return key;
    }
  }, [currentLang]);

  return { t, i18n, currentLang };
}

export default useAppTranslation;
