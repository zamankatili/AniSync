/**
 * SEO rota haritası — tek kaynak.
 *
 * `SEOManager` bu listeleri kullanır; `seoFiles.test.ts` sitemap/robots ve
 * sayfa meta'larının bu listelerle uyumlu kaldığını doğrular. Yeni bir rota
 * eklerken hem burayı hem `public/sitemap.xml`'i güncelleyin.
 */

/** Kendi `<PageMeta>` bileşenini kullanan dinamik önekler. */
export const SELF_MANAGED_PREFIXES = ['/anime/', '/media/'] as const;

/** Kendi `<PageMeta>` bileşenini kullanan statik rotalar. */
export const SELF_MANAGED_EXACT = [
  '/anime-life-sim',
  '/dle',
  '/arcade',
  '/lore',
  '/text-adventure',
  '/challenge',
  '/scenes',
] as const;

export const SITE_BASE_URL = 'https://anisync-tau.vercel.app';

export interface SitemapRoute {
  path: string;
  lastmod: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: string;
}

/** Arama motorlarına açık, gerçek içerikli rotalar. */
export const PUBLIC_SITEMAP_ROUTES: SitemapRoute[] = [
  { path: '/', lastmod: '2026-11-13', changefreq: 'daily', priority: '1.0' },
  { path: '/discover', lastmod: '2026-11-13', changefreq: 'daily', priority: '0.9' },
  { path: '/calendar', lastmod: '2026-11-13', changefreq: 'daily', priority: '0.8' },
  { path: '/lists', lastmod: '2026-11-13', changefreq: 'weekly', priority: '0.8' },
  { path: '/challenge', lastmod: '2026-11-13', changefreq: 'daily', priority: '0.8' },
  { path: '/anime-life-sim', lastmod: '2026-11-13', changefreq: 'weekly', priority: '0.8' },
  { path: '/arcade', lastmod: '2026-11-13', changefreq: 'weekly', priority: '0.7' },
  { path: '/music-quiz', lastmod: '2026-11-13', changefreq: 'daily', priority: '0.7' },
  { path: '/voice-duel', lastmod: '2026-11-13', changefreq: 'weekly', priority: '0.7' },
  { path: '/dle', lastmod: '2026-11-13', changefreq: 'daily', priority: '0.7' },
  { path: '/lore', lastmod: '2026-11-14', changefreq: 'weekly', priority: '0.6' },
  { path: '/scenes', lastmod: '2026-11-14', changefreq: 'weekly', priority: '0.7' },
  { path: '/text-adventure', lastmod: '2026-11-13', changefreq: 'weekly', priority: '0.7' },
  { path: '/privacy', lastmod: '2026-11-13', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', lastmod: '2026-11-13', changefreq: 'yearly', priority: '0.3' },
  { path: '/guidelines', lastmod: '2026-11-13', changefreq: 'yearly', priority: '0.3' },
];

/** Kişisel/oturum gerektiren sayfalar: sitemap'e girmez, meta'da noindex alır. */
export const NOINDEX_EXACT = [
  '/list',
  '/profile',
  '/watch-party',
  '/grid-maker',
  '/admin',
  '/onboarding',
] as const;

export const NOINDEX_PREFIXES = ['/profile/', '/watch-party/'] as const;

/** Eski/çoğaltılmış adresler — uygulamada kanonik rotaya yönlendirilir. */
export const LEGACY_REDIRECTS: Record<string, string> = {
  '/anisyncdle': '/dle',
  '/polls': '/challenge',
};
