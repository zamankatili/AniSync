import { describe, expect, it } from 'vitest';
import {
  SUPPORTED_LANGS,
  canonicalUrl,
  hreflangLinks,
  langFromSearch,
  normalizePath,
  sitemapAlternateLines,
  toSeoLang,
} from './seoUrls';
import { SITE_BASE_URL } from './seoRoutes';

const ORIGIN = 'https://example.test';

describe('seoUrls — path ve dil normalizasyonu', () => {
  it('normalizes trailing slashes but keeps the root', () => {
    expect(normalizePath('/')).toBe('/');
    expect(normalizePath('')).toBe('/');
    expect(normalizePath('discover')).toBe('/discover');
    expect(normalizePath('/discover///')).toBe('/discover');
    expect(normalizePath('/discover?lang=ja')).toBe('/discover');
    expect(normalizePath('/discover#top')).toBe('/discover');
  });

  it('accepts only the four supported languages', () => {
    for (const lang of SUPPORTED_LANGS) expect(toSeoLang(lang)).toBe(lang);
    expect(toSeoLang('TR')).toBe('tr');
    expect(toSeoLang('ja-JP')).toBe('ja');
    expect(toSeoLang('de')).toBeNull();
    expect(toSeoLang('')).toBeNull();
    expect(toSeoLang(null)).toBeNull();
  });

  it('reads ?lang= and ignores other query parameters', () => {
    expect(langFromSearch('?lang=ja')).toBe('ja');
    expect(langFromSearch('?utm_source=x&lang=fr')).toBe('fr');
    expect(langFromSearch('?lang=de')).toBeNull();
    expect(langFromSearch('?lng=ja')).toBeNull(); // eski/yanlış parametre sessizce kabul edilmemeli
    expect(langFromSearch('')).toBeNull();
    expect(langFromSearch(null)).toBeNull();
  });
});

describe('seoUrls — canonical', () => {
  it('keeps a supported ?lang= so every language URL is self-canonical', () => {
    expect(canonicalUrl('/dle', { search: '?lang=tr', origin: ORIGIN })).toBe(`${ORIGIN}/dle?lang=tr`);
    expect(canonicalUrl('/dle', { lang: 'ja', origin: ORIGIN })).toBe(`${ORIGIN}/dle?lang=ja`);
  });

  it('drops unsupported or unrelated query parameters', () => {
    expect(canonicalUrl('/dle', { search: '?lang=de', origin: ORIGIN })).toBe(`${ORIGIN}/dle`);
    expect(canonicalUrl('/dle', { search: '?utm_source=newsletter', origin: ORIGIN })).toBe(`${ORIGIN}/dle`);
    expect(canonicalUrl('/discover?lang=fr&q=x', { origin: ORIGIN })).toBe(`${ORIGIN}/discover?lang=fr`);
  });

  it('defaults to the production base URL', () => {
    expect(canonicalUrl('/')).toBe(`${SITE_BASE_URL}/`);
  });
});

describe('seoUrls — hreflang kümesi', () => {
  it('returns four languages plus x-default', () => {
    const links = hreflangLinks('/calendar', ORIGIN);
    expect(links.map((l) => l.hreflang)).toEqual([...SUPPORTED_LANGS, 'x-default']);
  });

  it('is reciprocal: every alternate is its own canonical', () => {
    for (const link of hreflangLinks('/calendar?utm=1', ORIGIN)) {
      const url = new URL(link.href);
      const own = canonicalUrl(url.pathname, { search: url.search, origin: url.origin });
      expect(own, `${link.hreflang} must be self-canonical`).toBe(link.href);
    }
  });

  it('points x-default at the language-free path', () => {
    const xDefault = hreflangLinks('/', ORIGIN).find((l) => l.hreflang === 'x-default');
    expect(xDefault?.href).toBe(`${ORIGIN}/`);
  });

  it('renders sitemap xhtml alternates', () => {
    const lines = sitemapAlternateLines('/lore', ORIGIN);
    expect(lines).toHaveLength(5);
    expect(lines.join('\n')).toContain('rel="alternate"');
    expect(lines.join('\n')).toContain(`href="${ORIGIN}/lore?lang=tr"`);
    expect(lines.join('\n')).toContain(`hreflang="x-default" href="${ORIGIN}/lore"`);
  });
});
