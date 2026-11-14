/**
 * Vercel Serverless Function — sosyal bot önizleme HTML'i.
 *
 * Neden statik dosya adı: bu proje Next.js değil; Vercel, `api/[...]/[id].ts`
 * gibi iç içe dinamik fonksiyon adlarını yönlendirmiyor ve istek SPA
 * catch-all'ına düşüyor (`/api/games/123` canlıda bunu doğruladı). Bu yüzden
 * tek dosya `/api/og` olarak durur; parametreler `vercel.json` rewrite'ından
 * query olarak gelir:
 *   /anime/:id   → /api/og?kind=anime&id=:id
 *   /media/:id   → /api/og?kind=media&id=:id
 *
 * Çıktı meta-only HTML'dir; aynı URL'nin tarayıcı sürümü SPA olarak kalır.
 * Yanlış önbelleklenirse bot HTML'i gerçek kullanıcıya servis edileceği
 * için `no-store` + `Vary` zorunludur.
 */
import { pickLocaleFromHeader } from '../src/lib/ogMeta';
import { renderOgPage } from '../src/lib/ogRender';

/** Query yoksa yol tabanlı çağrıyı da kabul et (`/api/og/anime/16498`). */
function readParams(req: any): { kind: string; id: string } {
  const query = req?.query ?? {};
  let kind = String(query.kind ?? '').toLowerCase();
  let id = String(query.id ?? '');

  if (!kind || !id) {
    const pathOnly = String(req?.url ?? '').split('?')[0];
    const parts = pathOnly.split('/').filter(Boolean);
    if (parts[0] === 'api' && parts[1] === 'og' && parts.length >= 4) {
      if (!kind) kind = decodeURIComponent(parts[2]).toLowerCase();
      if (!id) id = decodeURIComponent(parts.slice(3).join('/'));
    }
  }

  return { kind, id };
}

export default async function handler(req: any, res: any) {
  const { kind, id } = readParams(req);
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
    return res
      .status(200)
      .send(
        '<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>AniSync</title></head><body></body></html>',
      );
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Vary', 'User-Agent, Accept-Language');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('X-Og-Fallback', result.found ? '0' : '1');
  return res.status(200).send(result.html);
}
