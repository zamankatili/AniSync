import { describe, expect, it } from 'vitest';
import {
  buildReplyRef,
  isSafeHttpUrl,
  mentionsName,
  normalizeReplyRef,
  parseChatText,
  previewChatText,
} from './chatText';

describe('parseChatText', () => {
  it('returns plain text as a single segment', () => {
    expect(parseChatText('selam köşe')).toEqual([{ kind: 'text', text: 'selam köşe' }]);
  });

  it('returns nothing for empty input', () => {
    expect(parseChatText('')).toEqual([]);
    expect(parseChatText(undefined as unknown as string)).toEqual([]);
  });

  it('extracts spoilers between double pipes', () => {
    expect(parseChatText('önce ||gizli|| sonra')).toEqual([
      { kind: 'text', text: 'önce ' },
      { kind: 'spoiler', text: 'gizli' },
      { kind: 'text', text: ' sonra' },
    ]);
  });

  it('keeps an unclosed spoiler visible as text', () => {
    expect(parseChatText('açık ||kapanmadı')).toEqual([
      { kind: 'text', text: 'açık ||kapanmadı' },
    ]);
  });

  it('keeps an empty spoiler marker as text', () => {
    expect(parseChatText('a |||| b')).toEqual([{ kind: 'text', text: 'a |||| b' }]);
  });

  it('linkifies http(s) URLs and leaves trailing punctuation outside', () => {
    expect(parseChatText('bak https://example.com/x.')).toEqual([
      { kind: 'text', text: 'bak ' },
      { kind: 'link', text: 'https://example.com/x', href: 'https://example.com/x' },
      { kind: 'text', text: '.' },
    ]);
  });

  it('keeps balanced parentheses inside a URL', () => {
    const url = 'https://example.com/a_(b)';
    expect(parseChatText(`${url}.`)[0]).toEqual({ kind: 'link', text: url, href: url });
  });

  it('never linkifies non-http schemes', () => {
    expect(parseChatText('javascript:alert(1)')).toEqual([
      { kind: 'text', text: 'javascript:alert(1)' },
    ]);
  });

  it('marks mentions but not e-mail addresses', () => {
    expect(parseChatText('hey @semih')).toEqual([
      { kind: 'text', text: 'hey ' },
      { kind: 'mention', text: '@semih' },
    ]);
    expect(parseChatText('mail: a@b.com')).toEqual([{ kind: 'text', text: 'mail: a@b.com' }]);
  });

  it('does not linkify or mention inside a spoiler', () => {
    expect(parseChatText('||@semih https://example.com||')).toEqual([
      { kind: 'spoiler', text: '@semih https://example.com' },
    ]);
  });
});

describe('mentionsName', () => {
  it('matches the first token of a display name', () => {
    expect(mentionsName('selam @Misafir naber', 'Misafir 3')).toBe(true);
  });

  it('does not match a prefix of a longer handle', () => {
    expect(mentionsName('@semihcan', 'semih')).toBe(false);
  });

  it('is case-insensitive and rejects empty names', () => {
    expect(mentionsName('@SEMIH', 'semih')).toBe(true);
    expect(mentionsName('@semih', '')).toBe(false);
  });
});

describe('previewChatText', () => {
  it('hides spoiler content from room previews', () => {
    expect(previewChatText('final ||ölen karakter|| belli')).toBe('final ••• belli');
  });

  it('collapses whitespace and truncates', () => {
    expect(previewChatText('a\n\n  b   c', 4)).toBe('a b…');
  });
});

describe('reply refs', () => {
  it('normalizes and clamps a reply from Firestore', () => {
    const long = 'x'.repeat(400);
    const result = normalizeReplyRef({ id: 'abc', name: ' Ada ', text: long });
    expect(result?.id).toBe('abc');
    expect(result?.name).toBe('Ada');
    expect(result?.text).toHaveLength(140);
  });

  it('rejects malformed replies', () => {
    expect(normalizeReplyRef(null)).toBeNull();
    expect(normalizeReplyRef({})).toBeNull();
    expect(normalizeReplyRef({ id: 'a' })).toBeNull();
    expect(normalizeReplyRef({ id: '', text: 'x' })).toBeNull();
  });

  it('builds a reply ref from a message', () => {
    expect(buildReplyRef({ id: 'm1', name: 'Ada', text: '  satır\niki ' })).toEqual({
      id: 'm1',
      name: 'Ada',
      text: 'satır iki',
    });
  });
});

describe('isSafeHttpUrl', () => {
  it('accepts only http(s)', () => {
    expect(isSafeHttpUrl('https://example.com')).toBe(true);
    expect(isSafeHttpUrl('http://example.com')).toBe(true);
    expect(isSafeHttpUrl('ftp://example.com')).toBe(false);
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeHttpUrl('not a url')).toBe(false);
  });
});
