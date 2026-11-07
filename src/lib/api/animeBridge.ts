/**
 * AniList ↔ eski `Anime` modeli köprüsü.
 *
 * Uygulamanın mevcut sayfaları (izleme listesi, detay, kartlar) `Anime`
 * tipiyle çalışıyor. Jikan erişilemediğinde aynı veriyi AniList'ten üretip
 * bu modele çeviriyoruz; böylece eski ekranlar bozulmadan çalışmaya devam eder.
 */

import type { Anime } from '../../types';
import type { UnifiedMedia } from '../../types/unified';
import { getAniListMediaByMalId } from './anilist';

const STATUS_TEXT: Record<string, string> = {
  finished: 'Finished Airing',
  releasing: 'Currently Airing',
  not_yet_released: 'Not yet aired',
  cancelled: 'Cancelled',
  hiatus: 'On Hiatus',
};

const FORMAT_TEXT: Record<string, string> = {
  TV: 'TV',
  TV_SHORT: 'TV Short',
  MOVIE: 'Movie',
  SPECIAL: 'Special',
  OVA: 'OVA',
  ONA: 'ONA',
  MUSIC: 'Music',
};

function toStatusText(status?: string | null): string {
  if (!status) return 'Unknown';
  const key = status.trim().toLowerCase().replace(/[_-]+/g, ' ');
  if (key.includes('not yet')) return STATUS_TEXT.not_yet_released;
  if (key.includes('cancel') || key.includes('discontinu')) return STATUS_TEXT.cancelled;
  if (key.includes('hiatus') || key.includes('pause')) return STATUS_TEXT.hiatus;
  if (key.includes('finish') || key === 'completed') return STATUS_TEXT.finished;
  if (key.includes('releas') || key.includes('airing') || key.includes('publishing')) return STATUS_TEXT.releasing;
  return status;
}

/** `UnifiedMedia` kaydını eski `Anime` modeline dönüştürür. */
export function toLegacyAnime(media: UnifiedMedia, fallbackMalId?: number): Anime {
  const large = media.cover?.large || media.cover?.medium || '';
  const medium = media.cover?.medium || large;

  return {
    mal_id: media.externalIds?.mal ?? fallbackMalId ?? 0,
    title: media.title.romaji || media.displayTitle,
    title_english: media.title.english ?? null,
    images: {
      jpg: { image_url: medium, large_image_url: large },
      webp: { image_url: medium, large_image_url: large },
    },
    synopsis: media.synopsis || '',
    score: typeof media.averageScore === 'number' ? Math.round(media.averageScore) / 10 : null,
    episodes: media.episodes ?? null,
    status: toStatusText(media.status),
    genres: media.genres.map((name, index) => ({ mal_id: index, name })),
    year: media.seasonYear ?? null,
    type: media.format ? FORMAT_TEXT[media.format] || media.format : undefined,
    season: media.season ? media.season.toLowerCase() : undefined,
    studios: media.studios.map((studio) => ({
      mal_id: typeof studio.id === 'number' ? studio.id : 0,
      name: studio.name,
    })),
    trailer:
      media.trailer?.site?.toLowerCase() === 'youtube' && media.trailer.id
        ? {
            youtube_id: media.trailer.id,
            url: `https://www.youtube.com/watch?v=${media.trailer.id}`,
            embed_url: `https://www.youtube.com/embed/${media.trailer.id}`,
          }
        : undefined,
    background: undefined,
  };
}

/** Jikan yedeği: MAL kimliğinden AniList üzerinden anime getirir. */
export async function fetchAnimeFallback(malId: number, signal?: AbortSignal): Promise<Anime | null> {
  try {
    const media = await getAniListMediaByMalId(malId, signal);
    if (!media) return null;
    return toLegacyAnime(media, malId);
  } catch (error) {
    console.warn('[animeBridge] AniList yedek kaynağı da başarısız:', error);
    return null;
  }
}
