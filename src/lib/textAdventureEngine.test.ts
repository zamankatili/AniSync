import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ADVENTURE_ENDINGS,
  TA_HINTS,
  TA_SOLUTION,
  TA_TEXT,
  type Lang4,
} from '../data/textAdventure';
import {
  ADVENTURE_SAVE_KEY,
  createInitialState,
  describeRoom,
  executeCommand,
  getHint,
  getProgress,
  loadAdventure,
  clearAdventureSave,
  type AdventureState,
} from './textAdventureEngine';

const BASE_WALKTHROUGH = [
  'al fener',
  'al tornavida',
  'git doğu',
  'al bozuk para',
  'kullan bozuk para',
  'git doğu',
  'kullan tornavida',
  'kullan tornavida',
  'git batı',
  'git kuzey',
  'kullan pil',
  'al kaset',
  'al not',
  'git güney',
  'git güney',
  'kullan ampul',
  'kullan kaset',
  'kullan eski anahtar',
  'git yukarı',
  'şifre 471',
  'git kuzey',
];

const play = (commands: string[], lang: Lang4 = 'tr'): { state: AdventureState; lastText: string } => {
  let state = createInitialState();
  let lastText = '';
  for (const command of commands) {
    const result = executeCommand(state, command, lang);
    state = result.state;
    lastText = result.lines.map((line) => line.text).join('\n');
  }
  return { state, lastText };
};

const installStorage = () => {
  const map = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => void map.set(key, String(value)),
    removeItem: (key: string) => void map.delete(key),
    clear: () => map.clear(),
  };
  vi.stubGlobal('window', { localStorage });
  return map;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('textAdventureEngine', () => {
  it('starts in the club room with the expected items', () => {
    const state = createInitialState();
    expect(state.roomId).toBe('club');
    expect(state.inventory).toEqual([]);
    expect(state.ending).toBeNull();
    expect(state.ground.club).toEqual(['flashlight', 'screwdriver']);
    expect(getProgress(state)).toBe(0);
  });

  it('completes the full walkthrough and reaches the keep ending', () => {
    const { state } = play([...BASE_WALKTHROUGH, 'sakla']);
    expect(state.ending).toBe('keep');
    expect(getProgress(state)).toBe(100);
    expect(state.roomId).toBe('exit');
  });

  it('reaches the erase ending', () => {
    const { state, lastText } = play([...BASE_WALKTHROUGH, 'sil']);
    expect(state.ending).toBe('erase');
    expect(lastText).toContain(ADVENTURE_ENDINGS.find((entry) => entry.id === 'erase')!.title.tr);
  });

  it('reaches the leave ending by dropping the tape in the exit hall', () => {
    const { state } = play([...BASE_WALKTHROUGH, 'bırak kaset']);
    expect(state.ending).toBe('leave');
  });

  it('blocks the staircase before finding the old key', () => {
    const commands = [
      'al fener', 'al tornavida', 'git doğu', 'git güney',
    ];
    const { state, lastText } = play([...commands, 'git yukarı']);
    expect(state.roomId).toBe('screening');
    expect(lastText).toContain(TA_TEXT.boothNeedKey.tr);
  });

  it('keeps the archive dark until the flashlight works', () => {
    const beforeLight = play(['al fener', 'git doğu', 'git kuzey']);
    expect(beforeLight.state.roomId).toBe('archive');
    expect(beforeLight.lastText).toContain('zifiri karanlık');
    const roomLines = describeRoom(beforeLight.state, 'tr').map((line) => line.text).join('\n');
    expect(roomLines).toContain('zifiri karanlık');

    const takeResult = executeCommand(beforeLight.state, 'al kaset', 'tr');
    expect(takeResult.state.inventory).not.toContain('tape');
    expect(takeResult.lines.map((line) => line.text).join('\n')).toContain(TA_TEXT.dark.tr);

    const withLight = play(['al fener', 'git doğu', 'al bozuk para', 'kullan bozuk para', 'git kuzey', 'kullan pil', 'al kaset']);
    expect(withLight.state.inventory).toContain('tape');
    expect(withLight.state.flags).toContain('light_on');
  });

  it('understands Turkish suffixes, English, Japanese and French commands', () => {
    const tr = executeCommand(createInitialState(), 'al feneri', 'tr');
    expect(tr.state.inventory).toContain('flashlight');

    const en = executeCommand(createInitialState(), 'take screwdriver', 'en');
    expect(en.state.inventory).toContain('screwdriver');

    const ja = executeCommand(createInitialState(), '取る 懐中電灯', 'ja');
    expect(ja.state.inventory).toContain('flashlight');
    const jaMove = executeCommand(createInitialState(), '東', 'ja');
    expect(jaMove.state.roomId).toBe('corridor');

    const fr = executeCommand(createInitialState(), 'prendre lampe torche', 'fr');
    expect(fr.state.inventory).toContain('flashlight');
    const frMove = executeCommand(createInitialState(), 'aller est', 'fr');
    expect(frMove.state.roomId).toBe('corridor');
  });

  it('opens the crate and locker only with the screwdriver', () => {
    const inStorage = play(['git doğu', 'git doğu']);
    const withoutTool = executeCommand(inStorage.state, 'kullan sandık', 'tr');
    expect(withoutTool.state.flags).not.toContain('crate_open');
    expect(withoutTool.lines.map((line) => line.text).join('\n')).toContain(TA_TEXT.crateNeedTool.tr);

    const withTool = play(['al tornavida', 'git doğu', 'git doğu', 'kullan tornavidayı sandığa']);
    expect(withTool.state.flags).toContain('crate_open');
    expect(withTool.state.inventory).toContain('bulb');

    const locker = executeCommand(withTool.state, 'kullan tornavida', 'tr');
    expect(locker.state.flags).toContain('locker_open');
    expect(locker.state.inventory).toContain('old_key');
  });

  it('rejects a wrong terminal code and accepts 471', () => {
    const inBooth = play([
      ...BASE_WALKTHROUGH.slice(0, -2),
    ]);
    expect(inBooth.state.roomId).toBe('booth');

    const wrong = executeCommand(inBooth.state, 'şifre 123', 'tr');
    expect(wrong.state.flags).not.toContain('exit_unlocked');
    expect(wrong.lines.map((line) => line.text).join('\n')).toContain(TA_TEXT.terminalBad.tr);

    const ok = executeCommand(inBooth.state, 'şifre 471', 'tr');
    expect(ok.state.flags).toContain('exit_unlocked');
  });

  it('gives a contextual hint first and the full solution second', () => {
    const state = createInitialState();
    expect(getHint(state, 'tr')).toBe(TA_HINTS[0].tr);

    const first = executeCommand(state, 'ipucu', 'tr');
    expect(first.state.hintLevel).toBe(1);
    expect(first.lines[0].text).toBe(TA_HINTS[0].tr);

    const second = executeCommand(first.state, 'ipucu', 'tr');
    expect(second.lines[0].text).toBe(TA_SOLUTION.tr);
  });

  it('reports inventory, map, help and unknown commands without throwing', () => {
    const inventory = executeCommand(createInitialState(), 'envanter', 'tr');
    expect(inventory.lines[0].text).toBe(TA_TEXT.inventoryEmpty.tr);

    const map = executeCommand(createInitialState(), 'harita', 'tr');
    expect(map.lines[0].text).toContain(TA_TEXT.mapTitle.tr);

    const help = executeCommand(createInitialState(), 'yardım', 'tr');
    expect(help.lines[0].text.length).toBeGreaterThan(20);

    const unknown = executeCommand(createInitialState(), 'florble', 'tr');
    expect(unknown.lines[0].kind).toBe('error');
    expect(unknown.lines[0].text).toBe(TA_TEXT.notUnderstood.tr);
  });

  it('does not mutate the previous state object', () => {
    const state = createInitialState();
    const snapshot = JSON.parse(JSON.stringify(state));
    executeCommand(state, 'al fener', 'tr');
    expect(state).toEqual(snapshot);
  });

  it('saves and loads progress through localStorage', () => {
    installStorage();
    const played = play(['al fener', 'git doğu', 'al bozuk para', 'kullan bozuk para', 'git kuzey', 'kullan pil']);
    const saveResult = executeCommand(played.state, 'kaydet', 'tr');
    expect(saveResult.lines[0].text).toBe(TA_TEXT.saveOk.tr);

    const loaded = loadAdventure();
    expect(loaded).not.toBeNull();
    expect(loaded!.roomId).toBe('archive');
    expect(loaded!.inventory).toContain('flashlight');
    expect(loaded!.flags).toContain('light_on');

    const moved = executeCommand(played.state, 'git güney', 'tr').state;
    const loadResult = executeCommand(moved, 'yükle', 'tr');
    expect(loadResult.state.roomId).toBe('archive');
    expect(loadResult.lines[0].text).toBe(TA_TEXT.loadOk.tr);
  });

  it('reports a missing or corrupted save instead of crashing', () => {
    const map = installStorage();
    expect(loadAdventure()).toBeNull();
    const missing = executeCommand(createInitialState(), 'yükle', 'tr');
    expect(missing.lines[0].text).toBe(TA_TEXT.noSave.tr);

    map.set(ADVENTURE_SAVE_KEY, '{not json');
    expect(loadAdventure()).toBeNull();

    map.set(ADVENTURE_SAVE_KEY, JSON.stringify({ roomId: 'nowhere', inventory: [], flags: [] }));
    expect(loadAdventure()).toBeNull();

    clearAdventureSave();
    expect(map.has(ADVENTURE_SAVE_KEY)).toBe(false);
  });

  it('locks commands after an ending until restart', () => {
    const ended = play([...BASE_WALKTHROUGH, 'sakla']);
    const locked = executeCommand(ended.state, 'bak', 'tr');
    expect(locked.lines[0].text).toBe(TA_TEXT.alreadyEnded.tr);

    const restarted = executeCommand(ended.state, 'yeniden', 'tr');
    expect(restarted.state.ending).toBeNull();
    expect(restarted.state.roomId).toBe('club');
    expect(restarted.state.inventory).toEqual([]);
  });
});
