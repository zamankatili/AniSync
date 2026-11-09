import { describe, it, expect } from 'vitest';
import {
  detectImportSource,
  parseMalXml,
  parseAniListJson,
  parseImportText,
  toWatchlistItem,
} from './importList';

const MAL_XML = `<?xml version="1.0" encoding="UTF-8"?>
<myanimelist>
  <anime>
    <series_animedb_id>20</series_animedb_id>
    <series_title><![CDATA[Code&#32;Geass]]></series_title>
    <series_image>http://cdn.myanimelist.net/images/anime/20/39431l.jpg</series_image>
    <series_episodes>25</series_episodes>
    <my_watched_episodes>12</my_watched_episodes>
    <my_score>8</my_score>
    <my_status>1</my_status>
  </anime>
  <anime>
    <series_animedb_id>5114</series_animedb_id>
    <series_title><![CDATA[Fullmetal Alchemist: Brotherhood]]></series_title>
    <series_episodes>64</series_episodes>
    <my_watched_episodes>64</my_watched_episodes>
    <my_score>10</my_score>
    <my_status>2</my_status>
  </anime>
  <anime>
    <series_animedb_id></series_animedb_id>
    <series_title></series_title>
    <my_status>3</my_status>
  </anime>
</myanimelist>`;

const ANILIST_JSON = JSON.stringify({
  lists: [
    {
      name: 'Watching',
      entries: [
        {
          status: 'CURRENT',
          score: 75,
          progress: 12,
          media: {
            id: 44511,
            idMal: 16498,
            type: 'ANIME',
            episodes: 25,
            format: 'TV',
            season: 'SPRING',
            seasonYear: 2013,
            averageScore: 78,
            genres: ['Action', 'Drama'],
            title: { romaji: 'Shingeki no Kyojin', english: 'Attack on Titan', native: '進撃の巨人' },
            coverImage: { large: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498.jpg' },
            studios: { nodes: [{ id: 1, name: 'Wit Studio' }] },
            status: 'FINISHED',
            description: 'Humans fight titans.',
          },
        },
        {
          status: 'PLANNING',
          score: 0,
          progress: 0,
          media: {
            id: 151807,
            idMal: null, // MAL kimliği yok → atlanmalı
            type: 'ANIME',
            title: { romaji: 'No Mal' }
          },
        },
        {
          status: 'COMPLETED',
          score: 100,
          progress: 13,
          media: {
            id: 327,
            idMal: 1535,
            type: 'MANGA', // listeye girmez
            title: { romaji: 'Death Note Manga' }
          },
        },
      ],
    },
  ],
});

describe('detectImportSource', () => {
  it('MAL XML ve AniList JSON ayırır', () => {
    expect(detectImportSource(MAL_XML)).toBe('mal');
    expect(detectImportSource(ANILIST_JSON)).toBe('anilist');
  });

  it('rastgele metni reddeder', () => {
    expect(detectImportSource('merhaba dünya')).toBeNull();
    expect(detectImportSource('{"anime": []}')).toBeNull();
    expect(detectImportSource('')).toBeNull();
  });
});

describe('parseMalXml', () => {
  const result = parseMalXml(MAL_XML);

  it('geçersiz kaydı atlar, geçerlileri korur', () => {
    expect(result.items).toHaveLength(2);
    expect(result.skipped).toBe(1);
  });

  it('CDATA ve varlıkları çözer', () => {
    expect(result.items[0].title).toBe('Code Geass');
  });

  it('http kapakları https yapar', () => {
    expect(result.items[0].coverUrl).toBe('https://cdn.myanimelist.net/images/anime/20/39431l.jpg');
  });

  it('durum basamaklarını eşler', () => {
    expect(result.items.find((i) => i.malId === 20)?.watchStatus).toBe('watching');
    expect(result.items.find((i) => i.malId === 5114)?.watchStatus).toBe('completed');
  });

  it('yinelenen kayıtları birleştirir (en ileri durum + en yüksek ilerleme)', () => {
    const xml = `<?xml version="1.0"?><myanimelist>
<anime><series_animedb_id>20</series_animedb_id><series_title>X</series_title><my_watched_episodes>5</my_watched_episodes><my_status>1</my_status></anime>
<anime><series_animedb_id>20</series_animedb_id><series_title>X</series_title><my_watched_episodes>23</my_watched_episodes><my_status>2</my_status></anime>
</myanimelist>`;
    const parsed = parseMalXml(xml);
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0].episodesWatched).toBe(23);
    expect(parsed.items[0].watchStatus).toBe('completed');
  });
});

describe('parseAniListJson', () => {
  const result = parseAniListJson(ANILIST_JSON);

  it('yalnızca idMal + ANIME olan kayıtları alır', () => {
    expect(result.items.map((i) => i.malId)).toContain(16498);
    expect(result.items.map((i) => i.malId)).not.toContain(1535); // manga atlandı
    expect(result.items.map((i) => i.malId)).not.toContain(0); // idMal yok atlandı
    expect(result.skipped).toBe(2);
  });

  it('0-100 puanı 0-10a indirger', () => {
    const attack = result.items.find((i) => i.malId === 16498);
    expect(attack?.userScore).toBeCloseTo(7.5, 5);
    expect(attack?.score).toBeCloseTo(7.8, 5);
  });

  it('tür, stüdyo ve sezon bilgisini taşır', () => {
    const attack = result.items.find((i) => i.malId === 16498);
    expect(attack?.genres.map((g) => g.name)).toContain('Action');
    expect(attack?.studios.map((s) => s.name)).toContain('Wit Studio');
    expect(attack?.season).toBe('Spring');
    expect(attack?.type).toBe('TV');
    expect(attack?.synopsis).toBe('Humans fight titans.');
  });
});

describe('toWatchlistItem', () => {
  const parsed = parseAniListJson(ANILIST_JSON);
  const item = parsed.items[0];

  it('yalnızca MAL verisiyle kapak uydurmaz; boş kalır', () => {
    const bare = toWatchlistItem({ ...item, coverUrl: undefined, synopsis: undefined });
    expect(bare.anime.images.jpg.image_url).toBe('');
  });

  it('zenginleştirmeyi kullanır', () => {
    const enriched = toWatchlistItem(item, {
      displayTitle: 'Attack on Titan',
      title: { english: 'Attack on Titan', romaji: 'Shingeki no Kyojin' },
      synopsis: 'Real synopsis.',
      averageScore: 85,
      episodes: 25,
      genres: ['Action', 'Drama'],
      seasonYear: 2013,
      status: 'FINISHED',
      cover: { large: 'https://s4.anilist.co/anilistcdn/cover.jpg', medium: 'https://s4.anilist.co/anilistcdn/cover-small.jpg' },
    });
    expect(enriched.anime.score).toBeCloseTo(8.5, 5);
    expect(enriched.anime.synopsis).toBe('Real synopsis.');
    expect(enriched.anime.genres.map((g) => g.name)).toEqual(['Action', 'Drama']);
    expect(enriched.anime.status).toBe('Finished Airing');
    expect(enriched.anime.images.jpg.image_url).toBe('https://s4.anilist.co/anilistcdn/cover.jpg');
  });

  it('parseImportText kaynak seçer ve hatalıysa atar', () => {
    const fromMal = parseImportText(MAL_XML);
    expect(fromMal.source).toBe('mal');
    expect(fromMal.items).toHaveLength(2);
    expect(() => parseImportText('rastgele')).toThrow();
  });
});
