import type { Media, MediaType, ShelfEntry } from './types';

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return '';
  const diff = Date.now() - then;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'az önce';
  if (min < 60) return `${min} dk önce`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün önce`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} hafta önce`;
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
}

export function greeting(date = new Date()): { text: string; line: string } {
  const h = date.getHours();
  if (h < 6) return { text: 'İyi geceler', line: 'Uyumayanlar kulübüne hoş geldin.' };
  if (h < 11) return { text: 'Günaydın', line: 'Çay demlendi, gün yeni başlıyor.' };
  if (h < 17) return { text: 'İyi günler', line: 'Öğleden sonra molası tam zamanı.' };
  if (h < 21) return { text: 'İyi akşamlar', line: 'Lambalar yandı, mekân ısındı.' };
  return { text: 'İyi geceler', line: 'Gece vardiyası başlasın.' };
}

export function todayLabel(date = new Date()): string {
  return date.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function score10(score?: number | null): string {
  if (score == null) return '—';
  return (score / 10).toFixed(1).replace('.', ',');
}

export function compactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.', ',')}B`;
  return String(n);
}

export function unitPhrase(media: Media, count: number): string {
  if (media.type === 'game') return media.unitLabel === 'saat' ? `${count} saat` : `${count} bölüm`;
  return `${count} ${media.unitLabel}`;
}

export function progressPercent(entry: ShelfEntry): number {
  const total = entry.media.totalUnits;
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.round((entry.progress / total) * 100));
}

export function stripHtml(input?: string): string {
  if (!input) return '';
  return input
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '…')
    .trim();
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase('tr-TR') ?? '')
    .join('');
}

export const TYPE_UNIT: Record<MediaType, string> = {
  anime: 'bölüm',
  manga: 'bölüm',
  novel: 'sayfa',
  game: 'saat',
};
