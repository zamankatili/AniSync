/**
 * UnifiedMedia (AniList) → Anime dönüştürücü.
 *
 * İzleme listesi Jikan-uyumlu `Anime` modeli üzerine kuruludur; AniList'ten gelen
 * kayıtların izleme listesinde doğru görünmesi için burada çevrilir. Uydurma
 * varsayılan yoktur; bilinmeyenler boş kalır. MAL kimliği yoksa `mal_id = 0`
 * olur ve kayıt izleme listesine eklenmeden önce geçerliliği kontrol edilmelidir.
 */
import type { Anime } from '../types';
import type { UnifiedMedia } from '../types/unified';
import { stableNameId } from './importList';

const ANILIST_STATUS: Record<string, string> = {
  FINISHED: 'Finished Airing',
  RELEASING: 'Currently Airing',
  NOT_YET_RELEASED: 'Not Yet Released',
  CANCELLED: 'Cancelled',
  HIATUS: 'On Hiatus',
};

const ANILIST_FORMAT: Record<string, string> = {
  TV: 'TV',
  TV_SHORT: 'TV Short',
  MOVIE: 'Movie',
  SPECIAL: 'Special',
  OVA: 'OVA',
  ONA: 'ONA',
  MUSIC: 'Music',
};

const ANILIST_SEASON: Record<string, string> = {
  WINTER: 'Winter',
  SPRING: 'Spring',
  SUMMER: 'Summer',
  FALL: 'Fall',
};

export function unifiedToAnime(media: UnifiedMedia): Anime {
  const title =
    media.title.english ||
    media.title.romaji ||
    media.title.native ||
    media.displayTitle ||
    '—';

  const cover = {
    jpg: {
      image_url: media.cover?.large ?? media.cover?.medium ?? '',
      large_image_url: media.cover?.large ?? media.cover?.medium ?? '',
    },
    webp: {
      image_url: media.cover?.large ?? media.cover?.medium ?? '',
      large_image_url: media.cover?.large ?? media.cover?.medium ?? '',
    },
  };

  return {
    mal_id: media.externalIds?.mal ?? 0,
    anilist_id:
      media.externalIds?.anilist ??
      (Number.isFinite(Number(media.sourceId)) && Number(media.sourceId) > 0 ? Number(media.sourceId) : undefined),
    title,
    title_english: media.title.english ?? null,
    images: cover,
    synopsis: media.synopsis ?? '',
    score: media.averageScore != null ? Math.round(media.averageScore) / 10 : null,
    episodes: media.episodes ?? null,
    status: media.status ? ANILIST_STATUS[media.status] ?? media.status : '',
    genres: media.genres.map((name) => ({ mal_id: stableNameId(name), name })),
    year: media.seasonYear ?? null,
    type: media.format ? ANILIST_FORMAT[media.format] ?? media.format : undefined,
    season: media.season ? ANILIST_SEASON[media.season] ?? media.season : undefined,
    studios: media.studios.map((studio) => ({ mal_id: stableNameId(studio.name), name: studio.name })),
  };
}

/** Kayıt izleme listesine güvenle eklenebilir mi? (MAL kimliği var mı?) */
export const isListable = (media: UnifiedMedia): boolean =>
  typeof media.externalIds?.mal === 'number' && media.externalIds.mal > 0;
