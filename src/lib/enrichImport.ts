/**
 * Import akışı: metin → ayrıştırma → AniList zenginleştirme → WatchlistItem.
 *
 * Zenginleştirme "best effort"tur: AniList erişilemezse akış bitmez,
 * yedekteki/MAL kapakları ile devam edilir ve arayüz bunu açıkça belirtir.
 */
import { getAniListByMalIds } from './api/anilist';
import { detectImportSource, parseImportText, toWatchlistItem } from './importList';
import type { WatchlistItem } from '../types';

export interface PreparedImport {
  source: 'mal' | 'anilist';
  items: WatchlistItem[];
  /** AniList'ten kapak/özet/skor alınan kayıt sayısı. */
  enriched: number;
  /** Biçim hatası ya da idMal eksikliği nedeniyle atlanan kayıtlar. */
  skipped: number;
  /** Zenginleştirme denendi ama hiç eşleşme/yanıt alınamadı (ağ hatası gibi). */
  enrichmentFailed: boolean;
}

export async function prepareImportFromText(raw: string): Promise<PreparedImport> {
  const source = detectImportSource(raw);
  if (!source) {
    throw new Error('Desteklenmeyen dosya biçimi. MAL `animelist.xml` veya AniList JSON yedeğini kullanın.');
  }

  const parsed = parseImportText(raw);
  if (parsed.items.length === 0) {
    return { source, items: [], enriched: 0, skipped: parsed.skipped, enrichmentFailed: false };
  }

  const lookup = await getAniListByMalIds(parsed.items.map((item) => item.malId));
  const enriched = lookup.size;

  const items = parsed.items.map((item) => {
    const alt = lookup.get(item.malId);
    return toWatchlistItem(
      item,
      alt
        ? {
            displayTitle: alt.displayTitle,
            title: alt.title,
            synopsis: alt.synopsis,
            averageScore: alt.averageScore,
            episodes: alt.episodes,
            genres: alt.genres,
            seasonYear: alt.seasonYear,
            status: alt.status,
            season: alt.season,
            type: alt.format,
            studios: alt.studios,
            cover: alt.cover,
          }
        : undefined,
    );
  });

  return {
    source,
    items,
    enriched,
    skipped: parsed.skipped,
    enrichmentFailed: enriched === 0 && parsed.items.length > 0,
  };
}
