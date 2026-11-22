import {
  CHAT_REPLY_NAME_MAX,
  CHAT_REPLY_TEXT_MAX,
  type ChatMessage,
  type ChatReplyRef,
} from './chatTypes';

/**
 * KÖŞE mesaj metni ayrıştırıcısı.
 *
 * Desteklenen biçimler:
 * - `||spoiler||` → gizli, dokununca açılan parça
 * - `https://…` → yalnız http(s) bağlantısı
 * - `@isim` → vurgulanan anma
 *
 * HTML üretilmez; React parçaları olarak render edilir. Böylece mesaj içeriği
 * asla `dangerouslySetInnerHTML` üzerinden çalışmaz.
 */
export type ChatTextSegment =
  | { kind: 'text'; text: string }
  | { kind: 'link'; text: string; href: string }
  | { kind: 'mention'; text: string }
  | { kind: 'spoiler'; text: string };

const INLINE_RE = /https?:\/\/[^\s<>"'`]+|(?<![\p{L}\p{N}_@])@[\p{L}\p{N}_]{2,32}/gu;
const TRAILING_PUNCTUATION = /[.,!?;:'"”’]/;

const count = (value: string, needle: string): number => {
  let total = 0;
  let index = value.indexOf(needle);
  while (index !== -1) {
    total += 1;
    index = value.indexOf(needle, index + needle.length);
  }
  return total;
};

/** URL'nin sonundaki cümle noktalamasını ayırır; parantez dengesini korur. */
function splitUrl(raw: string): { href: string; rest: string } {
  let end = raw.length;
  while (end > 0) {
    const char = raw[end - 1];
    if (TRAILING_PUNCTUATION.test(char)) {
      end -= 1;
      continue;
    }
    if (char === ')' && count(raw.slice(0, end), '(') < count(raw.slice(0, end), ')')) {
      end -= 1;
      continue;
    }
    break;
  }
  return { href: raw.slice(0, end), rest: raw.slice(end) };
}

/** Yalnız http/https adresleri tıklanabilir olur. */
export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function pushInline(target: ChatTextSegment[], input: string): void {
  if (!input) return;
  let last = 0;
  INLINE_RE.lastIndex = 0;
  for (const match of input.matchAll(INLINE_RE)) {
    const index = match.index ?? 0;
    if (index > last) target.push({ kind: 'text', text: input.slice(last, index) });
    const raw = match[0];
    if (raw.startsWith('http')) {
      const { href, rest } = splitUrl(raw);
      if (href && isSafeHttpUrl(href)) {
        target.push({ kind: 'link', text: href, href });
      } else {
        target.push({ kind: 'text', text: href });
      }
      if (rest) target.push({ kind: 'text', text: rest });
    } else {
      target.push({ kind: 'mention', text: raw });
    }
    last = index + raw.length;
  }
  if (last < input.length) target.push({ kind: 'text', text: input.slice(last) });
}

function mergeText(segments: ChatTextSegment[]): ChatTextSegment[] {
  const merged: ChatTextSegment[] = [];
  for (const segment of segments) {
    const previous = merged[merged.length - 1];
    if (segment.kind === 'text' && previous?.kind === 'text') {
      previous.text += segment.text;
    } else if (segment.kind !== 'text' || segment.text.length > 0) {
      merged.push(segment);
    }
  }
  return merged;
}

export function parseChatText(raw: string): ChatTextSegment[] {
  const input = typeof raw === 'string' ? raw : '';
  if (!input) return [];
  const out: ChatTextSegment[] = [];
  let cursor = 0;

  while (cursor < input.length) {
    const open = input.indexOf('||', cursor);
    if (open === -1) {
      pushInline(out, input.slice(cursor));
      break;
    }
    const close = input.indexOf('||', open + 2);
    if (close === -1) {
      pushInline(out, input.slice(cursor));
      break;
    }
    pushInline(out, input.slice(cursor, open));
    const content = input.slice(open + 2, close);
    if (content.trim()) {
      out.push({ kind: 'spoiler', text: content });
    } else {
      // `||||` boş spoiler sayılmaz; görünür metin olarak kalır.
      pushInline(out, '||||');
    }
    cursor = close + 2;
  }

  return mergeText(out);
}

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Metin `@isim` ile kullanıcıyı anıyor mu?
 * Görünen adın ilk kelimesi de kabul edilir ("@Misafir" → "Misafir 1").
 */
export function mentionsName(raw: string, name?: string | null): boolean {
  const text = (raw || '').toLocaleLowerCase();
  const full = (name || '').trim().toLocaleLowerCase();
  if (!text || full.length < 2) return false;
  const token = full.split(/\s+/)[0] || '';
  if (token.length < 2) return false;
  const pattern = new RegExp(
    `(^|[^\\p{L}\\p{N}_])@${escapeRegExp(token)}(?![\\p{L}\\p{N}_])`,
    'u',
  );
  return pattern.test(text);
}

/** Oda listesi önizlemesi — spoiler içeriği sızdırmaz. */
export function previewChatText(raw: string, max = 80): string {
  const withoutSpoilers = (raw || '').replace(/\|\|([\s\S]*?)\|\|/g, '•••');
  const compact = withoutSpoilers.replace(/\s+/g, ' ').trim();
  return compact.length > max ? `${compact.slice(0, Math.max(0, max - 1))}…` : compact;
}

/** Firestore'dan gelen (veya bozuk) alıntıyı güvenli biçime indirger. */
export function normalizeReplyRef(value: unknown): ChatReplyRef | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const id = typeof record.id === 'string' ? record.id.trim() : '';
  const name = typeof record.name === 'string' ? record.name.replace(/\s+/g, ' ').trim() : '';
  const text = typeof record.text === 'string' ? record.text.replace(/\s+/g, ' ').trim() : '';
  if (!id || !text) return null;
  return {
    id,
    name: (name || '?').slice(0, CHAT_REPLY_NAME_MAX),
    text: text.slice(0, CHAT_REPLY_TEXT_MAX),
  };
}

export function buildReplyRef(message: Pick<ChatMessage, 'id' | 'name' | 'text'>): ChatReplyRef {
  return {
    id: message.id,
    name: (message.name || '?').slice(0, CHAT_REPLY_NAME_MAX),
    text: (message.text || '').replace(/\s+/g, ' ').trim().slice(0, CHAT_REPLY_TEXT_MAX),
  };
}
