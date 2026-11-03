import { describe, expect, it } from 'vitest';
import { mapAniList } from './anilist';

const base = {
  id: 28999,
  idMal: 38000,
  type: 'ANIME' as const,
  title: { romaji: 'Kimetsu no Yaiba', english: 'Demon Slayer', native: '鬼滅の刃' },
  coverImage: { extraLarge: 'https://s4.anilist.co/xl.jpg', large: 'https://s4.anilist.co/large.jpg', color: '#1e90ff' },
  bannerImage: 'https://s4.anilist.co/banner.jpg',
  description: '<p>Bir <i>demon</i> avcısının hikâyesi.</p>',
  genres: ['Action', 'Supernatural'],
  averageScore: 84,
  seasonYear: 2019,
  format: 'TV',
  episodes: 26,
  chapters: null,
  volumes: null,
  duration: 24,
  status: 'FINISHED',
  siteUrl: 'https://anilist.co/anime/28999',
};

describe('AniList eşleme', () => {
  it('kaynak önekli id ve İngilizce başlık üretir', () => {
    const m = mapAniList(base);
    expect(m.id).toBe('anime:28999');
    expect(m.source).toBe('anilist');
    expect(m.type).toBe('anime');
    expect(m.title).toBe('Demon Slayer');
    expect(m.subtitle).toBe('Kimetsu no Yaiba');
    expect(m.cover).toBe('https://s4.anilist.co/large.jpg');
    expect(m.externalUrl).toBe('https://anilist.co/anime/28999');
    expect(m.accent).toBe('#1e90ff');
  });

  it('HTML açıklamasını düz metne çevirir', () => {
    expect(mapAniList(base).description).toBe('Bir demon avcısının hikâyesi.');
  });

  it("bölüm sayısını ve format etiketini meta'ya koyar", () => {
    const m = mapAniList(base);
    expect(m.totalUnits).toBe(26);
    expect(m.unitLabel).toBe('bölüm');
    expect(m.meta).toBe('26 bölüm · 2019 · TV');
    expect(m.status).toBe('Tamamlandı');
  });

  it("manga kayıtlarını bölüm değil basar, cilt fallback'ını korur", () => {
    const m = mapAniList({
      ...base,
      id: 11,
      type: 'MANGA',
      episodes: null,
      chapters: 183,
      volumes: 22,
      format: 'MANGA',
      title: { romaji: 'Berserk', english: '', native: 'ベルセルク' },
    });
    expect(m.id).toBe('manga:11');
    expect(m.type).toBe('manga');
    expect(m.title).toBe('Berserk');
    expect(m.subtitle).toBeUndefined();
    expect(m.totalUnits).toBe(183);
  });

  it('cilt-only mangada toplam birim cilt sayısına düşer', () => {
    const m = mapAniList({ ...base, type: 'MANGA', episodes: null, chapters: null, volumes: 22 });
    expect(m.totalUnits).toBe(22);
  });

  it('isimsiz kaydı düşürmez', () => {
    const m = mapAniList({
      ...base,
      title: { romaji: '', english: '', native: '' },
      coverImage: { extraLarge: '', large: '', color: null },
      bannerImage: null,
      averageScore: null,
      seasonYear: null,
      status: null,
      format: null,
    });
    expect(m.title).toBe('İsimsiz');
    expect(m.score).toBeNull();
    expect(m.year).toBeNull();
    expect(m.accent).toBeUndefined();
    expect(m.banner).toBeUndefined();
    expect(m.status).toBeNull();
  });

  it('bilinmeyen format ve durum ham değerini korur', () => {
    const m = mapAniList({ ...base, format: 'CONCERT', status: 'SOMETHING_NEW' });
    expect(m.meta).not.toContain('CONCERT');
    expect(m.status).toBe('SOMETHING_NEW');
  });
});
