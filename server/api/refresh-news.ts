/**
 * Vercel Serverless Function — canlı RSS haber hattını tetikler (Vercel Cron: `vercel.json`).
 * `server.ts`'teki /api/refresh-news ile aynı işi yapar (yerel/Full-stack dağıtımda Express çalışır).
 * Vercel'de /api/* otomatik olarak serverless function olur; yerelde bu dosya kullanılmaz.
 *
 * Güvenlik: `CRON_SECRET` env değişkeni tanımlıysa istek
 * `Authorization: Bearer <CRON_SECRET>` başlığı taşımak zorundadır (Vercel Cron bunu otomatik gönderir).
 */
import { ingestAnimeNews } from '../../src/lib/rssIngest';

export default async function handler(req: any, res: any) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = String(req?.headers?.authorization ?? '');
    if (auth !== `Bearer ${cronSecret}`) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

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
