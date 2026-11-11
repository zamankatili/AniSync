/**
 * Medya kayıtları için güvenli detay yolu üretir.
 *
 * AniList kayıtlarının bir kısmında MAL kimliği yoktur (`idMal: null`).
 * Bu durumda `/anime/0` gibi ölü bağlantı üretmek yerine birleşik medya
 * detayına (`/media/anilist:<id>`) yönlendiriyoruz. Hiçbir kimlik yoksa
 * `null` döner ve çağıran taraf bağlantıyı gizlemelidir.
 */

export interface AnimeLinkLike {
  mal_id?: number | null;
  anilist_id?: number | null;
}

export function animeDetailPath(anime: AnimeLinkLike): string | null {
  const malId = Number(anime.mal_id);
  if (Number.isFinite(malId) && malId > 0) return `/anime/${malId}`;

  const anilistId = Number(anime.anilist_id);
  if (Number.isFinite(anilistId) && anilistId > 0) return `/media/anilist:${anilistId}`;

  return null;
}

/** UnifiedMedia.id zaten `anilist:123` biçimindedir. */
export function unifiedDetailPath(id: string | null | undefined): string | null {
  const trimmed = (id ?? '').trim();
  return trimmed ? `/media/${encodeURIComponent(trimmed)}` : null;
}
