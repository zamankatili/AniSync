/**
 * Vercel Serverless Function — Steam oyun detay proxy'si.
 * Yerelde `server.ts` aynı işi yapar.
 *
 * Not: dosya adı bilinçli olarak statik (`appid.ts`). Next.js olmayan
 * projelerde Vercel `api/games/[appid].ts` gibi dinamik fonksiyon adlarını
 * yönlendirmiyor; `/api/games/:appid` isteği `vercel.json` rewrite'ı ile
 * buraya `?appid=` olarak gelir.
 */
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

export default async function handler(req: any, res: any) {
  const appid = String(req?.query?.appid ?? req?.query?.id ?? '').replace(/\D/g, '');
  if (!appid) {
    return res.status(400).json({ error: 'invalid_appid' });
  }

  try {
    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appid}&l=english&cc=US`,
      { headers: { 'User-Agent': UA, Accept: 'application/json' } },
    );

    if (!response.ok) {
      throw new Error(`Steam ${response.status}`);
    }

    const data: any = await response.json();
    const entry = data?.[appid];
    if (!entry?.success || !entry.data) {
      return res.status(404).json({ error: 'not_found' });
    }

    const game = entry.data;
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    return res.status(200).json({
      appid,
      name: game.name,
      type: game.type,
      shortDescription: game.short_description ?? null,
      headerImage: game.header_image ?? null,
      capsuleImage: game.capsule_image ?? null,
      developers: game.developers ?? [],
      publishers: game.publishers ?? [],
      genres: (game.genres ?? []).map((genre: any) => genre.description),
      releaseDate: game.release_date?.date ?? null,
      metacritic: game.metacritic?.score ?? null,
      website: game.website ?? null,
      background: game.background_raw ?? game.background ?? null,
    });
  } catch (error: any) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({
      error: 'steam_unavailable',
      message: String(error?.message ?? error),
    });
  }
}
