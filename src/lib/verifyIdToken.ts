/**
 * Firebase ID token doğrulama — sıfır bağımlılık.
 * Google'ın securetoken sertifikalarıyla RS256 imzasını doğrular
 * (kid eşleşmesi + exp/iat/iss/aud kontrolleri). Servis hesabı gerektirmez;
 * yalnızca proje kimliği (`FIREBASE_PROJECT_ID`, yoksa public default) kullanılır.
 */
import crypto from 'crypto';

const CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const DEFAULT_PROJECT_ID = 'folkloric-centaur-q6tp2';

interface CertCache {
  certs: Record<string, string>;
  expires: number;
}
let certCache: CertCache | null = null;

async function getCerts(): Promise<Record<string, string>> {
  const now = Date.now();
  if (certCache && certCache.expires > now) return certCache.certs;

  const res = await fetch(CERTS_URL);
  if (!res.ok) throw new Error(`Google certs fetch failed: ${res.status}`);
  const certs = (await res.json()) as Record<string, string>;
  const maxAge = /max-age=(\d+)/.exec(res.headers.get('cache-control') ?? '');
  const ttlMs = maxAge ? Number(maxAge[1]) * 1000 : 3600_000;
  certCache = { certs, expires: now + ttlMs };
  return certs;
}

const b64urlJson = (segment: string): any =>
  JSON.parse(Buffer.from(segment, 'base64url').toString('utf8'));

export interface VerifiedToken {
  uid: string;
}

/** Geçerli imzalı Firebase ID token'ı doğrular; geçersizse null döner. */
export async function verifyFirebaseIdToken(token: string): Promise<VerifiedToken | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [h, p, s] = parts;

    const header = b64urlJson(h);
    const payload = b64urlJson(p);

    if (header?.alg !== 'RS256' || typeof header?.kid !== 'string') return null;

    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID;
    const nowSec = Math.floor(Date.now() / 1000);

    if (typeof payload?.exp !== 'number' || payload.exp <= nowSec) return null;
    if (typeof payload?.iat !== 'number' || payload.iat > nowSec + 300) return null;
    if (payload?.aud !== projectId) return null;
    if (payload?.iss !== `https://securetoken.google.com/${projectId}`) return null;
    if (typeof payload?.sub !== 'string' || !payload.sub) return null;

    const certs = await getCerts();
    const cert = certs[header.kid];
    if (!cert) return null;
    // Google securetoken sertifikaları X509 PEM'dir; Node'un X509Certificate'ı
    // onlardan doğrudan açık anahtar çıkarır. Ham PUBLIC KEY PEM de kabul edilir.
    const key = cert.includes('BEGIN CERTIFICATE')
      ? new crypto.X509Certificate(cert).publicKey
      : crypto.createPublicKey(cert);

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${h}.${p}`);
    if (!verifier.verify(key, s, 'base64url')) return null;

    return { uid: payload.sub };
  } catch {
    return null;
  }
}
