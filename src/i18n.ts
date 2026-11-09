import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { animeLifeSimTranslations } from './i18nAnimeLifeSim';
import { adminTranslations } from './i18nAdmin';

/**
 * Locale kaynakları route-level bölme için dinamik yüklenir:
 * `src/i18n/locales/{tr,en,ja,fr}.ts` — yalnızca algılanan dil + `en` (fallback)
 * başlangıçta indirilir; `languageChanged` ile diğer diller de yüklenir.
 */
const loaders: Record<string, () => Promise<{ default: { translation: Record<string, string> } }>> = {
  tr: () => import('./i18n/locales/tr'),
  en: () => import('./i18n/locales/en'),
  ja: () => import('./i18n/locales/ja'),
  fr: () => import('./i18n/locales/fr'),
};

const baseLang = (lng: string | undefined) => (lng || 'en').split('-')[0].toLowerCase();

/** Yüklü locale taban dilleri (react-i18next late-added namespace'leri otomatik yeniden boyamaz; yeniden tetikleriz) */
const loadedBase = new Set<string>();

async function loadLocale(lng: string) {
  const base = baseLang(lng);
  const loader = loaders[base];
  if (!loader) return;
  if (loadedBase.has(base)) return;
  const mod = await loader();
  const translation = {
    ...mod.default.translation,
    ...(animeLifeSimTranslations as any)[base],
    ...(adminTranslations as any)[base],
  };
  i18n.addResourceBundle(base, 'translation', translation, true, true);
  loadedBase.add(base);
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {},
    fallbackLng: 'en',
    supportedLngs: ['tr', 'en', 'ja', 'fr'],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

const HTML_LANG: Record<string, string> = { tr: 'tr', en: 'en', ja: 'ja', fr: 'fr' };
const syncHtmlLang = (lng?: string) => {
  if (typeof document === 'undefined') return;
  const base = baseLang(lng);
  document.documentElement.lang = HTML_LANG[base] || 'en';
};

// Başlangıç: algılanan dil + en (fallback). Suspense'e güvenmek yerine
// main.tsx ilk render'dan önce bu promise'i bekler.
export const i18nReady = Promise.all([loadLocale(i18n.language), loadLocale('en')]).then(() => {
  syncHtmlLang(i18n.language);
});

i18n.on('languageChanged', (lng) => {
  const base = baseLang(lng);
  const wasLoaded = loadedBase.has(base);
  void loadLocale(lng).then(() => {
    syncHtmlLang(lng);
    // Yeni bundle anlamsal olarak hazır → değişikliği tekrar yayınla ki
    // react-i18next aboneleri yeni kaynakla yeniden boyansın
    // (aksi halde fallback dilinde kalır — kullanıcı JA seçse de EN görür)
    if (!wasLoaded) {
      void i18n.changeLanguage(lng);
    }
  });
});

export default i18n;
