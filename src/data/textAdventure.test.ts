import { describe, expect, it } from 'vitest';
import {
  ADVENTURE_ENDINGS,
  ADVENTURE_ITEMS,
  ADVENTURE_ROOMS,
  DIRECTION_LABELS,
  PROGRESS_FLAGS,
  TA_FIXTURES,
  TA_HELP,
  TA_HINTS,
  TA_INTRO,
  TA_QUICK_COMMANDS,
  TA_SOLUTION,
  TA_TEXT,
  VERB_ALIASES,
  type Localized,
} from './textAdventure';

const LANGS = ['tr', 'en', 'ja', 'fr'] as const;

const expectLocalized = (value: Localized, label: string) => {
  for (const lang of LANGS) {
    expect(value[lang], `${label} (${lang})`).toBeTruthy();
    expect(value[lang].trim().length, `${label} (${lang}) is not empty`).toBeGreaterThan(0);
  }
};

describe('textAdventure content', () => {
  it('has complete four-language rooms', () => {
    expect(ADVENTURE_ROOMS.length).toBeGreaterThanOrEqual(6);
    for (const room of ADVENTURE_ROOMS) {
      expectLocalized(room.name, `room ${room.id} name`);
      expectLocalized(room.desc, `room ${room.id} desc`);
      if (room.darkDesc) expectLocalized(room.darkDesc, `room ${room.id} darkDesc`);
    }
  });

  it('has complete four-language items, endings, hints and UI text', () => {
    for (const item of ADVENTURE_ITEMS) {
      expectLocalized(item.name, `item ${item.id} name`);
      expectLocalized(item.desc, `item ${item.id} desc`);
      expect(item.aliases.length, `item ${item.id} aliases`).toBeGreaterThan(0);
    }
    for (const ending of ADVENTURE_ENDINGS) {
      expectLocalized(ending.title, `ending ${ending.id} title`);
      expectLocalized(ending.text, `ending ${ending.id} text`);
    }
    for (const [index, hint] of TA_HINTS.entries()) {
      expectLocalized(hint, `hint ${index}`);
    }
    for (const [key, value] of Object.entries(TA_FIXTURES)) {
      expectLocalized(value, `fixture ${key}`);
    }
    for (const [key, value] of Object.entries(TA_TEXT)) {
      expectLocalized(value, `text ${key}`);
    }
    for (const [key, value] of Object.entries(DIRECTION_LABELS)) {
      expectLocalized(value, `direction ${key}`);
    }
    for (const chip of TA_QUICK_COMMANDS) {
      expectLocalized(chip.label, `quick command ${chip.command}`);
      expect(chip.command.trim().length).toBeGreaterThan(0);
    }
    expectLocalized(TA_INTRO, 'intro');
    expectLocalized(TA_HELP, 'help');
    expectLocalized(TA_SOLUTION, 'solution');
  });

  it('uses unique room, item and ending ids', () => {
    const ids = (entries: { id: string }[]) => entries.map((entry) => entry.id);
    for (const list of [ids(ADVENTURE_ROOMS), ids(ADVENTURE_ITEMS), ids(ADVENTURE_ENDINGS)]) {
      expect(new Set(list).size, `duplicate id in ${list.join(',')}`).toBe(list.length);
    }
  });

  it('points every exit at an existing room and keeps the map reachable', () => {
    const roomIds = new Set(ADVENTURE_ROOMS.map((room) => room.id));
    for (const room of ADVENTURE_ROOMS) {
      for (const [direction, target] of Object.entries(room.exits)) {
        expect(target, `${room.id}.${direction}`).toBeTruthy();
        expect(roomIds.has(target as string), `${room.id}.${direction} → ${target}`).toBe(true);
      }
    }

    const seen = new Set<string>(['club']);
    const queue = ['club'];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const current = ADVENTURE_ROOMS.find((room) => room.id === currentId);
      for (const target of Object.values(current?.exits ?? {})) {
        if (target && !seen.has(target)) {
          seen.add(target);
          queue.push(target);
        }
      }
    }
    expect([...seen].sort()).toEqual([...roomIds].sort());
  });

  it('places every item somewhere or unlocks it through a puzzle', () => {
    const itemIds = new Set(ADVENTURE_ITEMS.map((item) => item.id));
    const placed = new Set<string>();
    for (const room of ADVENTURE_ROOMS) {
      for (const item of room.items) {
        expect(itemIds.has(item), `${room.id} references unknown item ${item}`).toBe(true);
        expect(placed.has(item), `${item} is placed twice`).toBe(false);
        placed.add(item);
      }
    }
    // coin/battery/bulb/old_key zinciri odalarda değil, bulmacalarla açılır.
    expect(placed.has('tape')).toBe(true);
    expect(placed.has('note')).toBe(true);
    expect(placed.has('flashlight')).toBe(true);
    expect(placed.has('screwdriver')).toBe(true);
  });

  it('has exactly three distinct endings and a progress flag set', () => {
    expect(ADVENTURE_ENDINGS.map((ending) => ending.id).sort()).toEqual(['erase', 'keep', 'leave']);
    expect(PROGRESS_FLAGS.length).toBeGreaterThanOrEqual(8);
    expect(new Set(PROGRESS_FLAGS).size).toBe(PROGRESS_FLAGS.length);
  });

  it('maps every verb alias to a known canonical verb', () => {
    const canonical = new Set([
      'look', 'go', 'take', 'drop', 'use', 'open', 'talk', 'inventory', 'help',
      'hint', 'map', 'save', 'load', 'restart', 'code', 'keep', 'erase',
    ]);
    for (const [alias, verb] of Object.entries(VERB_ALIASES)) {
      expect(canonical.has(verb), `${alias} → ${verb}`).toBe(true);
    }
  });
});
