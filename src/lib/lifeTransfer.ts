/**
 * Kayıt taşıma kodu — hayatı (ve seçimlerini) sıkıştırıp güvenli bir metin koduna çevirir.
 * Format: `ANSYNC1:` + base64url( gzip( JSON ) )
 * Tarayıcı dışı ortamda (ör. unit test) saf JSON ile base64'e düşer (`ANSYNC0:`).
 */

const PREFIX_GZIP = 'ANSYNC1:';
const PREFIX_PLAIN = 'ANSYNC0:';

export interface LifeTransferPayload {
  schema: 2;
  life: unknown;
  index: number;
  choices: Record<string, string>;
  parallels: unknown[];
  worldId?: string;
  regionId?: string;
  duration?: '30min' | '1h' | '1.5h';
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function exportLifeCode(payload: LifeTransferPayload): Promise<string> {
  const json = JSON.stringify(payload);
  if (typeof CompressionStream === 'undefined' || typeof TextEncoder === 'undefined' || typeof btoa === 'undefined') {
    return PREFIX_PLAIN + btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
  const stream = new Blob([new TextEncoder().encode(json)]).stream().pipeThrough(new CompressionStream('gzip'));
  const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
  return PREFIX_GZIP + toBase64Url(compressed);
}

export async function importLifeCode(code: string): Promise<LifeTransferPayload> {
  const trimmed = code.trim();
  if (trimmed.startsWith(PREFIX_GZIP)) {
    const bytes = fromBase64Url(trimmed.slice(PREFIX_GZIP.length));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    const json = await new Response(stream).text();
    const parsed = JSON.parse(json) as LifeTransferPayload;
    validate(parsed);
    return parsed;
  }
  if (trimmed.startsWith(PREFIX_PLAIN)) {
    const b64 = trimmed.slice(PREFIX_PLAIN.length).replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4))));
    const parsed = JSON.parse(json) as LifeTransferPayload;
    validate(parsed);
    return parsed;
  }
  throw new Error('Unrecognized transfer code prefix');
}

function validate(payload: LifeTransferPayload) {
  if (!payload || payload.schema !== 2 || typeof payload !== 'object') {
    throw new Error('Invalid transfer code: missing schema');
  }
  if (!payload.life || typeof payload.life !== 'object') {
    throw new Error('Invalid transfer code: missing life');
  }
  const maybeLife = payload.life as { events?: unknown };
  if (!Array.isArray(maybeLife.events)) {
    throw new Error('Invalid transfer code: life has no events');
  }
}

/** localStorage'daki hayat kaydını toplar. Kayıt yoksa null döner. */
export function collectSavedLifePayload(): LifeTransferPayload | null {
  try {
    const raw = localStorage.getItem('als_saved_life');
    if (!raw) return null;
    const life = JSON.parse(raw);
    let parallels: unknown[] = [];
    let choices: Record<string, string> = {};
    try {
      parallels = JSON.parse(localStorage.getItem('als_saved_parallels') || '[]');
      choices = JSON.parse(localStorage.getItem('als_saved_choices') || '{}');
    } catch {
      // bozuk alt alanlar → boş devam
    }
    return {
      schema: 2,
      life,
      index: Number(localStorage.getItem('als_saved_index') || '0'),
      choices,
      parallels: Array.isArray(parallels) ? parallels : [],
      worldId: localStorage.getItem('als_saved_world') || undefined,
      regionId: localStorage.getItem('als_saved_region') || undefined,
      duration: (localStorage.getItem('als_saved_duration') as '30min' | '1h' | '1.5h') || undefined,
    };
  } catch {
    return null;
  }
}

/** Taşıma kodunu localStorage'a yazar; uygulama açılışında `handleResume` ile uyumludur. */
export function applyLifePayload(payload: LifeTransferPayload) {
  const p = payload;
  localStorage.setItem('als_saved_life', JSON.stringify(p.life));
  localStorage.setItem('als_saved_index', String(p.index ?? 0));
  localStorage.setItem('als_saved_choices', JSON.stringify(p.choices ?? {}));
  localStorage.setItem('als_saved_parallels', JSON.stringify(p.parallels ?? []));
  localStorage.setItem('als_saved_schema', '2');
  localStorage.setItem('als_saved_phase', 'playing');
  if (p.worldId) localStorage.setItem('als_saved_world', p.worldId);
  if (p.regionId) localStorage.setItem('als_saved_region', p.regionId);
  if (p.duration) localStorage.setItem('als_saved_duration', p.duration);
}
