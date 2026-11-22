import { describe, expect, it } from 'vitest';
import { buildChatTimeline, CHAT_GROUP_GAP_MS } from './chatTimeline';
import type { ChatMessage } from './chatTypes';

const at = (day: number, hour: number, minute: number): Date => new Date(2026, 0, day, hour, minute, 0, 0);

const message = (
  id: string,
  uid: string,
  text: string,
  createdAt: Date,
  extra: Partial<ChatMessage> = {},
): ChatMessage => ({
  id,
  uid,
  name: uid,
  avatar: '',
  text,
  createdAt,
  ...extra,
});

const dayLabel = (date: Date | null): string =>
  date ? `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}` : '';

const types = (items: ReturnType<typeof buildChatTimeline>) => items.map((item) => item.type);

describe('buildChatTimeline', () => {
  it('inserts a day divider when the calendar day changes', () => {
    const items = buildChatTimeline(
      [
        message('a', 'u1', 'late', at(10, 23, 50)),
        message('b', 'u1', 'after midnight', at(11, 0, 10)),
      ],
      { dayLabel },
    );

    expect(types(items)).toEqual(['day', 'msg', 'day', 'msg']);
    expect(items.filter((item) => item.type === 'day')).toHaveLength(2);
  });

  it('groups consecutive messages from the same author and splits on gaps', () => {
    const items = buildChatTimeline(
      [
        message('a', 'u1', 'one', at(10, 12, 0)),
        message('b', 'u1', 'two', at(10, 12, 3)),
        message('c', 'u2', 'three', at(10, 12, 4)),
        message('d', 'u1', 'later', at(10, 12, 30)),
      ],
      { dayLabel },
    );

    const msgs = items.flatMap((item) => (item.type === 'msg' ? [item] : []));
    expect(msgs.map((item) => item.showHeader)).toEqual([true, false, true, true]);
    expect(msgs.map((item) => item.isGroupEnd)).toEqual([false, true, true, true]);
  });

  it('splits groups when the gap exceeds the grouping window', () => {
    const items = buildChatTimeline(
      [
        message('a', 'u1', 'one', at(10, 12, 0)),
        message('b', 'u1', 'two', new Date(at(10, 12, 0).getTime() + CHAT_GROUP_GAP_MS + 1)),
      ],
      { dayLabel },
    );
    const msgs = items.flatMap((item) => (item.type === 'msg' ? [item] : []));
    expect(msgs.map((item) => item.showHeader)).toEqual([true, true]);
  });

  it('places the since-last-visit divider at the first new message', () => {
    const items = buildChatTimeline(
      [
        message('a', 'u1', 'old', at(10, 12, 0)),
        message('b', 'u1', 'new', at(10, 12, 3)),
        message('c', 'u2', 'newer', at(10, 12, 4)),
      ],
      { dayLabel, lastVisit: at(10, 12, 1).getTime() },
    );

    expect(types(items)).toEqual(['day', 'msg', 'new', 'msg', 'msg']);
    const divider = items.find((item) => item.type === 'new');
    expect(divider && divider.type === 'new' ? divider.count : 0).toBe(2);
  });

  it('can suppress the since-last-visit divider (search mode)', () => {
    const items = buildChatTimeline(
      [message('a', 'u1', 'old', at(10, 12, 0)), message('b', 'u1', 'new', at(10, 12, 3))],
      { dayLabel, lastVisit: at(10, 12, 1).getTime(), showNewDivider: false },
    );
    expect(types(items)).not.toContain('new');
  });

  it('marks own, guest and local messages', () => {
    const items = buildChatTimeline(
      [
        message('a', 'u1', 'mine', at(10, 12, 0)),
        message('b', 'anon', 'guest', at(10, 12, 1)),
        message('c', 'local', 'local', at(10, 12, 2), { isLocal: true }),
        message('d', 'u2', 'other', at(10, 12, 3)),
      ],
      { dayLabel, myUid: 'u1' },
    );
    const msgs = items.flatMap((item) => (item.type === 'msg' ? [item] : []));
    expect(msgs.map((item) => item.own)).toEqual([true, true, true, false]);
  });

  it('flags messages that mention the current user, but not own messages', () => {
    const items = buildChatTimeline(
      [message('a', 'u2', 'hey @Ada', at(10, 12, 0)), message('b', 'u1', 'me @Ada', at(10, 12, 1))],
      { dayLabel, myUid: 'u1', myName: 'Ada' },
    );
    const msgs = items.flatMap((item) => (item.type === 'msg' ? [item] : []));
    expect(msgs.map((item) => item.mentionsMe)).toEqual([true, false]);
  });

  it('handles invalid timestamps without crashing', () => {
    const items = buildChatTimeline(
      [message('a', 'u1', 'no date', null as unknown as Date)],
      { dayLabel },
    );
    expect(items).toHaveLength(1);
    expect(items[0].type).toBe('msg');
    if (items[0].type === 'msg') {
      expect(items[0].createdIso).toBeNull();
    }
  });

  it('sorts out-of-order snapshots by time', () => {
    const items = buildChatTimeline(
      [message('b', 'u1', 'second', at(10, 12, 2)), message('a', 'u1', 'first', at(10, 12, 1))],
      { dayLabel },
    );
    const ids = items.flatMap((item) => (item.type === 'msg' ? [item.msg.id] : []));
    expect(ids).toEqual(['a', 'b']);
  });
});
