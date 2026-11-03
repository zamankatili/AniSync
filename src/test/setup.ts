const store = new Map<string, string>();

const memoryStorage: Storage = {
  get length() {
    return store.size;
  },
  clear: () => store.clear(),
  getItem: (key: string) => store.get(key) ?? null,
  key: (index: number) => [...store.keys()][index] ?? null,
  removeItem: (key: string) => {
    store.delete(key);
  },
  setItem: (key: string, value: string) => {
    store.set(key, value);
  },
};

Object.defineProperty(globalThis, 'localStorage', { value: memoryStorage, configurable: true });

// zustand/persist varlığı `window.localStorage` üzerinden kontrol eder.
if (!('window' in globalThis)) {
  (globalThis as unknown as { window: typeof globalThis }).window = globalThis;
}
