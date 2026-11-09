/**
 * Varsayılan avatar üretici.
 *
 * Kullanıcı fotoğraf yüklemediyse dış servise (DiceBear vb.) istek atmak yerine
 * yerel chibi anime avatarlarından birini deterministik seçer. Aynı `avatarSeed`
 * her zaman aynı avatarı verir; internet olmadan da çalışır.
 */
const CHIBI_AVATAR_COUNT = 8;

const CHIBI_AVATARS = Array.from(
  { length: CHIBI_AVATAR_COUNT },
  (_, index) => `/avatars/chibi-${String(index + 1).padStart(2, '0')}.svg`,
);

/** FNV-1a — hızlı, platformlar arası tutarlı hash. */
export function hashAvatarSeed(seed: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Firebase Storage / yerel yol gibi doğrudan görsel adreslerini ayırt eder. */
function isDirectImageSeed(value: string): boolean {
  return (
    /^https:\/\/firebasestorage\.googleapis\.com\//i.test(value) ||
    value.startsWith('/avatars/') ||
    value.startsWith('data:image/') ||
    value.startsWith('blob:')
  );
}

/** Seed'e göre yerel chibi avatar yolu (yükleme adresi ise doğrudan döner). */
export function getDefaultAvatar(seed?: string | null): string {
  const value = (seed ?? '').trim();
  if (!value) return CHIBI_AVATARS[0];
  if (isDirectImageSeed(value)) return value;
  return CHIBI_AVATARS[hashAvatarSeed(value) % CHIBI_AVATAR_COUNT];
}

/** Yüklenmiş fotoğraf varsa onu, yoksa chibi avatarı döndürür. */
export function resolveAvatar(photoURL?: string | null, seed?: string | null): string {
  const uploaded = (photoURL ?? '').trim();
  return uploaded || getDefaultAvatar(seed);
}
