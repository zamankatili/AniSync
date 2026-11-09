/**
 * Günün Önerileri — bu sezonun CANLI AniList trendlerinden günün seçkisi.
 *
 * Kullanıcı `favoriteGenres` seçmişse sıralama tür eşleşmesine göre yapılır;
 * seçmemişse gün-n-index'i ile liste kaydırılır (her gün farklı ama tutarlı).
 * Uydurma yok: kapak/puan/bölüm/genres hepsi canlı kayıttan gelir.
 */
import { useCallback, useEffect, useState } from 'react';
import { fetchSeasonalTrendingAnime } from '../lib/api/anilist';
import type { UnifiedMedia } from '../types/unified';
import { useAppStore } from '../context/AppStore';

export type PicksState = 'loading' | 'ready' | 'error';

export interface UseDailyPicksResult {
  items: UnifiedMedia[];
  /** Kullanıcı tür seçti ve isabet eden eşleşmeler var. */
  personalized: boolean;
  state: PicksState;
  refresh: () => void;
}

export function useDailyPicks(count = 3): UseDailyPicksResult {
  const { userProfile } = useAppStore();
  const favKey = (userProfile?.favoriteGenres ?? []).slice().sort().join('|');
  const [items, setItems] = useState<UnifiedMedia[]>([]);
  const [personalized, setPersonalized] = useState(false);
  const [state, setState] = useState<PicksState>('loading');
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    const favoriteGenres = favKey ? favKey.split('|') : [];

    fetchSeasonalTrendingAnime(24)
      .then((result) => {
        if (cancelled) return;
        const favs = favoriteGenres.map((g) => g.toLowerCase());
        const scored = result.items
          .map((item) => ({
            item,
            score: (item.genres || []).filter((g) => favs.includes(String(g).toLowerCase())).length,
          }))
          .sort((a, b) => b.score - a.score);

        const hasMatches = scored.length > 0 && scored[0].score > 0;
        let picked: UnifiedMedia[];

        if (hasMatches) {
          picked = scored.slice(0, count).map((s) => s.item);
        } else {
          const dayIndex = Math.floor(Date.now() / 86400000);
          const base = Math.max(1, scored.length);
          const offset = dayIndex % base;
          picked = [];
          for (let k = 0; k < count && picked.length < base; k += 1) {
            const candidate = scored[(offset + k * (count + 1)) % base]?.item;
            if (candidate) picked.push(candidate);
          }
        }

        setItems(picked);
        setPersonalized(hasMatches && favs.length > 0);
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });

    return () => {
      cancelled = true;
    };
    // favKey öğelerinin birleşimidir — primitive, her render'da kimlik değişmez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favKey, count, nonce]);

  return { items, personalized, state, refresh };
}
