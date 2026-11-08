/**
 * Anlık Firestore `config/app` dokümanını okuyan hook.
 * - 60 sn localStorage cache (ağ yokken açılışta uygulanır)
 * - Firestore'dan realtime onSnapshot ile güncellenir
 * - Okuma başarısızsa varsayılanlarla devam eder (bakım modu false)
 * - Bakım modu için bakımcı/admin geçişi (claims veya env e-postası) dışarıda yapılır
 */
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import {
  DEFAULT_REMOTE_CONFIG,
  loadCachedRemoteConfig,
  saveCachedRemoteConfig,
  type RemoteConfig,
} from '../lib/adminConfig';

export function useRemoteConfig() {
  const [config, setConfig] = useState<RemoteConfig>(() => {
    return loadCachedRemoteConfig() ?? DEFAULT_REMOTE_CONFIG;
  });
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const ref = doc(db, 'config', 'app');
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (!snapshot.exists()) {
          setConfig(DEFAULT_REMOTE_CONFIG);
          saveCachedRemoteConfig(DEFAULT_REMOTE_CONFIG);
          return;
        }
        const data = snapshot.data() as Partial<RemoteConfig>;
        const merged: RemoteConfig = {
          ...DEFAULT_REMOTE_CONFIG,
          ...data,
          featureFlags: { ...DEFAULT_REMOTE_CONFIG.featureFlags, ...(data.featureFlags ?? {}) },
          limits: data.limits,
        };
        setConfig(merged);
        saveCachedRemoteConfig(merged);
        setLoaded(true);
      },
      (err) => {
        console.warn('[useRemoteConfig] could not read config/app:', err);
        setError(err as Error);
        setLoaded(true); // güvensiz hatada bile uygulamayı kilitleme
      }
    );
    return () => unsubscribe();
  }, []);

  return { config, loaded, error };
}
