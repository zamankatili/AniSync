import { describe, expect, it } from 'vitest';
import { buildAniListSearchQuery, mapAniListMedia } from './anilist';

/**
 * `buildAniListSearchQuery` ağ çağrısı yapmayan saf bir üreticidir. Ülke
 * filtresi (donghua/manhua) burada doğrulanır; aksi hâlde "Çin" seçildiğinde
 * sessizce Japon kataloğu gösterme hatası geri dönebilir.
 */
const BASE = {
  search: '',
  type: 'ANIME' as const,
  page: 1,
  perPage: 18,
  hideAdult: true,
  genres: [] as string[],
};

describe('buildAniListSearchQuery — ülke filtresi', () => {
  it('leaves the query untouched when no country is requested', () => {
    const { query, variables } = buildAniListSearchQuery(BASE);
    expect(query).not.toContain('countryOfOrigin');
    expect(query).not.toContain('$country');
    expect(variables.country).toBeUndefined();
    expect(query).toContain('sort: POPULARITY_DESC');
  });

  it('filters Chinese donghua through countryOfOrigin', () => {
    const { query, variables } = buildAniListSearchQuery({ ...BASE, country: 'CN' });
    expect(query).toContain('$country: CountryCode');
    expect(query).toContain('countryOfOrigin: $country');
    expect(variables.country).toBe('CN');
    expect(variables.type).toBe('ANIME');
  });

  it('combines the country filter with genres', () => {
    const { query, variables } = buildAniListSearchQuery({
      ...BASE,
      country: 'CN',
      genres: ['Fantasy', 'Action'],
    });
    expect(query).toContain('genre_in: $genres');
    expect(query).toContain('countryOfOrigin: $country');
    expect(variables.genres).toEqual(['Fantasy', 'Action']);
  });

  it('switches to SEARCH_MATCH only when a text query is present', () => {
    const { query, variables } = buildAniListSearchQuery({
      ...BASE,
      search: 'link click',
      country: 'CN',
    });
    expect(query).toContain('sort: SEARCH_MATCH');
    expect(query).not.toContain('sort: POPULARITY_DESC');
    expect(variables.search).toBe('link click');
  });

  it('keeps the NOVEL format for Chinese light novels', () => {
    const { query, variables } = buildAniListSearchQuery({
      ...BASE,
      type: 'MANGA',
      format: 'NOVEL',
      country: 'CN',
    });
    expect(query).toContain('format: $format');
    expect(variables.format).toBe('NOVEL');
    expect(variables.country).toBe('CN');
  });

  it('does not declare unused variables for plain searches', () => {
    const { query, variables } = buildAniListSearchQuery(BASE);
    expect(query).not.toContain('$search');
    expect(variables.search).toBeUndefined();
    expect(variables.genres).toBeUndefined();
  });
});

describe('mapAniListMedia — menşe ülke', () => {
  it('carries countryOfOrigin onto the unified media model', () => {
    const media = mapAniListMedia({
      id: 21,
      type: 'ANIME',
      title: { romaji: 'Donghua Example', english: 'Donghua Example' },
      countryOfOrigin: 'CN',
    });
    expect(media.countryOfOrigin).toBe('CN');
    expect(media.kind).toBe('anime');
    expect(media.displayTitle).toBe('Donghua Example');
  });

  it('omits the field when AniList does not provide it', () => {
    const media = mapAniListMedia({ id: 22, type: 'ANIME', title: { romaji: 'Unknown' } });
    expect(media.countryOfOrigin).toBeUndefined();
  });
});
