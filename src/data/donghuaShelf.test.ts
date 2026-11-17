import { describe, expect, it } from 'vitest';
import {
  DONGHUA_SHELF,
  SHELF_LAST_CHECKED,
  SHELF_TAG_ORDER,
  getShelfEntry,
  type ShelfTag,
} from './donghuaShelf';

const LANGS = ['tr', 'en', 'ja', 'fr'] as const;
const VALID_TAGS: ShelfTag[] = ['xianxia', 'cultivation', 'wuxia', 'fantasy', 'modern'];

describe('donghua shelf — veri bütünlüğü', () => {
  it('has unique ids and unique AniList ids', () => {
    const ids = DONGHUA_SHELF.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);

    const anilistIds = DONGHUA_SHELF.map((entry) => entry.anilistId);
    expect(new Set(anilistIds).size).toBe(anilistIds.length);
  });

  it('keeps the curated scope: 9 donghua + 3 manhua', () => {
    expect(DONGHUA_SHELF).toHaveLength(12);
    expect(DONGHUA_SHELF.filter((entry) => entry.kind === 'donghua')).toHaveLength(9);
    expect(DONGHUA_SHELF.filter((entry) => entry.kind === 'manhua')).toHaveLength(3);
  });

  it('links every entry to its own AniList page', () => {
    for (const entry of DONGHUA_SHELF) {
      const type = entry.kind === 'donghua' ? 'anime' : 'manga';
      expect(entry.anilistUrl, entry.id).toBe(
        `https://anilist.co/${type}/${entry.anilistId}`,
      );
    }
  });

  it('uses only AniList CDN covers over https', () => {
    for (const entry of DONGHUA_SHELF) {
      expect(entry.cover, entry.id).toMatch(
        /^https:\/\/s4\.anilist\.co\/file\/anilistcdn\/media\/(anime|manga)\/cover\//,
      );
      expect(entry.cover, entry.id).not.toContain(' ');
    }
  });

  it('points novel links only at the NovelUpdates series finder', () => {
    for (const entry of DONGHUA_SHELF) {
      if (!entry.novelSearchUrl) continue;
      const url = new URL(entry.novelSearchUrl);
      expect(url.host, entry.id).toBe('www.novelupdates.com');
      expect(url.pathname, entry.id).toBe('/series-finder/');
      expect(url.searchParams.get('sf'), entry.id).toBe('1');
      expect(url.searchParams.get('sh')?.trim().length, entry.id).toBeGreaterThan(0);
    }
  });

  it('has a real title, native title and romaji name for every entry', () => {
    for (const entry of DONGHUA_SHELF) {
      expect(entry.title.trim().length, entry.id).toBeGreaterThan(0);
      expect(entry.titleRomaji.trim().length, entry.id).toBeGreaterThan(0);
      expect(entry.titleNative.trim().length, entry.id).toBeGreaterThan(0);
      // Orijinal başlık Çince olmalı (uydurma Latin başlık yasak).
      expect(entry.titleNative, entry.id).toMatch(/[\u4e00-\u9fff]/);
    }
  });

  it('keeps year, format and counts plausible for AniList data', () => {
    for (const entry of DONGHUA_SHELF) {
      expect(entry.year, entry.id).toBeGreaterThanOrEqual(1950);
      expect(entry.year, entry.id).toBeLessThanOrEqual(2026);
      expect(entry.format, entry.id).toBe(entry.kind === 'donghua' ? 'ONA' : 'MANGA');

      if (entry.kind === 'donghua') {
        expect(entry.episodes, entry.id).toBeGreaterThan(0);
        expect(entry.chapters, entry.id).toBeUndefined();
      } else if (entry.chapters !== undefined) {
        expect(entry.chapters, entry.id).toBeGreaterThan(0);
      }
    }
  });

  it('tags every entry with known shelf tags', () => {
    for (const entry of DONGHUA_SHELF) {
      expect(entry.tags.length, entry.id).toBeGreaterThan(0);
      for (const tag of entry.tags) {
        expect(VALID_TAGS, `${entry.id}:${tag}`).toContain(tag);
      }
    }
  });

  it('orders every tag in the shared tag order', () => {
    for (const tag of VALID_TAGS) {
      expect(SHELF_TAG_ORDER, tag).toContain(tag);
    }
    expect(SHELF_TAG_ORDER).toHaveLength(VALID_TAGS.length);
  });

  it('writes a short curator note in all four languages (no copied prose)', () => {
    for (const entry of DONGHUA_SHELF) {
      for (const lang of LANGS) {
        const note = entry.notes[lang].trim();
        expect(note.length, `${entry.id} note [${lang}]`).toBeGreaterThanOrEqual(12);
        // Uzun roman özeti/alıntı kopyalanmadığını garantile.
        expect(note.length, `${entry.id} note [${lang}]`).toBeLessThan(240);
        expect(note, `${entry.id} note [${lang}]`).not.toMatch(/<\/?[a-z][^>]*>/i);
      }
    }
  });

  it('exposes a stable last-checked date', () => {
    expect(SHELF_LAST_CHECKED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(Date.parse(SHELF_LAST_CHECKED))).toBe(false);
  });

  it('finds entries by id', () => {
    expect(getShelfEntry('fanren-xiuxian-zhuan')?.anilistId).toBe(115844);
    expect(getShelfEntry('does-not-exist')).toBeUndefined();
  });
});
