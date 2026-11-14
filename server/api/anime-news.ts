/**
 * Vercel Serverless Function — canlı anime haber akışı (okuma uç noktası).
 *
 * Vercel'de `/api/*` otomatik serverless olur; bu dosya olmadığı için
 * istemci `/api/anime-news` çağrısında index.html alıyor ve haberler
 * "sezon takvimi" kartlarına düşüyordu. Bu uç nokta `rssIngest` hattını
 * (ANN + Google News) sunar; CDN'de 15 dk önbelleklenir.
 */
import { ingestAnimeNews } from '../../src/lib/rssIngest';

export default async function handler(req: any, res: any) {
  const forceRefresh = String(req?.query?.refresh ?? '') === 'true';

  try {
    const result = await ingestAnimeNews(forceRefresh);
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=900, stale-while-revalidate=1800',
    );
    res.status(200).json({
      news: result.items,
      source: result.stale ? 'Önbellek (bayat)' : 'Canlı RSS (ANN / Google News)',
      isGrounded: !result.stale,
      stale: result.stale,
      cached: result.cached,
      fetchedAt: result.fetchedAt,
    });
  } catch (err: any) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({
      news: [],
      source: 'Haber akışı alınamadı',
      isGrounded: false,
      stale: true,
      fetchedAt: new Date().toISOString(),
      error: String(err?.message ?? err),
    });
  }
}
