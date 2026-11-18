import type { AmbientAccent } from './season';

/**
 * Ambians vurgularının (kuş, cırcır, rüzgâr, kar sessizliği) zamanlaması.
 *
 * Ürün kuralı: doğa sesi **seyrek** olmalı. Dakikada bir çalan bir kuş, ambiyans
 * değil bildirim gürültüsü olur. Bu yüzden taban aralıklar 15 / 27 / 45 dakika.
 *
 * Neden üç değer, dört vurgu? Kışın gündüz "hush" ve gece "wind" aynı sakin
 * ölçeği paylaşır; kışın en uzun aralık kullanılır ki soğuk/sessiz hissi
 * bozulmasın. İlkbahar en sık (kuşlar), yaz orta (cırcır), sonbahar en seyrek
 * (rüzgâr).
 */
export const ACCENT_GAP_MINUTES: Record<AmbientAccent, number> = {
  birds: 15,
  crickets: 27,
  wind: 45,
  hush: 45,
};

/**
 * Aralığa uygulanan sapma oranı (±%20).
 *
 * Tam saat gibi tıklayan bir ritim "canlı" hissi vermez; hafif sapma doğal
 * dağılım sağlar. Sapma deterministik test edilebilsin diye `random` enjekte
 * edilir (varsayılan `Math.random`).
 */
export const ACCENT_JITTER_RATIO = 0.2;

/** Bir vurgunun taban aralığı (ms). */
export const accentGapMs = (accent: AmbientAccent): number =>
  ACCENT_GAP_MINUTES[accent] * 60_000;

/**
 * Sapmalı sonraki aralık. `random() === 0.5` tam taban değeri döndürür.
 */
export const jitteredGapMs = (
  accent: AmbientAccent,
  random: () => number = Math.random,
): number => {
  const base = accentGapMs(accent);
  const spread = base * ACCENT_JITTER_RATIO;
  const sample = Math.min(1, Math.max(0, random()));
  return Math.round(base - spread + sample * spread * 2);
};

export interface AccentClock {
  /** Hangi vurgu planlandı. Profil değişince saat sıfırlanır. */
  accent: AmbientAccent;
  /** Bir sonraki vurgunun zaman damgası (ms). */
  nextAt: number;
}

export const createAccentClock = (
  accent: AmbientAccent,
  now: number,
  random: () => number = Math.random,
): AccentClock => ({
  accent,
  nextAt: now + jitteredGapMs(accent, random),
});

/**
 * Vurgu çaldıktan sonra saati ilerletir.
 *
 * - Profil (mevsim/faz) değiştiyse eski birikim taşınmaz; yeni vurgu için tam
 *   aralık başlar. Böylece "kıştan ilkbahara geçince anında kuş" olmaz.
 * - Sekme uykuya daldıysa `firedAt` planlanan `nextAt`'ten çok sonra olabilir.
 *   Bu durumda kaçırılan vurgular **toplu hâlde patlatılmaz**; saat ileri
 *   sıçratılır. Aksi hâlde kullanıcı sekmeye döndüğünde ses yağmuru duyardı.
 */
export const advanceAccentClock = (
  previous: AccentClock,
  accent: AmbientAccent,
  firedAt: number,
  random: () => number = Math.random,
): AccentClock => {
  if (previous.accent !== accent) {
    return createAccentClock(accent, firedAt, random);
  }

  const base = accentGapMs(accent);
  let nextAt = previous.nextAt + jitteredGapMs(accent, random);

  if (nextAt <= firedAt) {
    const missed = Math.floor((firedAt - nextAt) / base) + 1;
    nextAt += missed * base;
  }

  return { accent, nextAt };
};

/** `setTimeout` için güvenli bekleme: negatif/sıfır değer üretmez. */
export const msUntilAccent = (clock: AccentClock, now: number): number =>
  Math.max(0, clock.nextAt - now);

/**
 * Kontrol panelinde gösterilecek "kaç dakikada bir" değeri.
 * Sapma gösterilmez; kullanıcıya taban aralık söylenir.
 */
export const accentCadenceMinutes = (accent: AmbientAccent): number =>
  ACCENT_GAP_MINUTES[accent];
