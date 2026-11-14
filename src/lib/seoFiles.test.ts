import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  NOINDEX_EXACT,
  PUBLIC_SITEMAP_ROUTES,
  SELF_MANAGED_EXACT,
  SITE_BASE_URL,
} from './seoRoutes';

const read = (relative: string) => readFileSync(resolve(process.cwd(), relative), 'utf8');

/**
 * SEO dosyaları ile rota haritasının birbirinden kopmasını engeller:
 * yeni sayfa eklenip sitemap/meta unutulursa test kırmızı olur.
 */
describe('SEO route map', () => {
  const sitemap = read('public/sitemap.xml');
  const robots = read('public/robots.txt');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

  it('serves every public route exactly once in the sitemap', () => {
    const expected = PUBLIC_SITEMAP_ROUTES.map((route) => `${SITE_BASE_URL}${route.path}`);
    expect(locs.sort()).toEqual([...expected].sort());
    expect(new Set(locs).size).toBe(locs.length);
  });

  it('keeps sitemap lastmod in sync with the route map', () => {
    const lastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
    const expected = PUBLIC_SITEMAP_ROUTES.map((route) => route.lastmod);
    expect(new Set(lastmods)).toEqual(new Set(expected));
  });

  it('never lists private or legacy routes in the sitemap', () => {
    for (const route of NOINDEX_EXACT) {
      expect(locs.some((loc) => loc === `${SITE_BASE_URL}${route}`)).toBe(false);
    }
    expect(locs.some((loc) => loc.endsWith('/polls'))).toBe(false);
    expect(locs.some((loc) => loc.endsWith('/anisyncdle'))).toBe(false);
  });

  it('robots.txt allows public content and blocks only private surfaces', () => {
    expect(robots).toContain('Allow: /');
    expect(robots).not.toMatch(/^Disallow: \/lists$/m);
    expect(robots).not.toMatch(/^Disallow: \/profile$/m);
    expect(robots).toContain('Disallow: /profile$');
    expect(robots).toContain('Allow: /profile/');
    for (const path of ['/list', '/watch-party', '/grid-maker', '/admin', '/onboarding', '/api/']) {
      expect(robots).toContain(`Disallow: ${path}`);
    }
    expect(robots).toContain(`Sitemap: ${SITE_BASE_URL}/sitemap.xml`);
  });

  it('every self-managed route actually renders PageMeta', () => {
    const pages: Record<string, string> = {
      '/anime-life-sim': 'src/pages/AnimeLifeSim.tsx',
      '/dle': 'src/pages/AniSyncDle.tsx',
      '/arcade': 'src/pages/Arcade.tsx',
      '/lore': 'src/pages/FanLore.tsx',
      '/text-adventure': 'src/pages/TextAdventure.tsx',
      '/challenge': 'src/pages/WeeklyChallengePage.tsx',
      '/anime/': 'src/pages/AnimeDetail.tsx',
      '/media/': 'src/pages/MediaDetail.tsx',
    };

    for (const route of SELF_MANAGED_EXACT) {
      expect(pages[route], `missing page mapping for ${route}`).toBeTruthy();
    }

    for (const [route, file] of Object.entries(pages)) {
      expect(read(file), `${file} must render <PageMeta> for ${route}`).toContain('<PageMeta');
      expect(read(file), `${file} must not render a second <Helmet>`).not.toContain('<Helmet>');
    }
  });
});
