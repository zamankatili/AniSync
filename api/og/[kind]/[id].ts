/**
 * Vercel Serverless Function — sosyal bot önizleme HTML'i.
 *
 * `vercel.json` bot user-agent'larını buraya yönlendirir:
 *   /anime/:id        → /api/og/anime/:id
 *   /media/:id        → /api/og/media/:id
 *
 * Çıktı meta-only HTML'dir; aynı URL'nin tarayıcı sürümü SPA olarak kalır.
 * Yanlış önbelleklenirse bot HTML'i gerçek kullanıcıya servis edileceği
 * için `no-store` + `Vary` zorunludur.
 */
import { pickLocaleFromHeader } from '../../../src/lib/ogMeta';
import { renderOgPage } from '../../../src/lib/ogRender';

export default async function handler(req: any, res: any) {
  const kind = String(req?.query?.kind ?? '').toLowerCase();
  const id = String(req?.query?.id ?? '');
  const locale = pickLocaleFromHeader(req?.headers?.['accept-language']);

  let result: Awaited<ReturnType<typeof renderOgPage>>;
  try {
    result = await renderOgPage(kind, id, locale);
  } catch {
    // renderOgPage kendi hatalarını yutar; buraya yalnızca beklenmedik
    // bir hata düşer. Yine de botlara boş yanıt vermeyelim.
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    return res.status(200).send('<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>AniSync</title></head><body></body></html>');
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Vary', 'User-Agent, Accept-Language');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('X-Og-Fallback', result.found ? '0' : '1');
  return res.status(200).send(result.html);
}
