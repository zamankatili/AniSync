import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const ANN_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Anime News Network</title>
<item><title>Studio announces new project</title><link>https://ann.example/1</link><pubDate>${new Date().toUTCString()}</pubDate><description>First news summary.</description></item>
<item><title>Second ANN item about anime season</title><link>https://ann.example/2</link><pubDate>${new Date(Date.now() - 86400000 * 2).toUTCString()}</pubDate><description>Second summary.</description></item>
</channel></rss>`;

const GOOGLE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Google News</title>
<item><title>Studio announces new project</title><link>https://news.google.example/1</link><pubDate>${new Date().toUTCString()}</pubDate><description>Duplicate first news.</description></item>
<item><title>Fragman yayında: yeni fragman teaser</title><link>https://news.google.example/9</link><pubDate>${new Date(Date.now() - 86400000 * 45).toUTCString()}</pubDate><description>too old to show</description></item>
<item><title>Brand new anime season airing soon</title><link>https://news.google.example/3</link><pubDate>${new Date(Date.now() - 3600000).toUTCString()}</pubDate><description>Season airing summary for the hot item.</description></item>
</channel></rss>`;

const atomFeed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<entry><title>Atom entry works</title><link href="https://atom.example/1" /><published>${new Date().toISOString()}</published><summary>Atom summary here.</summary></entry>
</feed>`;

const loadIngest = async () => {
  vi.resetModules();
  return import('./rssIngest');
};

describe('ingestAnimeNews', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn(async (url: string) => {
      if (url.includes('animenewsnetwork.com')) {
        return { ok: true, text: async () => ANN_RSS } as any;
      }
      if (url.includes('news.google.com')) {
        return { ok: true, text: async () => GOOGLE_RSS } as any;
      }
      if (url.includes('atom.example')) {
        return { ok: true, text: async () => atomFeed } as any;
      }
      return { ok: true, text: async () => atomFeed } as any;
    });
    vi.stubGlobal('fetch', fetchMock as any);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('iki kaynaktan haber birleştirir, yeniden eskiye sıralar, ilk 3\'ü isHot yapar', async () => {
    const { ingestAnimeNews } = await loadIngest();
    const result = await ingestAnimeNews(true);
    expect(result.stale).toBe(false);
    expect(result.items.length).toBeGreaterThan(0);
    // En yeni tarih ilk sırada
    const times = result.items.map(i => new Date(i.publishedAt).getTime());
    expect([...times].sort((a, b) => b - a)).toEqual(times);
    expect(result.items.filter(i => i.isHot).length).toBe(Math.min(3, result.items.length));
  });

  it('30 günden eski haberler elenir', async () => {
    const { ingestAnimeNews } = await loadIngest();
    const result = await ingestAnimeNews(true);
    // 45 günlük "Fragman yayında" item'ı GOOGLE_RSS içinde var
    expect(result.items.find(i => i.title.includes('Fragman'))).toBeUndefined();
  });

  it('aynı başlık farklı kaynakta gelse de tekilleştirilir', async () => {
    const { ingestAnimeNews } = await loadIngest();
    const result = await ingestAnimeNews(true);
    const titles = result.items.map(i => i.title.toLowerCase().slice(0, 60));
    expect(new Set(titles).size).toBe(titles.length);
    // ANN + Google ikisinde de geçen "Studio announces new project" yalnızca 1 kez
    expect(result.items.filter(i => i.title === 'Studio announces new project').length).toBe(1);
  });

  it('tüm kaynaklar düşerse bayat=true ve items boş döner (cache yokken)', async () => {
    fetchMock.mockReset();
    fetchMock.mockImplementation(async () => { throw new Error('network down'); });
    const { ingestAnimeNews } = await loadIngest();
    const result = await ingestAnimeNews(true);
    expect(result.stale).toBe(true);
    expect(result.items).toEqual([]);
  });

  it('15 dk cache içinde forceRefresh=false yeniden çekmez', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-09T12:00:00Z'));
    const { ingestAnimeNews } = await loadIngest();
    await ingestAnimeNews(true);
    const callsAfterFirst = fetchMock.mock.calls.length;
    await ingestAnimeNews(false);
    expect(fetchMock.mock.calls.length).toBe(callsAfterFirst);

    // 20 dakika sonra cache ölür
    vi.setSystemTime(new Date('2026-11-09T12:20:00Z'));
    await ingestAnimeNews(false);
    expect(fetchMock.mock.calls.length).toBeGreaterThan(callsAfterFirst);
  });

  it('kategori sınıflandırması çalışır (fragman → FRAGMAN)', async () => {
    fetchMock.mockReset();
    const freshItem = `<?xml version="1.0"?><rss version="2.0"><channel><title>X</title>
<item><title>official trailer released</title><link>https://a.example/t</link><pubDate>${new Date().toUTCString()}</pubDate><description>d</description></item>
</channel></rss>`;
    fetchMock.mockImplementation(async () => ({ ok: true, text: async () => freshItem } as any));
    const { ingestAnimeNews } = await loadIngest();
    const result = await ingestAnimeNews(true);
    expect(result.items[0]?.category).toBe('FRAGMAN');
  });
});
