import { describe, expect, it } from 'vitest';
import { clearChatDraft, readChatDraft, writeChatDraft } from './chatDrafts';
import type { ChatStorageLike } from './chatOverview';

const memoryStorage = (initial: Record<string, string> = {}) => {
  const map: Record<string, string> = { ...initial };
  const storage: ChatStorageLike = {
    getItem: (key) => (key in map ? map[key] : null),
    setItem: (key, value) => {
      map[key] = value;
    },
  };
  return { storage, map };
};

describe('chat drafts', () => {
  it('stores drafts per room', () => {
    const { storage } = memoryStorage();
    writeChatDraft('genel', 'yarıda kalan cümle', storage);
    writeChatDraft('muzik', 'lofi önerisi', storage);
    expect(readChatDraft('genel', storage)).toBe('yarıda kalan cümle');
    expect(readChatDraft('muzik', storage)).toBe('lofi önerisi');
    expect(readChatDraft('yok', storage)).toBe('');
  });

  it('caps drafts at the message limit', () => {
    const { storage } = memoryStorage();
    writeChatDraft('genel', 'x'.repeat(400), storage);
    expect(readChatDraft('genel', storage)).toHaveLength(250);
  });

  it('removes a draft when the text is emptied', () => {
    const { storage, map } = memoryStorage();
    writeChatDraft('genel', 'taslak', storage);
    writeChatDraft('genel', '   ', storage);
    expect(readChatDraft('genel', storage)).toBe('');
    expect(map['anisync_chat_drafts_v1']).toBe('{}');
  });

  it('clears a draft explicitly', () => {
    const { storage } = memoryStorage();
    writeChatDraft('genel', 'taslak', storage);
    clearChatDraft('genel', storage);
    expect(readChatDraft('genel', storage)).toBe('');
  });

  it('ignores malformed stored JSON', () => {
    const { storage } = memoryStorage({ 'anisync_chat_drafts_v1': '{not json' });
    expect(readChatDraft('genel', storage)).toBe('');
    writeChatDraft('genel', 'yeni', storage);
    expect(readChatDraft('genel', storage)).toBe('yeni');
  });

  it('survives a storage that throws', () => {
    const storage: ChatStorageLike = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(readChatDraft('genel', storage)).toBe('');
    expect(() => writeChatDraft('genel', 'x', storage)).not.toThrow();
    expect(() => clearChatDraft('genel', storage)).not.toThrow();
  });
});
