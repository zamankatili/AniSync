/**
 * Birleşik medya modeli (FAZ 1).
 *
 * AniList, Jikan, OpenLibrary, IGDB/RAWG gibi farklı kaynaklardan gelen
 * veriler bu modelde normalize edilir. Arayüz katmanı kaynağı bilmez;
 * yalnızca `UnifiedMedia` ile konuşur.
 */

export type MediaKind = 'anime' | 'manga' | 'novel' | 'light_novel' | 'game';

export type MediaSource = 'anilist' | 'jikan' | 'openlibrary' | 'igdb' | 'rawg' | 'steam';

export type MediaTitleLanguage = 'tr' | 'en' | 'ja' | 'fr';

export interface MediaTitle {
  romaji?: string;
  english?: string;
  native?: string;
  /** Türkçe / Fransızca gibi yerelleştirilmiş başlık (varsa) */
  localized?: Partial<Record<MediaTitleLanguage, string>>;
}

export interface MediaCover {
  small?: string;
  medium?: string;
  large?: string;
  color?: string;
}

export interface MediaStudio {
  id?: number | string;
  name: string;
}

export interface MediaRelation {
  id: string;
  kind: MediaKind;
  relationType: string;
  title: MediaTitle;
  cover?: string;
}

export interface MediaExternalLink {
  site: string;
  url: string;
  type?: string;
}

export interface MediaDate {
  year?: number | null;
  month?: number | null;
  day?: number | null;
}

export interface UnifiedMedia {
  /** Kaynak önekiyle global kimlik: "anilist:154587" */
  id: string;
  source: MediaSource;
  sourceId: string;
  kind: MediaKind;
  title: MediaTitle;
  displayTitle: string;
  synopsis?: string;
  cover?: MediaCover;
  banner?: string;
  format?: string;
  status?: string;
  season?: string;
  seasonYear?: number | null;
  startDate?: MediaDate;
  episodes?: number | null;
  chapters?: number | null;
  volumes?: number | null;
  duration?: number | null;
  /** 0–100 aralığında normalize edilmiş puan */
  averageScore?: number | null;
  popularity?: number | null;
  genres: string[];
  tags: string[];
  studios: MediaStudio[];
  relations: MediaRelation[];
  externalLinks: MediaExternalLink[];
  /** Sunucu güncelleme zamanı (epoch ms). */
  updatedAt: number;
  /** Veri hangi kaynaktan zenginleştirildiyse (ileride kullanılacak). */
  enrichedBy?: MediaSource[];
  /** Fragman bilgisi (varsa). */
  trailer?: {
    id?: string;
    site?: string;
  };
  /**
   * Diğer kaynaklardaki karşılık gelen kimlikler.
   * Örn. AniList kaydı için MyAnimeList kimliği (`mal`) — mevcut anime
   * detay sayfasına köprü kurmak için kullanılır.
   */
  externalIds?: {
    mal?: number;
    anilist?: number;
    openlibrary?: string;
    steam?: string;
  };
}

export interface MediaSearchResult {
  items: UnifiedMedia[];
  page: number;
  hasNextPage: boolean;
  kind: MediaKind;
  source: MediaSource;
}

export interface UnifiedSearchOptions {
  query: string;
  kinds?: MediaKind[];
  page?: number;
  perPage?: number;
  /** Yetişkin içerik filtresi; varsayılan true (gizle). */
  hideAdult?: boolean;
  /** İsteği iptal etmek için (arama kutusu yazarken). */
  signal?: AbortSignal;
}

const KIND_PRIORITY: MediaKind[] = ['anime', 'manga', 'light_novel', 'novel', 'game'];

/** içerik türlerini sabit bir sırada döndürür (arayüzde gruplama için). */
export function sortKinds(kinds: MediaKind[]): MediaKind[] {
  return [...kinds].sort((a, b) => KIND_PRIORITY.indexOf(a) - KIND_PRIORITY.indexOf(b));
}

/** Başlık seçimini kullanıcı diline göre yapar. */
export function pickTitle(title: MediaTitle, language: string): string {
  const code = (language || 'tr').split('-')[0] as MediaTitleLanguage;
  const localized = title.localized?.[code];
  if (localized) return localized;

  if (code === 'ja') {
    return title.native || title.romaji || title.english || '—';
  }
  if (code === 'tr' || code === 'fr') {
    return title.english || title.romaji || title.native || '—';
  }
  return title.english || title.romaji || title.native || '—';
}

/** HTML etiketlerini ve gereksiz boşlukları temizler (AniList açıklamaları HTML döner). */export function stripHtml(input?: string | null): string {
  if (!input) return '';
  return input
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export type MediaStatusKey = 'finished' | 'releasing' | 'not_yet_released' | 'cancelled' | 'hiatus';

/**
 * Farklı kaynakların durum metinlerini ortak anahtara indirger.
 * AniList: FINISHED / RELEASING / NOT_YET_RELEASED / CANCELLED / HIATUS
 * Jikan: "Finished Airing" / "Currently Airing" / "Not yet aired" / "Publishing" / "On Hiatus"
 */
export function normalizeMediaStatus(status?: string | null): MediaStatusKey | null {
  if (!status) return null;
  const value = status.trim().toLowerCase().replace(/[_-]+/g, ' ');

  if (value.includes('not yet') || value.includes('upcoming') || value.includes('tba')) return 'not_yet_released';
  if (value.includes('cancel') || value.includes('discontinu')) return 'cancelled';
  if (value.includes('hiatus') || value.includes('pause')) return 'hiatus';
  if (value.includes('finish') || value === 'completed' || value === 'complete') return 'finished';
  if (value.includes('releas') || value.includes('airing') || value.includes('publishing') || value === 'ongoing') {
    return 'releasing';
  }
  return null;
}
