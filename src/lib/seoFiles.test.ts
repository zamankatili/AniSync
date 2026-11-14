import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
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

/**
 * Sosyal botlar JS çalıştırmadığı için `/anime/:id` ve `/media/:id` ham HTML'i
 * genel kart gösteriyordu. Bu testler bot rewrite'larının doğru sırada
 * olduğunu ve arama motoru botlarına dokunmadığını garanti eder.
 */
describe('bot OG preview rewrites', () => {
  const vercel = JSON.parse(read('vercel.json')) as {
    rewrites: Array<{
      source: string;
      destination: string;
      has?: Array<{ type: string; key: string; value: string }>;
    }>;
  };

  const catchAllIndex = vercel.rewrites.findIndex((rule) => rule.source === '/(.*)');

  it('keeps the SPA catch-all last', () => {
    expect(catchAllIndex).toBe(vercel.rewrites.length - 1);
  });

  for (const [route, kind] of [
    ['/anime/:id', 'anime'],
    ['/media/:id', 'media'],
  ] as const) {
    it(`routes social bots on ${route} to the static /api/og function`, () => {
      const index = vercel.rewrites.findIndex((rule) => rule.source === route);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(catchAllIndex);

      const destination = vercel.rewrites[index].destination;
      // Dinamik fonksiyon adları (`api/og/[kind]/[id].ts`) Next.js olmayan
      // projelerde çalışmıyor; parametre query ile taşınmalı.
      expect(destination).toBe(`/api/og?kind=${kind}&id=:id`);

      const agent = vercel.rewrites[index].has?.find(
        (condition) => condition.type === 'header' && condition.key === 'user-agent',
      );
      expect(agent, `${route} must only match crawler user-agents`).toBeTruthy();
      expect(agent!.value).toMatch(/twitterbot/i);
      expect(agent!.value).toMatch(/discordbot/i);
      // Arama motorları JS render eder; onlara farklı HTML servis etmek
      // cloaking tartışmasına girer. Yalnızca önizleme botları hedeflenir.
      expect(agent!.value).not.toMatch(/googlebot|bingbot|yandex|baiduspider/i);
    });
  }
});

/**
 * Vercel, Next.js olmayan projelerde `api/**\/[param].ts` dosyalarını
 * yönlendirmez; istek SPA catch-all'ına düşer (canlıda `/api/games/123`
 * index.html döndürüyordu). Bu test gelecekte aynı tuzağa düşmeyi engeller.
 */
describe('Vercel function routing', () => {
  const vercel = JSON.parse(read('vercel.json')) as {
    rewrites: Array<{ source: string; destination: string }>;
  };

  it('never uses dynamic [param] file names under api/', () => {
    const files = readdirSync(resolve(process.cwd(), 'api'), { recursive: true })
      .map((entry) => String(entry).replace(/\\/g, '/'))
      .filter((entry) => entry.endsWith('.ts'));
    const dynamic = files.filter((file) => /\[[^\]]+\]/.test(file));
    expect(dynamic, `dynamic Vercel function names are not routed: ${dynamic.join(', ')}`).toEqual([]);
  });

  it('routes /api/games/:appid to the static games function', () => {
    const rule = vercel.rewrites.find((entry) => entry.source === '/api/games/:appid(\\d+)');
    expect(rule, 'missing numeric Steam detail rewrite').toBeTruthy();
    expect(rule!.destination).toBe('/api/games/appid?appid=:appid');
    const catchAll = vercel.rewrites.findIndex((entry) => entry.source === '/(.*)');
    expect(vercel.rewrites.indexOf(rule!)).toBeLessThan(catchAll);
  });
});

describe('local server parity', () => {
  const server = read('server.ts');

  it('serves OG previews from the same renderer as the Vercel function', () => {
    expect(server).toContain('/api/og/:kind/:id');
    expect(server).toContain('renderOgPage');
    expect(read('api/og.ts')).toContain('renderOgPage');
  });

  it('generates /sitemap.xml from the shared route map instead of a stale copy', () => {
    expect(server).toContain('PUBLIC_SITEMAP_ROUTES');
    expect(server).not.toContain('/grid-maker');
    expect(server).not.toContain('/watch-party');
    expect(server).toContain('app.get("/sitemap.xml"');
  });
});
