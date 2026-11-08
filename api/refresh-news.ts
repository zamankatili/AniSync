/**
 * Vercel Serverless Function — canlı RSS haber hattını tetikler (Vercel Cron: `vercel.json`).
 * `server.ts`'teki /api/refresh-news ile aynı işi yapar (yerel/Full-stack dağıtımda Express çalışır).
 * Vercel'de /api/* otomatik olarak serverless function olur; yerelde bu dosya kullanılmaz.
 */
import { ingestAnimeNews } from '../src/lib/rssIngest';

export default async function handler(_req: any, res: any) {
  try {
    const result = await ingestAnimeNews(true);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      news: result.items,
      source: result.stale ? 'Önbellek (bayat)' : 'Canlı RSS (ANN / Google News)',
      isGrounded: !result.stale,
      stale: result.stale,
      fetchedAt: result.fetchedAt,
      refreshedAt: result.fetchedAt,
    });
  } catch (err: any) {
    res.status(500).json({ news: [], error: String(err?.message ?? err) });
  }
}
