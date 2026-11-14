import { describe, expect, it } from 'vitest';
import {
  buildOgHtml,
  DEFAULT_OG_IMAGE,
  escapeHtml,
  OG_FALLBACK_COPY,
  OG_LOCALES,
  pickLocaleFromHeader,
  safeImageUrl,
  truncateText,
} from './ogMeta';
import { canonicalPathFor, ogInputForMedia, parseOgTarget, renderOgPage } from './ogRender';
import type { UnifiedMedia } from '../types/unified';

const media = (overrides: Partial<UnifiedMedia> = {}): UnifiedMedia => ({
  id: 'anilist:16498',
  source: 'anilist',
  sourceId: '16498',
  kind: 'anime',
  title: { romaji: 'Shingeki no Kyojin', english: 'Attack on Titan', native: '進撃の巨人' },
  displayTitle: 'Attack on Titan',
  synopsis: '<b>İnsanlık</b> devlere karşı savaşıyor.<br>Duvarın ötesi bilinmiyor.',
  cover: { large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498.jpg' },
  genres: ['Action'],
  tags: [],
  studios: [],
  relations: [],
  externalLinks: [],
  updatedAt: 0,
  externalIds: { anilist: 16498, mal: 16498 },
  ...overrides,
});

describe('escapeHtml', () => {
  it('escapes every HTML-significant character', () => {
    expect(escapeHtml(`<script>alert("x & y")</script> it's`)).toBe(
      '&lt;script&gt;alert(&quot;x &amp; y&quot;)&lt;/script&gt; it&#39;s',
    );
  });
});

describe('truncateText', () => {
  it('collapses whitespace and trims', () => {
    expect(truncateText('  a   b\n\n c  ', 40)).toBe('a b c');
  });

  it('keeps short text untouched', () => {
    expect(truncateText('Attack on Titan', 40)).toBe('Attack on Titan');
  });

  it('cuts on a word boundary with an ellipsis', () => {
    const result = truncateText('one two three four five six seven', 20);
    expect(result.endsWith('…')).toBe(true);
    expect(Array.from(result).length).toBeLessThanOrEqual(20);
    expect(result).not.toContain('  ');
  });

  it('never splits surrogate pairs', () => {
    const result = truncateText('🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬', 5);
    expect(result).toBe('🎬🎬🎬🎬…');
  });

  it('returns empty for empty input', () => {
    expect(truncateText(undefined, 10)).toBe('');
    expect(truncateText(null, 10)).toBe('');
  });
});

describe('safeImageUrl', () => {
  it('keeps https images', () => {
    expect(safeImageUrl('https://cdn.example/x.jpg')).toBe('https://cdn.example/x.jpg');
  });

  it('falls back for http, javascript: and garbage', () => {
    expect(safeImageUrl('http://cdn.example/x.jpg')).toBe(DEFAULT_OG_IMAGE);
    expect(safeImageUrl('javascript:alert(1)')).toBe(DEFAULT_OG_IMAGE);
    expect(safeImageUrl('not a url')).toBe(DEFAULT_OG_IMAGE);
    expect(safeImageUrl(null)).toBe(DEFAULT_OG_IMAGE);
  });
});

describe('pickLocaleFromHeader', () => {
  it('picks the first supported language', () => {
    expect(pickLocaleFromHeader('tr-TR,tr;q=0.9,en;q=0.8')).toBe('tr');
    expect(pickLocaleFromHeader('de-DE,de;q=0.9,fr;q=0.8')).toBe('fr');
    expect(pickLocaleFromHeader('ja-JP')).toBe('ja');
    expect(pickLocaleFromHeader(['en-US', 'tr'])).toBe('en');
  });

  it('defaults to Turkish when nothing matches', () => {
    expect(pickLocaleFromHeader(undefined)).toBe('tr');
    expect(pickLocaleFromHeader('de-DE,ru;q=0.9')).toBe('tr');
  });
});

describe('buildOgHtml', () => {
  const html = buildOgHtml({
    title: 'Attack on Titan <script>alert(1)</script>',
    description: 'İnsanlık devlere karşı savaşıyor & "duvarlar" yıkılıyor.',
    canonicalUrl: 'https://anisync-tau.vercel.app/anime/16498',
    imageUrl: 'https://cdn.example/cover.jpg',
    locale: 'tr',
    type: 'video.tv_show',
  });

  it('writes the canonical URL once and never redirects', () => {
    expect(html).toContain('<link rel="canonical" href="https://anisync-tau.vercel.app/anime/16498" />');
    expect(html).not.toContain('http-equiv="refresh"');
    expect(html).not.toContain('location.replace');
  });

  it('escapes injected markup', () => {
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('&amp; &quot;duvarlar&quot;');
  });

  it('emits OpenGraph, Twitter and locale tags', () => {
    expect(html).toContain('<meta property="og:type" content="video.tv_show" />');
    expect(html).toContain('<meta property="og:locale" content="tr_TR" />');
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />');
    expect(html).toContain('<meta property="og:image" content="https://cdn.example/cover.jpg" />');
    for (const [code, locale] of Object.entries(OG_LOCALES)) {
      if (code === 'tr') continue;
      expect(html).toContain(`<meta property="og:locale:alternate" content="${locale}" />`);
    }
  });

  it('is noindex by default so bot HTML never ranks', () => {
    expect(html).toContain('<meta name="robots" content="noindex, nofollow" />');
    const indexable = buildOgHtml({
      title: 'x',
      description: 'y',
      canonicalUrl: 'https://example.test/x',
      noindex: false,
    });
    expect(indexable).not.toContain('name="robots"');
  });

  it('rejects unknown og:type values instead of reflecting them', () => {
    const unsafe = buildOgHtml({
      title: 'x',
      description: 'y',
      canonicalUrl: 'https://example.test/x',
      type: '"><script>alert(1)</script>' as never,
    });
    expect(unsafe).toContain('<meta property="og:type" content="website" />');
    expect(unsafe).not.toContain('<script>alert(1)</script>');
  });

  it('falls back to the generic image when none is given', () => {
    const generic = buildOgHtml({ title: 'x', description: 'y', canonicalUrl: 'https://example.test/x' });
    expect(generic).toContain(`<meta property="og:image" content="${DEFAULT_OG_IMAGE}" />`);
  });
});

describe('parseOgTarget', () => {
  it('resolves MAL ids for /anime/:id', () => {
    expect(parseOgTarget('anime', '16498')).toEqual({ lookup: 'mal', malId: 16498 });
  });

  it('rejects malformed or non-positive ids', () => {
    for (const id of ['', '0', '-1', 'abc', '12.5', '1e3', '9999999999']) {
      expect(parseOgTarget('anime', id), id).toBeNull();
    }
  });

  it('resolves anilist and jikan ids for /media/:id', () => {
    expect(parseOgTarget('media', 'anilist:154587')).toEqual({ lookup: 'anilist', anilistId: 154587 });
    expect(parseOgTarget('media', 'jikan:anime:16498')).toEqual({
      lookup: 'jikan',
      mediaKind: 'anime',
      malId: 16498,
    });
    expect(parseOgTarget('media', 'jikan:manga:13')).toEqual({
      lookup: 'jikan',
      mediaKind: 'manga',
      malId: 13,
    });
  });

  it('rejects unknown sources and kinds', () => {
    for (const id of ['steam:123', 'jikan:game:1', 'anilist:', 'anilist:0', 'openlibrary:OL1W', 'x']) {
      expect(parseOgTarget('media', id), id).toBeNull();
    }
    expect(parseOgTarget('unknown', '16498')).toBeNull();
  });
});

describe('canonicalPathFor', () => {
  it('derives the same canonical the SPA renders', () => {
    expect(canonicalPathFor({ lookup: 'mal', malId: 16498 }, 'anime', '16498')).toBe('/anime/16498');
    expect(canonicalPathFor({ lookup: 'anilist', anilistId: 154587 }, 'media', 'anilist:154587')).toBe(
      '/media/anilist:154587',
    );
    expect(canonicalPathFor({ lookup: 'jikan', mediaKind: 'manga', malId: 13 }, 'media', 'jikan:manga:13')).toBe(
      '/media/jikan:manga:13',
    );
  });

  it('sanitizes unresolvable ids down to the home page', () => {
    expect(canonicalPathFor(null, 'anime', '<script>')).toBe('/');
    expect(canonicalPathFor(null, 'media', 'anilist:1"><script>')).toBe('/');
  });
});

describe('ogInputForMedia', () => {
  it('builds localized title, stripped synopsis and large cover', () => {
    const input = ogInputForMedia(media(), 'tr', 'https://anisync-tau.vercel.app/anime/16498');
    expect(input.title).toBe('Attack on Titan - AniSync');
    expect(input.description).toBe('İnsanlık devlere karşı savaşıyor. Duvarın ötesi bilinmiyor.');
    expect(input.imageUrl).toBe('https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498.jpg');
    expect(input.type).toBe('video.tv_show');
    expect(input.locale).toBe('tr');
  });

  it('maps manga/novel to book and games to video.other', () => {
    expect(ogInputForMedia(media({ kind: 'manga' }), 'en', 'https://x.test/m/1').type).toBe('book');
    expect(ogInputForMedia(media({ kind: 'light_novel' }), 'en', 'https://x.test/m/1').type).toBe('book');
    expect(ogInputForMedia(media({ kind: 'game' }), 'en', 'https://x.test/m/1').type).toBe('video.other');
  });

  it('uses the Japanese native title for ja and falls back when synopsis is empty', () => {
    const input = ogInputForMedia(media({ synopsis: '' }), 'ja', 'https://x.test/anime/16498');
    expect(input.title).toBe('進撃の巨人 - AniSync');
    expect(input.description).toBe('進撃の巨人 · AniSync');
  });
});

describe('renderOgPage fallback', () => {
  it('returns a generic noindex card for an unresolvable id without network access', async () => {
    const result = await renderOgPage('anime', 'not-an-id', 'en');
    expect(result.found).toBe(false);
    expect(result.canonicalUrl).toBe('https://anisync-tau.vercel.app/');
    expect(result.html).toContain(OG_FALLBACK_COPY.en.title);
    expect(result.html).toContain('name="robots" content="noindex, nofollow"');
  });

  it('localizes the fallback card', async () => {
    const result = await renderOgPage('unknown', 'x', 'ja');
    expect(result.html).toContain(OG_FALLBACK_COPY.ja.description);
    expect(result.html).toContain('<html lang="ja">');
  });
});
