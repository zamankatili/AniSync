/**
 * Hafif TTL önbelleği.
 *
 * - Bellek içi Map her zaman kullanılır.
 * - `persist: true` verilirse localStorage'a da yazılır (sayfa yenilemeleri arasında korunur).
 * - Varsayılan TTL 15 dakika.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface TtlCacheOptions {
  ttlMs?: number;
  /** localStorage anahtar öneki. Verilmezse yalnızca bellekte tutulur. */
  persistKey?: string;
  /** localStorage kotası dolduğunda sessizce devam et. Varsayılan true. */
  silent?: boolean;
}

export interface TtlCache<T> {
  get(key: string): T | null;
  set(key: string, value: T): void;
  delete(key: string): void;
  clear(): void;
  /** Önbelleği yok sayarak üretir ve sonucu saklar. */
  wrap(key: string, producer: () => Promise<T>): Promise<T>;
}

const DEFAULT_TTL_MS = 15 * 60 * 1000;

export function createTtlCache<T>(options: TtlCacheOptions = {}): TtlCache<T> {
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  const memory = new Map<string, CacheEntry<T>>();
  const storageKey = options.persistKey ? `anisync.cache.${options.persistKey}` : null;
  const silent = options.silent ?? true;

  const readStorage = (): Record<string, CacheEntry<T>> => {
    if (!storageKey || typeof localStorage === 'undefined') return {};
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, CacheEntry<T>>) : {};
    } catch {
      return {};
    }
  };

  const writeStorage = (data: Record<string, CacheEntry<T>>) => {
    if (!storageKey || typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      if (!silent) throw error;
      // Kota dolduysa en eski kayıtları atıp yeniden dene.
      try {
        const keys = Object.keys(data);
        const trimmed = Object.fromEntries(keys.slice(Math.floor(keys.length / 2)).map((k) => [k, data[k]]));
        localStorage.setItem(storageKey, JSON.stringify(trimmed));
      } catch {
        /* yoksay */
      }
    }
  };

  const get = (key: string): T | null => {
    const now = Date.now();
    const fromMemory = memory.get(key);
    if (fromMemory) {
      if (fromMemory.expiresAt > now) return fromMemory.value;
      memory.delete(key);
    }

    const stored = readStorage()[key];
    if (stored && stored.expiresAt > now) {
      memory.set(key, stored);
      return stored.value;
    }
    return null;
  };

  const set = (key: string, value: T) => {
    const entry: CacheEntry<T> = { value, expiresAt: Date.now() + ttlMs };
    memory.set(key, entry);
    if (storageKey) {
      const data = readStorage();
      data[key] = entry;
      writeStorage(data);
    }
  };

  const remove = (key: string) => {
    memory.delete(key);
    if (storageKey) {
      const data = readStorage();
      delete data[key];
      writeStorage(data);
    }
  };

  const clear = () => {
    memory.clear();
    if (storageKey && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        /* yoksay */
      }
    }
  };

  const wrap = async (key: string, producer: () => Promise<T>): Promise<T> => {
    const cached = get(key);
    if (cached !== null) return cached;
    const value = await producer();
    set(key, value);
    return value;
  };

  return { get, set, delete: remove, clear, wrap };
}

/**
 * Aynı anahtar için eşzamanlı istekleri tekilleştirir (request coalescing).
 * Örn. iki bileşen aynı anda aynı animeyi isterse tek ağ isteği gider.
 */
const inflight = new Map<string, Promise<unknown>>();

export function dedupe<T>(key: string, producer: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = producer().finally(() => {
    inflight.delete(key);
  });
  inflight.set(key, promise);
  return promise;
}
