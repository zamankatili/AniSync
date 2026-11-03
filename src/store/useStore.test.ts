import { beforeEach, describe, expect, it } from 'vitest';
import { useStore } from './useStore';
import { XP } from '../lib/level';
import type { Media } from '../lib/types';

const media = (id: string, totalUnits: number | null = 12): Media => ({
  id,
  source: 'local',
  type: 'anime',
  title: id,
  cover: '',
  genres: [],
  score: null,
  year: null,
  totalUnits,
  unitLabel: 'bölüm',
  meta: '',
});

const state = () => useStore.getState();

beforeEach(() => {
  state().resetAll();
});

describe('örnek gönderiler', () => {
  it('seed gönderiler seed bayrağıyla gelir', () => {
    const posts = state().posts;
    expect(posts.length).toBeGreaterThan(0);
    expect(posts.every((p) => p.seed)).toBe(true);
  });

  it('yedek, örnek içeriği kullanıcı içeriği gibi taşımaz', () => {
    state().createPost({ text: 'Kendi gönderim.', kind: 'sohbet' });
    const payload = JSON.parse(state().exportData());
    expect(payload.data.posts.map((p: { id: string }) => p.id)).toEqual([
      ...state().posts.filter((p) => !p.seed).map((p) => p.id),
    ]);
  });
});

describe('yedek al / yükle', () => {
  it('özel listeler yedekten sağ çıkar', () => {
    state().onboard({ name: 'Semi', emoji: '🍵', color: '#fff', genres: ['Dram'], homeType: 'anime' });
    const listId = state().createList({ name: 'İlk göz ağrılarım', emoji: '⭐', color: '#fff' });
    state().addToShelf(media('anime:21'));
    state().bulkAddToList(listId, ['anime:21']);

    const backup = state().exportData();

    state().resetAll();
    expect(state().lists).toHaveLength(0);
    expect(state().shelf).toEqual({});

    expect(state().importData(backup)).toBe(true);
    expect(state().lists).toHaveLength(1);
    expect(state().lists[0].mediaIds).toEqual(['anime:21']);
    expect(state().shelf['anime:21']).toBeDefined();
  });

  it('bayraksız eski yedek geri yüklenince örnek gönderiler yinelenmez', () => {
    const legacyPosts = state().posts.map((p) => ({ ...p, seed: undefined }));
    const legacy = JSON.stringify({ app: 'anisync', version: 2, data: { onboarded: true, posts: legacyPosts } });

    expect(state().importData(legacy)).toBe(true);
    const ids = state().posts.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('bozuk dosya reddedilir', () => {
    expect(state().importData('{bu bir json değil')).toBe(false);
  });
});

describe('raflar ve XP', () => {
  it('toplu "bitti" her yeni tamamlanan eser için ayrı XP verir', () => {
    const before = state().xp;
    ['anime:1', 'anime:2', 'anime:3'].forEach((id) => state().addToShelf(media(id)));
    expect(state().xp - before).toBe(3 * XP.addShelf);

    const afterShelf = state().xp;
    state().bulkSetStatus(['anime:1', 'anime:2', 'anime:3'], 'done');
    expect(state().xp - afterShelf).toBe(3 * XP.complete);
  });

  it('zaten bitmiş eser ikinci kez XP ödemez', () => {
    state().addToShelf(media('anime:1'), 'done');
    const after = state().xp;
    state().bulkSetStatus(['anime:1'], 'done');
    expect(state().xp).toBe(after);
  });

  it('bölüm ilerletme sona varınca eser bittiye geçer', () => {
    state().addToShelf(media('anime:7', 2));
    state().bumpProgress('anime:7');
    expect(state().shelf['anime:7'].status).toBe('active');
    state().bumpProgress('anime:7');
    expect(state().shelf['anime:7'].status).toBe('done');
    expect(state().shelf['anime:7'].progress).toBe(2);
  });

  it('raftan çıkarma liste üyeliğini de temizler', () => {
    const listId = state().createList({ name: 'Bahar', emoji: '🌸', color: '#fff' });
    state().addToShelf(media('anime:5'));
    state().bulkAddToList(listId, ['anime:5']);
    expect(state().lists[0].mediaIds).toEqual(['anime:5']);

    state().removeEntry('anime:5');
    expect(state().shelf['anime:5']).toBeUndefined();
    expect(state().lists[0].mediaIds).toEqual([]);
  });
});

describe('seviye ve atmosfer', () => {
  it('seviye atlayınca açılan atmosfer bildirilir', () => {
    state().addToShelf(media('anime:9'));
    state().addToShelf(media('anime:10'));
    state().addToShelf(media('anime:11'));
    state().addToShelf(media('anime:12'));
    state().addToShelf(media('anime:13'));
    state().addToShelf(media('anime:14'));
    expect(state().xp).toBe(6 * XP.addShelf);
    expect(state().levelUp?.level).toBe(2);
    expect(state().levelUp?.unlocks).toContain('cay');
  });

  it('kilitli atmosfer seçilemez', () => {
    expect(state().setAtmos('kutuphane')).toBe(false);
    expect(state().atmos).toBe('klasik');
    expect(state().setAtmos('klasik')).toBe(true);
  });
});
