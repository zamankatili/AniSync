import type { ChatMessage } from './chatTypes';
import { mentionsName } from './chatText';
import { toDateSafe } from './utils';

/** Aynı kullanıcının art arda mesajları bu aralıkta gruplanır. */
export const CHAT_GROUP_GAP_MS = 5 * 60 * 1000;

export type ChatTimelineItem =
  | { type: 'day'; key: string; label: string }
  | { type: 'new'; key: string; count: number }
  | {
      type: 'msg';
      key: string;
      msg: ChatMessage;
      showHeader: boolean;
      isGroupEnd: boolean;
      own: boolean;
      mentionsMe: boolean;
      createdIso: string | null;
    };

export interface ChatTimelineOptions {
  lastVisit?: number;
  showNewDivider?: boolean;
  myUid?: string | null;
  myName?: string | null;
  dayLabel: (date: Date | null) => string;
}

const localDayKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const isOwnMessage = (msg: ChatMessage, myUid?: string | null): boolean =>
  !!msg.isLocal || msg.uid === 'anon' || (!!myUid && msg.uid === myUid);

/**
 * Mesajları gün ayırıcıları, "son ziyaretinden beri" çizgisi ve gruplama
 * bilgisiyle birlikte tek bir zaman çizelgesine çevirir.
 */
export function buildChatTimeline(
  messages: ChatMessage[],
  options: ChatTimelineOptions,
): ChatTimelineItem[] {
  const lastVisit = options.lastVisit ?? 0;
  const showNewDivider = options.showNewDivider !== false;

  const entries = messages
    .map((msg, index) => {
      const date = toDateSafe(msg.createdAt);
      return { msg, index, date, ms: date ? date.getTime() : 0 };
    })
    .sort((a, b) => a.ms - b.ms || a.index - b.index);

  const dayKeys = entries.map((entry) => (entry.date ? localDayKey(entry.date) : 'unknown'));
  const newDividerIndex =
    showNewDivider && lastVisit > 0
      ? entries.findIndex((entry) => entry.date !== null && entry.ms > lastVisit)
      : -1;

  const dividerBefore = entries.map((_, index) => {
    if (index === 0) return true;
    return dayKeys[index] !== dayKeys[index - 1] || index === newDividerIndex;
  });

  const items: ChatTimelineItem[] = [];

  entries.forEach((entry, index) => {
    const { msg, date, ms } = entry;

    if (index === 0 || dayKeys[index] !== dayKeys[index - 1]) {
      const label = options.dayLabel(date);
      if (label) {
        items.push({ type: 'day', key: `day-${dayKeys[index]}`, label });
      }
    }

    if (index === newDividerIndex) {
      items.push({
        type: 'new',
        key: 'new-since-last-visit',
        count: entries.length - index,
      });
    }

    const previous = index > 0 ? entries[index - 1] : undefined;
    const next = entries[index + 1];
    const own = isOwnMessage(msg, options.myUid);

    const showHeader =
      !previous ||
      dividerBefore[index] ||
      previous.msg.uid !== msg.uid ||
      ms - previous.ms > CHAT_GROUP_GAP_MS;

    const isGroupEnd =
      !next ||
      dividerBefore[index + 1] ||
      next.msg.uid !== msg.uid ||
      next.ms - ms > CHAT_GROUP_GAP_MS;

    items.push({
      type: 'msg',
      key: msg.id,
      msg,
      showHeader,
      isGroupEnd,
      own,
      mentionsMe: !own && mentionsName(msg.text, options.myName),
      createdIso: date ? date.toISOString() : null,
    });
  });

  return items;
}
