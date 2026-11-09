import { describe, it, expect, beforeEach } from 'vitest';
import {
  ANON_DAILY_LIMIT,
  readAnonQuota,
  canAnonSend,
  recordAnonSend,
  loadAnonMessages,
  appendAnonMessage,
} from './anonQuota';

const makeStorage = () => {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, String(v)),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
  };
};

describe('anonQuota', () => {
  let storage: ReturnType<typeof makeStorage>;

  beforeEach(() => {
    storage = makeStorage();
  });

  it('sıfırdan başlar', () => {
    const q = readAnonQuota(new Date('2026-11-09T12:00:00Z'), storage);
    expect(q).toEqual({ date: '2026-11-09', used: 0 });
    expect(canAnonSend(new Date('2026-11-09T12:00:00Z'), storage)).toBe(true);
  });

  it('güne yayılan kota dolduktan sonra gönderim engellenir', () => {
    const day = new Date('2026-11-09T12:00:00Z');
    expect(canAnonSend(day, storage)).toBe(true);
    recordAnonSend(day, storage);
    recordAnonSend(day, storage);
    expect(canAnonSend(day, storage)).toBe(true);
    expect(readAnonQuota(day, storage).used).toBe(2);
    recordAnonSend(day, storage);
    expect(readAnonQuota(day, storage).used).toBe(3);
    expect(canAnonSend(day, storage)).toBe(false);
  });

  it('yeni günde sayaç sıfırlanır', () => {
    const day1 = new Date('2026-11-09T12:00:00Z');
    const day2 = new Date('2026-11-10T00:00:00Z');
    recordAnonSend(day1, storage);
    recordAnonSend(day1, storage);
    recordAnonSend(day1, storage);
    expect(canAnonSend(day1, storage)).toBe(false);
    expect(canAnonSend(day2, storage)).toBe(true);
    expect(readAnonQuota(day2, storage).used).toBe(0);
    expect(readAnonQuota(day2, storage).date).toBe('2026-11-10');
  });

  it('yerel mesajlar oda oda tutulur ve bayatlar', () => {
    const day = new Date('2026-11-09T12:00:00Z');
    appendAnonMessage('genel', { id: 'm1', text: 'merhaba', createdAt: Date.now(), name: 'Misafir' }, storage);
    appendAnonMessage('bolum-odasi', { id: 'm2', text: 'bölüm?', createdAt: Date.now(), name: 'Misafir' }, storage);
    expect(loadAnonMessages('genel', storage).map((m) => m.text)).toEqual(['merhaba']);
    expect(loadAnonMessages('bolum-odasi', storage).map((m) => m.text)).toEqual(['bölüm?']);

    // bayat mesajlar atılır — legacy formatlı kayıt
    storage.setItem('anisync_anon_messages_v1', JSON.stringify([
      { id: 'old', roomId: 'genel', text: 'eski', createdAt: Date.now() - 48 * 60 * 60 * 1000, name: 'Misafir' },
      { id: 'new', roomId: 'genel', text: 'taze', createdAt: Date.now(), name: 'Misafir' },
    ]));
    expect(loadAnonMessages('genel', storage).map((m) => m.text)).toEqual(['taze']);
  });

  it('ANON_DAILY_LIMIT — 3', () => {
    expect(ANON_DAILY_LIMIT).toBe(3);
  });
});
