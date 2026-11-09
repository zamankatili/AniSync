/**
 * Günlük oyunlar için tek tarih kaynağı.
 *
 * ANISYNCDLE gibi "günlük" içerikler kullanıcının yerel gününe göre
 * sıfırlanmalı. Türkiye'de yaz saati uygulanmadığı için Europe/Istanbul
 * (UTC+3) sabittir; UTC kullanmak gece 03:00'te gün değiştiriyordu.
 */
const TR_TIME_ZONE = 'Europe/Istanbul';

/** TR takvimine göre YYYY-MM-DD. */
export function getDailyDateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TR_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Verilen TR gününden bir önceki günün anahtarı. */
export function getPreviousDateKey(dateKey: string): string {
  const base = new Date(`${dateKey}T12:00:00Z`);
  base.setUTCDate(base.getUTCDate() - 1);
  return base.toISOString().slice(0, 10);
}

/** İki TR gün anahtarı arasındaki gün farkı (b - a). */
export function diffDateKeys(a: string, b: string): number {
  const first = Date.parse(`${a}T12:00:00Z`);
  const second = Date.parse(`${b}T12:00:00Z`);
  if (Number.isNaN(first) || Number.isNaN(second)) return Number.NaN;
  return Math.round((second - first) / (24 * 60 * 60 * 1000));
}
