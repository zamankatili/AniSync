import { describe, expect, it } from 'vitest';
import { detectImportSource, parseAniListJson, parseMalXml } from './import';

const MAL_XML = `<?xml version="1.0" encoding="UTF-8"?>
<myanimelist>
  <anime>
    <series_animedb_id>20</series_animedb_id>
    <series_title><![CDATA[Code Geass: Hangyaku no Lelouch]]></series_title>
    <series_image>http://cdn.myanimelist.net/images/anime/20/39431l.jpg</series_image>
    <series_episodes>25</series_episodes>
    <my_watched_episodes>12</my_watched_episodes>
    <my_status>1</my_status>
    <my_score>8</my_score>
  </anime>
  <anime>
    <series_animedb_id>5114</series_animedb_id>
    <series_title>Fullmetal Alchemist: Brotherhood</series_title>
    <series_image>https://cdn.myanimelist.net/images/anime/1223/93173l.jpg</series_image>
    <series_episodes>64</series_episodes>
    <my_watched_episodes>64</my_watched_episodes>
    <my_status>2</my_status>
    <my_score>10</my_score>
  </anime>
  <anime>
    <series_animedb_id></series_animedb_id>
    <series_title></series_title>
    <my_status>1</my_status>
  </anime>
</myanimelist>`;

describe('MAL XML yedeği', () => {
  const result = parseMalXml(MAL_XML);

  it('eksik kimlikli kaydı atlar', () => {
    expect(result.items).toHaveLength(2);
    expect(result.skipped).toBe(1);
  });

  it("http kapakları https'e çevirir, https zaten duruyorsa dokunmaz", () => {
    expect(result.items[0].media.cover).toBe('https://cdn.myanimelist.net/images/anime/20/39431l.jpg');
    expect(result.items[1].media.cover).toBe('https://cdn.myanimelist.net/images/anime/1223/93173l.jpg');
  });

  it('CDATA ve durum kodlarını temizler', () => {
    expect(result.items[0].media.title).toBe('Code Geass: Hangyaku no Lelouch');
    expect(result.items[0].media.id).toBe('mal:20');
    expect(result.items[0].status).toBe('active');
    expect(result.items[0].progress).toBe(12);
    expect(result.items[1].status).toBe('done');
    expect(result.items[1].score).toBe(10);
  });
});

describe('AniList JSON yedeği', () => {
  it('listeleri tür ve duruma çevirir', () => {
    const raw = JSON.stringify({
      lists: [
        {
          name: 'Anime-List',
          entries: [
            {
              status: 'CURRENT',
              progress: 3,
              score: 80,
              media: {
                id: 28999,
                type: 'ANIME',
                title: { english: 'Demon Slayer', romaji: 'Kimetsu no Yaiba' },
                coverImage: { large: 'https://s4.anilist.co/cover.jpg' },
                genres: ['Action'],
                episodes: 26,
                seasonYear: 2019,
              },
            },
            { status: 'WATASHI-GIBA', media: { id: 99999, title: { english: 'Bilinmeyen durum' } } },
          ],
        },
      ],
    });
    const result = parseAniListJson(raw);
    expect(result.items[0].media.id).toBe('anime:28999');
    expect(result.items[0].media.subtitle).toBe('Kimetsu no Yaiba');
    expect(result.items[0].status).toBe('active');
    expect(result.items[0].score).toBe(8);
    expect(result.items[0].progress).toBe(3);
    // tanınmayan durum sırada'ya düşer, kayıt çöpe gitmez
    expect(result.items[1].status).toBe('planned');
  });

  it('liste yoksa hata verir', () => {
    expect(() => parseAniListJson('{"lists":[]}')).toThrow();
  });
});

describe('kaynak tahmini', () => {
  it("XML ve JSON'u ayırt eder", () => {
    expect(detectImportSource(MAL_XML)).toBe('mal');
    expect(detectImportSource('{"lists":[{"entries":[]}]}')).toBe('anilist');
    expect(detectImportSource('{"lists":[]}')).toBe('anilist'); // tanırlır, ayrıştırma sırasında hata verir
    expect(detectImportSource('merhaba')).toBeNull();
    expect(detectImportSource('')).toBeNull();
  });
});
