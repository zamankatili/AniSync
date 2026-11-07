/**
 * AI çeviri önbelleği.
 *
 * Aynı metni aynı dile tekrar çevirmek günlük AI kredisi harcar.
 * Sonuçları tarayıcıda tutarak gereksiz istekleri engelliyoruz.
 */
const PREFIX = 'anisync.tr.';
const MAX_ENTRIES = 120;

const hash = (value: string): string => {
  let result = 5381;
  for (let i = 0; i < value.length; i += 1) {
    result = ((result << 5) + result + value.charCodeAt(i)) | 0;
  }
  return (result >>> 0).toString(36);
};

const keyFor = (text: string, targetLang: string) => `${PREFIX}${targetLang}.${hash(text)}.${text.length}`;

export function getCachedTranslation(text: string, targetLang: string): string | null {
  if (!text) return null;
  try {
    return localStorage.getItem(keyFor(text, targetLang));
  } catch {
    return null;
  }
}

export function setCachedTranslation(text: string, targetLang: string, translation: string): void {
  if (!text || !translation) return;
  try {
    // Depolama şişmesini engelle: eski kayıtları temizle.
    const keys = Object.keys(localStorage).filter((key) => key.startsWith(PREFIX));
    if (keys.length >= MAX_ENTRIES) {
      keys.slice(0, Math.ceil(keys.length / 3)).forEach((key) => localStorage.removeItem(key));
    }
    localStorage.setItem(keyFor(text, targetLang), translation);
  } catch {
    // Kota doluysa sessizce devam et.
  }
}

/** Test / temizlik için tüm çeviri kayıtlarını siler. */
export function clearTranslationCache(): void {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // yoksay
  }
}
