/**
 * AniList `Media.recommendations` — topluluk önerileri.
 *
 * Her sonuç, animeyi animeye bağlayan gerçek topluluk oylamasıdır (`rating`).
 * Uydurma "eşleşme yüzdesi" ya da küratör görevi gören sabit cümleler kullanılmaz;
 * sonuç boşsa boş dizi döner (dürüst boş durum).
 */
import type { Anime } from '../types';
import { getAniListRecommendationsByMalId } from './api/anilist';
import { toLegacyAnime } from './api/animeBridge';

export interface SimilarRecommendation {
  anime: Anime;
  /** AniList `rating` — topluluğun bu öneriye verdiği gerçek oy. */
  votes: number;
  genres: string[];
}

export async function fetchSimilarRecommendations(malId: number, limit = 6): Promise<SimilarRecommendation[]> {
  try {
    const raw = await getAniListRecommendationsByMalId(malId, Math.max(limit, 12));
    const withMal = raw.filter(
      ({ media }) => typeof media.externalIds?.mal === 'number' && (media.externalIds.mal as number) > 0,
    );
    return withMal.slice(0, limit).map(({ rating, media }) => ({
      anime: toLegacyAnime(media, media.externalIds!.mal as number),
      votes: rating,
      genres: media.genres.slice(0, 3),
    }));
  } catch (error) {
    console.warn('[similarAnime] AniList önerileri alınamadı:', error);
    return [];
  }
}
