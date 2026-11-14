/**
 * Bot önizleme köprüsü: istek parametrelerini medya kaydına çözer ve
 * `ogMeta` ile HTML üretir.
 *
 * Bu modül DOM'a ve tarayıcıya özgü hiçbir şey import etmez; hem Vercel
 * fonksiyonu (`api/og/[kind]/[id].ts`) hem yerel Express sunucusu
 * (`server.ts`) aynı kodu kullanır. `unified.ts` bilinçli olarak import
 * edilmez: `steam.ts` üzerinden `@capacitor/core` çeker ve Node
 * fonksiyonunda patlar.
 */

import { getAniListMedia, getAniListMediaByMalId } from './api/anilist';
import { getJikanMedia } from './api/jikan';
import { SITE_BASE_URL } from './seoRoutes';
import {
  buildOgHtml,
  OG_FALLBACK_COPY,
  OG_SITE_NAME,
  truncateText,
  type OgMetaInput,
  type OgType,
} from './ogMeta';
import { pickTitle, stripHtml, type MediaKind, type UnifiedMedia } from '../types/unified';
import type { Lang4 } from '../data/universePaths';

export type OgTarget =
  | { lookup: 'mal'; malId: number }
  | { lookup: 'anilist'; anilistId: number }
  | { lookup: 'jikan'; mediaKind: 'anime' | 'manga'; malId: number };

const INTEGER_ID = /^[1-9]\d{0,8}$/;

/**
 * `/anime/:id` (MAL kimliği) ve `/media/:id` (`anilist:123`,
 * `jikan:anime:123`) adreslerini çözümleme hedefine çevirir.
 */
export function parseOgTarget(kind: string, rawId: string): OgTarget | null {
  const id = String(rawId ?? '').trim();
  if (!id) return null;

  if (kind === 'anime') {
    return INTEGER_ID.test(id) ? { lookup: 'mal', malId: Number(id) } : null;
  }

  if (kind === 'media') {
    const [source, ...rest] = id.split(':');
    if (source === 'anilist' && rest.length === 1 && INTEGER_ID.test(rest[0])) {
      return { lookup: 'anilist', anilistId: Number(rest[0]) };
    }
    if (source === 'jikan' && rest.length === 2) {
      const [mediaKind, sourceId] = rest;
      if ((mediaKind === 'anime' || mediaKind === 'manga') && INTEGER_ID.test(sourceId)) {
        return { lookup: 'jikan', mediaKind, malId: Number(sourceId) };
      }
    }
  }

  return null;
}

/** Bir kaydı yükler; her kaynak kendi hatasını yutar, sıradaki denenir. */
async function loadOgMedia(target: OgTarget): Promise<UnifiedMedia | null> {
  const safe = async (load: () => Promise<UnifiedMedia | null>): Promise<UnifiedMedia | null> => {
    try {
      return await load();
    } catch {
      return null;
    }
  };

  if (target.lookup === 'anilist') {
    return safe(() => getAniListMedia(target.anilistId));
  }
  if (target.lookup === 'jikan') {
    return safe(() => getJikanMedia(target.mediaKind, target.malId));
  }
  return (
    (await safe(() => getAniListMediaByMalId(target.malId))) ??
    (await safe(() => getJikanMedia('anime', target.malId)))
  );
}

/** Sayfa meta'sıyla aynı kanonik yolu üretir. */
export function canonicalPathFor(target: OgTarget | null, kind: string, rawId: string): string {
  if (target) {
    if (target.lookup === 'mal') return `/anime/${target.malId}`;
    if (target.lookup === 'anilist') return `/media/anilist:${target.anilistId}`;
    return `/media/jikan:${target.mediaKind}:${target.malId}`;
  }

  const id = String(rawId ?? '').trim();
  if (kind === 'anime' && INTEGER_ID.test(id)) return `/anime/${id}`;
  if (kind === 'media' && /^[a-z]+:[A-Za-z0-9:_-]{1,80}$/.test(id)) return `/media/${id}`;
  return '/';
}

const KIND_OG_TYPE: Record<MediaKind, OgType> = {
  anime: 'video.tv_show',
  manga: 'book',
  novel: 'book',
  light_novel: 'book',
  game: 'video.other',
};

/** Kayıt bulunduğunda meta girdisini üretir. */
export function ogInputForMedia(
  media: UnifiedMedia,
  locale: Lang4,
  canonicalUrl: string,
): OgMetaInput {
  const localized = pickTitle(media.title, locale);
  const title = localized && localized !== '-' ? localized : media.displayTitle || OG_SITE_NAME;
  const synopsis = truncateText(stripHtml(media.synopsis), 180);

  return {
    title: `${title} - ${OG_SITE_NAME}`,
    description: synopsis || `${title} · ${OG_SITE_NAME}`,
    canonicalUrl,
    imageUrl: media.cover?.large ?? media.cover?.medium ?? media.banner ?? null,
    locale,
    type: KIND_OG_TYPE[media.kind] ?? 'website',
  };
}

export interface OgRenderResult {
  html: string;
  /** Medya gerçekten çözüldü mü? (loglama/başlık için) */
  found: boolean;
  canonicalUrl: string;
}

/**
 * Bot isteğini HTML'e çevirir. Çözümleme başarısız olsa bile 200 döner:
 * ölü bir bağlantının önizlemesi genel AniSync kartı olur.
 */
export async function renderOgPage(
  kind: string,
  rawId: string,
  locale: Lang4,
): Promise<OgRenderResult> {
  const target = parseOgTarget(kind, rawId);
  const canonicalUrl = `${SITE_BASE_URL}${canonicalPathFor(target, kind, rawId)}`;
  const media = target ? await loadOgMedia(target) : null;

  if (!media) {
    const copy = OG_FALLBACK_COPY[locale] ?? OG_FALLBACK_COPY.tr;
    return {
      html: buildOgHtml({
        title: copy.title,
        description: copy.description,
        canonicalUrl,
        locale,
        noindex: true,
      }),
      found: false,
      canonicalUrl,
    };
  }

  return {
    html: buildOgHtml(ogInputForMedia(media, locale, canonicalUrl)),
    found: true,
    canonicalUrl,
  };
}
