import { useState, useEffect, useCallback } from 'react';
import i18n from '../i18n';

/**
 * Robust, framework-safe translation hook for AniSync.
 * Avoids any React 19 / Vite multi-chunk context dispatcher issues
 * while ensuring reactive updates whenever the user changes language.
 */
export function useAppTranslation() {
  // Sayacı artır: dil değişimi sessiz (aynı değer) olsa bile yeniden boya
  // (örn. uygulama TR→JA→TR ardışık yaptığında son adım aynı değere düşer).
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const onLanguageChanged = () => {
      setVersion((v) => v + 1);
    };

    i18n.on('languageChanged', onLanguageChanged);
    return () => {
      i18n.off('languageChanged', onLanguageChanged);
    };
  }, []);

  const currentLang = (i18n.language || 'tr').split('-')[0].toLowerCase();

  const t = useCallback((key: string, options?: any): string => {
    try {
      const res = i18n.t(key, options);
      return typeof res === 'string' ? res : (key || '');
    } catch {
      return key;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  return { t, i18n, currentLang };
}

export default useAppTranslation;
