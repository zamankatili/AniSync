/**
 * Vercel Serverless Function — Steam arama proxy'si.
 * Tarayıcıdan doğrudan Steam'e istek CORS'a takıldığı için `/api/games/search`
 * uç noktası gerekir. Yerelde `server.ts` aynı işi yapar.
 */
import { enforceRateLimit, RATE_LIMITS } from '../../../src/lib/rateLimit';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const SUPPORTED_LANGS = ['tr', 'en', 'ja', 'fr'];

export default async function handler(req: any, res: any) {
  if (!(await enforceRateLimit(req, res, RATE_LIMITS['games-search']))) return;

  const query = String(req?.query?.q ?? '').trim();
  if (!query) {
    return res.status(200).json({ items: [], total: 0 });
  }

  const requestedLang = String(req?.query?.lang ?? 'en');
  const lang = SUPPORTED_LANGS.includes(requestedLang) ? requestedLang : 'en';

  try {
    const response = await fetch(
      `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=${lang}&cc=US`,
      { headers: { 'User-Agent': UA, Accept: 'application/json' } },
    );

    if (!response.ok) {
      throw new Error(`Steam ${response.status}`);
    }

    const data: any = await response.json();
    const items = (data?.items ?? []).map((item: any) => ({
      id: String(item.id),
      name: item.name,
      image: item.tiny_image ?? null,
      metascore: item.metascore ? Number(item.metascore) : null,
      price: item.price ?? null,
      platforms: item.platforms ?? {},
    }));

    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
    return res.status(200).json({ items, total: data?.total ?? items.length });
  } catch (error: any) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({
      items: [],
      total: 0,
      error: 'steam_unavailable',
      message: String(error?.message ?? error),
    });
  }
}
