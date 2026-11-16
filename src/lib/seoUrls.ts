import { SITE_BASE_URL } from './seoRoutes';

/**
 * Dil URL'lerinin tek kaynağı.
 *
 * AniSync tek SPA'dır; dil, path yerine `?lang=` parametresiyle taşınır
 * (`/`, `/?lang=tr`, `/?lang=ja`...). Bu dosya üç tüketiciye hizmet eder:
 * `SEOManager`, `PageMeta` ve `server.ts` (sitemap üretimi).
 *
 * Kurallar:
 * - Canonical **kendi URL'idir**: desteklenen `?lang=` korunur, diğer query
 *   parametreleri atılır. Aksi hâlde `?lang=ja` sayfası kendini `/` olarak
 *   canonicalize eder ve Google hreflang kümesini yok sayar.
 * - hreflang kümesi karşılıklıdır: 4 dil + `x-default` (dilsiz `/`).
 * - `?lang=` gerçekten okunmalıdır — `i18n.ts` içindeki
 *   `detection.lookupQuerystring` bu dosyayla aynı parametreyi kullanır.
 */

export const SUPPORTED_LANGS = ['tr', 'en', 'ja', 'fr'] as const;
export type SeoLang = (typeof SUPPORTED_LANGS)[number];

export interface HreflangLink {
  hreflang: SeoLang | 'x-default';
  href: string;
}

/** Path'i tek biçime getirir: başta `/`, sonda `/` yok (kök hariç), query yok. */
export function normalizePath(pathname: string): string {
  const pathOnly = (pathname || '/').split(/[?#]/)[0] || '/';
  const withLeading = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`;
  if (withLeading === '/') return '/';
  return withLeading.replace(/\/+$/, '') || '/';
}

/** Desteklenen dili döndürür; değilse `null`. */
export function toSeoLang(value: string | null | undefined): SeoLang | null {
  if (!value) return null;
  const base = value.split('-')[0].toLowerCase();
  return (SUPPORTED_LANGS as readonly string[]).includes(base) ? (base as SeoLang) : null;
}

/** `?lang=xx` içinden geçerli dili çıkarır. */
export function langFromSearch(search: string | null | undefined): SeoLang | null {
  if (!search) return null;
  try {
    return toSeoLang(new URLSearchParams(search).get('lang'));
  } catch {
    return null;
  }
}

/**
 * Canonical URL: path + (varsa geçerli `lang`). `lang` verilirse açıkça yazılır.
 * Böylece her dil URL'i kendine canonical olur (hreflang'in ön koşulu).
 */
export function canonicalUrl(
  pathname: string,
  options: { search?: string; lang?: SeoLang | null; origin?: string } = {},
): string {
  const origin = (options.origin || SITE_BASE_URL).replace(/\/+$/, '');
  const [rawPath, rawSearch = ''] = (pathname || '/').split('#')[0].split('?');
  const search = options.search ?? (rawSearch ? `?${rawSearch}` : '');
  const path = normalizePath(rawPath);
  const lang = options.lang ?? langFromSearch(search);
  return lang ? `${origin}${path}?lang=${lang}` : `${origin}${path}`;
}

/** Aynı path için 4 dil + x-default bağlantıları (karşılıklı küme). */
export function hreflangLinks(pathname: string, origin: string = SITE_BASE_URL): HreflangLink[] {
  const base = origin.replace(/\/+$/, '');
  const path = normalizePath(pathname);
  return [
    ...SUPPORTED_LANGS.map((lang) => ({
      hreflang: lang,
      href: `${base}${path}?lang=${lang}`,
    })),
    { hreflang: 'x-default' as const, href: `${base}${path}` },
  ];
}

/** Sitemap `<url>` bloğu içine giren `<xhtml:link>` etiketleri. */
export function sitemapAlternateLines(pathname: string, origin: string = SITE_BASE_URL): string[] {
  return hreflangLinks(pathname, origin).map(
    (link) => `    <xhtml:link rel="alternate" hreflang="${link.hreflang}" href="${link.href}" />`,
  );
}

const HREFLANG_SELECTOR = 'link[rel="alternate"][hreflang]';

/**
 * `index.html`'deki statik kök hreflang etiketlerini geçerli rotaya göre
 * yeniden yazar. Neden Helmet değil: statik etiketler JS'siz crawler'lar için
 * kalmalı, Helmet ise onları kaldıramaz — ikisi birlikte her rotada 10 etiket
 * (5 yanlış + 5 doğru) üretiyordu.
 */
export function syncHreflangTags(doc: Document, pathname: string, origin: string): void {
  const head = doc.head;
  if (!head) return;
  const links = hreflangLinks(pathname, origin);
  const existing = Array.from(head.querySelectorAll<HTMLLinkElement>(HREFLANG_SELECTOR));

  links.forEach((link, index) => {
    let el = existing[index];
    if (!el) {
      el = doc.createElement('link');
      el.setAttribute('rel', 'alternate');
      head.appendChild(el);
    }
    el.setAttribute('hreflang', link.hreflang);
    el.setAttribute('href', link.href);
  });

  existing.slice(links.length).forEach((el) => el.remove());
}
