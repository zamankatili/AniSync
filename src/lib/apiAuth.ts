/**
 * API uçları için kimlik kapısı.
 * - `Authorization: Bearer <Firebase ID token>` → doğrulanır (sıfır bağımlılık, Google securetoken).
 * - Üretimde token yoksa/ geçersizse 401. Geliştirmede (NODE_ENV != production) anonim erişim serbest.
 */
import { verifyFirebaseIdToken } from './verifyIdToken';

export interface ApiAuthResult {
  ok: boolean;
  uid?: string;
  status?: number;
  error?: string;
}

type HeaderBag = Record<string, unknown> | undefined;

export async function requireApiAuth(headers: HeaderBag): Promise<ApiAuthResult> {
  const raw = headers && (headers['authorization'] ?? headers['Authorization']);
  const auth = typeof raw === 'string' ? raw : '';

  if (auth.startsWith('Bearer ')) {
    const verified = await verifyFirebaseIdToken(auth.slice(7));
    if (verified) return { ok: true, uid: verified.uid };
    return { ok: false, status: 401, error: 'Invalid token' };
  }

  // Üretimde anonim Gemini/AI çağrılarını engelle (kota/suistimal koruması)
  if (process.env.NODE_ENV === 'production') {
    return { ok: false, status: 401, error: 'Authorization required' };
  }
  return { ok: true };
}
