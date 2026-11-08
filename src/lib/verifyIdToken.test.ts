import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { generateKeyPairSync, createSign } from 'crypto';

// Modül seviyesinde cert cache'i var → her test için modülü yeniden import et
const loadModule = async () => {
  vi.resetModules();
  return import('./verifyIdToken');
};

const PROJECT_ID = 'folkloric-centaur-q6tp2';

const makeJwt = (privateKey: string, overrides: Record<string, unknown> = {}) => {
  const b64u = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const header = b64u({ alg: 'RS256', kid: 'test-kid' });
  const payload = b64u({
    aud: PROJECT_ID,
    iss: `https://securetoken.google.com/${PROJECT_ID}`,
    sub: 'uid-test-123',
    user_id: 'uid-test-123',
    exp: now + 3600,
    iat: now,
    auth_time: now,
    ...overrides,
  });
  const data = `${header}.${payload}`;
  const signature = createSign('RSA-SHA256').update(data).sign(privateKey, 'base64url');
  return `${data}.${signature}`;
};

describe('verifyFirebaseIdToken', () => {
  let privateKey: string;
  let publicKeyPem: string;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const pair = generateKeyPairSync('rsa', { modulusLength: 2048 });
    privateKey = pair.privateKey.export({ format: 'pem', type: 'pkcs1' }) as unknown as string;
    publicKeyPem = pair.publicKey.export({ format: 'pem', type: 'spki' }) as unknown as string;

    fetchMock = vi.fn(async () => ({
      ok: true,
      headers: { get: () => 'public, max-age=3600' },
      json: async () => ({ 'test-kid': publicKeyPem }),
    }));
    vi.stubGlobal('fetch', fetchMock as any);
    vi.stubEnv('FIREBASE_PROJECT_ID', PROJECT_ID);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('geçerli imzalı token kabul edilir', async () => {
    const { verifyFirebaseIdToken } = await loadModule();
    const token = makeJwt(privateKey);
    const result = await verifyFirebaseIdToken(token);
    expect(result?.uid).toBe('uid-test-123');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('sertifikalar önbelleğe alınır (ikinci doğrulamada tekrar çekilmez)', async () => {
    const { verifyFirebaseIdToken } = await loadModule();
    const token = makeJwt(privateKey);
    await verifyFirebaseIdToken(token);
    await verifyFirebaseIdToken(token);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('süresi dolmuş token reddedilir', async () => {
    const { verifyFirebaseIdToken } = await loadModule();
    const past = Math.floor(Date.now() / 1000) - 600;
    const token = makeJwt(privateKey, { exp: past, iat: past - 3600 });
    expect(await verifyFirebaseIdToken(token)).toBeNull();
  });

  it('yanlış issuer reddedilir', async () => {
    const { verifyFirebaseIdToken } = await loadModule();
    const token = makeJwt(privateKey, { iss: 'https://securetoken.google.com/başka-proje' });
    expect(await verifyFirebaseIdToken(token)).toBeNull();
  });

  it('yanlış audience reddedilir', async () => {
    const { verifyFirebaseIdToken } = await loadModule();
    const token = makeJwt(privateKey, { aud: 'başka-proje' });
    expect(await verifyFirebaseIdToken(token)).toBeNull();
  });

  it('imzası bozulmuş token reddedilir', async () => {
    const { verifyFirebaseIdToken } = await loadModule();
    const token = makeJwt(privateKey);
    const tampered = token.slice(0, token.length - 4) + (token.endsWith('AAAA') ? 'BBBB' : 'AAAA');
    expect(await verifyFirebaseIdToken(tampered)).toBeNull();
  });

  it('bilinmeyen kid reddedilir', async () => {
    const { verifyFirebaseIdToken } = await loadModule();
    // Farklı bir kid ile imzala
    const token = (() => {
      const b64u = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64url');
      const now = Math.floor(Date.now() / 1000);
      const header = b64u({ alg: 'RS256', kid: 'bilinmeyen-kid' });
      const payload = b64u({ aud: PROJECT_ID, iss: `https://securetoken.google.com/${PROJECT_ID}`, sub: 'x', exp: now + 3600, iat: now });
      const signer = createSign('RSA-SHA256');
      signer.update(`${header}.${payload}`);
      return `${header}.${payload}.${signer.sign(privateKey, 'base64url')}`;
    })();
    expect(await verifyFirebaseIdToken(token)).toBeNull();
  });

  it('boş/bozuk token reddedilir', async () => {
    const { verifyFirebaseIdToken } = await loadModule();
    expect(await verifyFirebaseIdToken('')).toBeNull();
    expect(await verifyFirebaseIdToken('abc')).toBeNull();
    expect(await verifyFirebaseIdToken('a.b.c')).toBeNull();
  });
});
