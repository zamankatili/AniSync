const RTF_CACHE = new Map<string, Intl.RelativeTimeFormat>();

function getFormatter(lang: string): Intl.RelativeTimeFormat {
  const key = lang.slice(0, 2) || 'tr';
  const cached = RTF_CACHE.get(key);
  if (cached) return cached;
  const rtf = new Intl.RelativeTimeFormat(key, { numeric: 'auto' });
  RTF_CACHE.set(key, rtf);
  return rtf;
}

/** ISO tarihini "3 saat önce" gibi yerelleştirilmiş göreli formata çevirir. */
export function formatRelativeTime(iso: string | undefined, lang = 'tr'): string {
  if (!iso) return '';
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return '';
  const diffSeconds = Math.round((time - Date.now()) / 1000);
  const abs = Math.abs(diffSeconds);
  const rtf = getFormatter(lang);
  if (abs < 60) return rtf.format(Math.trunc(diffSeconds), 'second');
  if (abs < 3600) return rtf.format(Math.trunc(diffSeconds / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.trunc(diffSeconds / 3600), 'hour');
  if (abs < 86400 * 30) return rtf.format(Math.trunc(diffSeconds / 86400), 'day');
  if (abs < 86400 * 365) return rtf.format(Math.trunc(diffSeconds / (86400 * 30)), 'month');
  return rtf.format(Math.trunc(diffSeconds / (86400 * 365)), 'year');
}

/** ISO tarihini kullanıcı dilinde kısa biçime çevirir (kart altındaki "12 Kas 2026" vb.). */
export function formatShortDate(iso: string | undefined, lang = 'tr'): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(lang.slice(0, 2) || 'tr', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
}
