import {
  ADVENTURE_ENDINGS,
  ADVENTURE_ITEMS,
  ADVENTURE_ROOMS,
  DIRECTION_ALIASES,
  DIRECTION_LABELS,
  PROGRESS_FLAGS,
  TA_FIXTURES,
  TA_HELP,
  TA_HINTS,
  TA_INTRO,
  TA_SOLUTION,
  TA_TEXT,
  VERB_ALIASES,
  getLocalized,
  type Direction,
  type Lang4,
  type Localized,
} from '../data/textAdventure';

/**
 * "Kayıp Bölüm" motoru — saf, test edilebilir komut yorumlayıcı.
 *
 * Tasarım kararları:
 *  - Küçük fiil seti ve ekranda görünen komutlar (yeni başlayan dostu).
 *  - Tek harfli yönler, "nesne" tek başına yazılınca inceleme.
 *  - Yardım istendiğinde önce bağlama uygun ipucu, ikinci istekte açık çözüm.
 *  - Metinlerin tamamı `textAdventure.ts` içinde dört dilde.
 */

export const ADVENTURE_SAVE_KEY = 'anisync_text_adventure_save_v1';

export type AdventureLineKind = 'room' | 'text' | 'system' | 'ending' | 'error';

export interface AdventureLine {
  kind: AdventureLineKind;
  text: string;
}

export interface AdventureState {
  roomId: string;
  inventory: string[];
  flags: string[];
  /** Her odada yerde duran eşyalar. Alınca çıkar, bırakınca eklenir. */
  ground: Record<string, string[]>;
  moves: number;
  hintLevel: number;
  ending: string | null;
  visited: string[];
}

export interface CommandResult {
  state: AdventureState;
  lines: AdventureLine[];
}

export interface ParsedCommand {
  verb: string;
  target: string;
}

const FIXTURE_ALIASES: Record<string, string[]> = {
  vending: ['otomat', 'otomatı', 'otomata', 'otomatın', 'makine', 'vending', 'machine', '自動販売機', '自販機', 'distributeur'],
  crate: ['sandık', 'sandığı', 'sandığa', 'sandığın', 'kasa', 'crate', 'box', '木箱', 'caisse'],
  locker: ['dolap', 'dolabı', 'dolaba', 'dolabın', 'locker', 'cupboard', 'ロッカー', 'armoire', 'placard'],
  projector: ['projektör', 'projektörü', 'projektöre', 'projektörün', 'projector', '映写機', 'projecteur'],
  terminal: ['terminal', 'terminali', 'terminale', 'bilgisayar', 'computer', '端末', 'コンピューター'],
  door: ['kapı', 'kapıyı', 'kapıya', 'door', '扉', 'porte'],
  ghost: ['bekçi', 'bekçiye', 'bekçiyle', 'hayalet', 'hayaleti', 'projectionist', 'ghost', '案内人', '映写技師', 'projectionniste', 'fantôme'],
};

const LEADING_WORDS = new Set(['at', 'the', 'a', 'an', 'bir', 'şu', 'su', 'le', 'la', 'les', 'des', 'du', 'de']);
const USE_SEPARATORS = [' on ', ' üzerine ', ' üzerinde ', ' ile ', ' sur ', ' avec '];

const roomById = (id: string) => ADVENTURE_ROOMS.find((room) => room.id === id);
const itemById = (id: string) => ADVENTURE_ITEMS.find((item) => item.id === id);
const l = (value: Localized, lang: Lang4): string => getLocalized(value, lang);

const hasFlag = (state: AdventureState, flag: string): boolean => state.flags.includes(flag);

const setFlag = (state: AdventureState, flag: string): void => {
  if (!hasFlag(state, flag)) state.flags.push(flag);
};

const addItem = (state: AdventureState, id: string): void => {
  if (!state.inventory.includes(id)) state.inventory.push(id);
};

const removeItem = (state: AdventureState, id: string): void => {
  state.inventory = state.inventory.filter((entry) => entry !== id);
};

const line = (kind: AdventureLineKind, text: string): AdventureLine => ({ kind, text });

const normalize = (input: string, lang: Lang4): string => {
  const locale = lang === 'tr' ? 'tr-TR' : lang === 'ja' ? 'ja-JP' : lang === 'fr' ? 'fr-FR' : 'en-US';
  return input
    .toLocaleLowerCase(locale)
    .replace(/[.,!?;:…"'“”‘’]/g, ' ')
    .replace(/[。、！？：；「」『』]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const containsAlias = (text: string, alias: string): boolean => {
  if (!alias) return false;
  if (/[\u3040-\u30ff\u4e00-\u9fff]/.test(alias)) return text.includes(alias);

  // Türkçe/Fransızca çekim ekleri: "feneri", "parayı", "sandığa", "cassette"
  // gibi girdilerde kök eşleşmesi yeterli olsun diye kelime başlangıcına da bak.
  const tokens = text.split(' ').filter(Boolean);
  return alias
    .split(' ')
    .filter(Boolean)
    .every((aliasWord) =>
      tokens.some((token) => token === aliasWord || (aliasWord.length >= 3 && token.startsWith(aliasWord))),
    );
};

const matchesAny = (text: string, aliases: string[]): boolean =>
  aliases.some((alias) => containsAlias(text, alias));

export const findItem = (text: string, lang: Lang4): string | null => {
  if (!text) return null;
  const normalized = normalize(text, lang);
  for (const item of ADVENTURE_ITEMS) {
    const aliases = [...item.aliases, normalize(l(item.name, lang), lang)];
    if (matchesAny(normalized, aliases)) return item.id;
  }
  return null;
};

export const findFixture = (text: string, lang: Lang4): string | null => {
  if (!text) return null;
  const normalized = normalize(text, lang);
  for (const [id, aliases] of Object.entries(FIXTURE_ALIASES)) {
    if (matchesAny(normalized, aliases)) return id;
  }
  return null;
};

export const findDirection = (text: string): Direction | null => {
  for (const token of text.split(' ').filter(Boolean)) {
    const direction = DIRECTION_ALIASES[token];
    if (direction) return direction;
  }
  return null;
};

const cleanTarget = (target: string): string => {
  const parts = target.split(' ').filter(Boolean);
  while (parts.length > 1 && LEADING_WORDS.has(parts[0])) parts.shift();
  return parts.join(' ');
};

const splitTwoTargets = (target: string): [string, string | null] => {
  const padded = ` ${target} `;
  for (const separator of USE_SEPARATORS) {
    const index = padded.indexOf(separator);
    if (index >= 0) {
      const left = padded.slice(0, index).trim();
      const right = padded.slice(index + separator.length).trim();
      return [left, right || null];
    }
  }
  // Japonca "XにY" kalıbı için son çare: ilk "に" ayırıcıdır.
  if (target.includes('に')) {
    const [left, right] = target.split('に');
    if (left && right) return [left.trim(), right.trim()];
  }
  return [target, null];
};

export const parseCommand = (input: string, lang: Lang4): ParsedCommand => {
  const text = normalize(input, lang);
  if (!text) return { verb: '', target: '' };
  const [first, ...rest] = text.split(' ');
  const directVerb = VERB_ALIASES[first];
  if (directVerb) return { verb: directVerb, target: rest.join(' ') };
  if (DIRECTION_ALIASES[first]) return { verb: 'go', target: first };
  return { verb: '', target: text };
};

export const createInitialState = (): AdventureState => ({
  roomId: 'club',
  inventory: [],
  flags: [],
  ground: Object.fromEntries(ADVENTURE_ROOMS.map((room) => [room.id, [...room.items]])),
  moves: 0,
  hintLevel: 0,
  ending: null,
  visited: ['club'],
});

const cloneState = (state: AdventureState): AdventureState => ({
  ...state,
  inventory: [...state.inventory],
  flags: [...state.flags],
  visited: [...state.visited],
  ground: Object.fromEntries(Object.entries(state.ground).map(([id, items]) => [id, [...items]])),
});

export const describeRoom = (state: AdventureState, lang: Lang4): AdventureLine[] => {
  const room = roomById(state.roomId);
  if (!room) return [line('error', l(TA_TEXT.nothing, lang))];
  const lines: AdventureLine[] = [line('room', l(room.name, lang))];
  const dark = room.id === 'archive' && !hasFlag(state, 'light_on');
  lines.push(line('text', l(dark && room.darkDesc ? room.darkDesc : room.desc, lang)));

  if (!dark) {
    const items = state.ground[room.id] || [];
    if (items.length > 0) {
      const names = items.map((id) => {
        const item = itemById(id);
        return item ? l(item.name, lang) : id;
      });
      lines.push(line('system', `${l(TA_TEXT.visibleItems, lang)} ${names.join(', ')}.`));
    }
  }

  const exits = Object.keys(room.exits) as Direction[];
  if (exits.length > 0) {
    const labels = exits.map((direction) => {
      const label = l(DIRECTION_LABELS[direction], lang);
      const locked =
        (room.id === 'screening' && direction === 'up' && !hasFlag(state, 'booth_unlocked')) ||
        (room.id === 'booth' && direction === 'north' && !hasFlag(state, 'exit_unlocked'));
      return locked ? `${label} (${l(TA_TEXT.lockedSuffix, lang)})` : label;
    });
    lines.push(line('system', `${l(TA_TEXT.exits, lang)} ${labels.join(', ')}.`));
  }

  if (room.id === 'exit' && !state.ending) {
    lines.push(line('system', l(TA_TEXT.endingPrompt, lang)));
  }

  return lines;
};

export const getProgress = (state: AdventureState): number => {
  if (state.ending) return 100;
  const done = PROGRESS_FLAGS.filter((flag) => state.flags.includes(flag)).length;
  return Math.round((done / PROGRESS_FLAGS.length) * 100);
};

const hintStage = (state: AdventureState): number => {
  if (state.roomId === 'exit') return 5;
  if (!hasFlag(state, 'light_on')) return 0;
  if (!hasFlag(state, 'crate_open') || !hasFlag(state, 'locker_open')) return 1;
  if (!hasFlag(state, 'tape_taken') || !hasFlag(state, 'note_taken')) return 2;
  if (!hasFlag(state, 'bulb_set') || !hasFlag(state, 'tape_played')) return 3;
  return 4;
};

export const getHint = (state: AdventureState, lang: Lang4): string => {
  if (state.ending) return l(TA_TEXT.alreadyEnded, lang);
  if (state.hintLevel > 0) return l(TA_SOLUTION, lang);
  const stage = hintStage(state);
  return l(TA_HINTS[Math.min(stage, TA_HINTS.length - 1)], lang);
};

const endingLines = (endingId: string, lang: Lang4): AdventureLine[] => {
  const ending = ADVENTURE_ENDINGS.find((entry) => entry.id === endingId);
  if (!ending) return [];
  return [
    line('room', l(ending.title, lang)),
    line('ending', l(ending.text, lang)),
  ];
};

const finish = (state: AdventureState, endingId: string, lang: Lang4): CommandResult => {
  state.ending = endingId;
  return { state, lines: endingLines(endingId, lang) };
};

const activateFlashlight = (state: AdventureState, lang: Lang4): AdventureLine[] => {
  if (hasFlag(state, 'light_on')) return [line('system', l(TA_TEXT.alreadyOn, lang))];
  if (!state.inventory.includes('battery')) return [line('error', l(TA_TEXT.noBattery, lang))];
  removeItem(state, 'battery');
  setFlag(state, 'light_on');
  return [line('system', l(TA_TEXT.lightOn, lang))];
};

const buyFromVending = (state: AdventureState, lang: Lang4): AdventureLine[] => {
  if (hasFlag(state, 'battery_taken')) return [line('system', l(TA_TEXT.vendingEmpty, lang))];
  if (!state.inventory.includes('coin')) return [line('error', l(TA_TEXT.vendingNeedCoin, lang))];
  removeItem(state, 'coin');
  addItem(state, 'battery');
  setFlag(state, 'battery_taken');
  return [line('system', l(TA_TEXT.vendingGive, lang))];
};

const openCrate = (state: AdventureState, lang: Lang4): AdventureLine[] => {
  if (hasFlag(state, 'crate_open')) return [line('system', l(TA_TEXT.crateAlready, lang))];
  if (!state.inventory.includes('screwdriver')) return [line('error', l(TA_TEXT.crateNeedTool, lang))];
  setFlag(state, 'crate_open');
  addItem(state, 'bulb');
  return [line('system', l(TA_TEXT.crateOpen, lang))];
};

const openLocker = (state: AdventureState, lang: Lang4): AdventureLine[] => {
  if (hasFlag(state, 'locker_open')) return [line('system', l(TA_TEXT.lockerAlready, lang))];
  if (!state.inventory.includes('screwdriver')) return [line('error', l(TA_TEXT.lockerNeedTool, lang))];
  setFlag(state, 'locker_open');
  addItem(state, 'old_key');
  return [line('system', l(TA_TEXT.lockerOpen, lang))];
};

const setBulb = (state: AdventureState, lang: Lang4): AdventureLine[] => {
  if (hasFlag(state, 'bulb_set')) return [line('system', l(TA_TEXT.bulbAlready, lang))];
  if (!state.inventory.includes('bulb')) return [line('error', l(TA_TEXT.projectorNeedBulb, lang))];
  removeItem(state, 'bulb');
  setFlag(state, 'bulb_set');
  return [line('system', l(TA_TEXT.bulbSet, lang))];
};

const playTape = (state: AdventureState, lang: Lang4): AdventureLine[] => {
  if (hasFlag(state, 'tape_played')) return [line('system', l(TA_TEXT.tapeAlready, lang))];
  if (!hasFlag(state, 'bulb_set')) return [line('error', l(TA_TEXT.projectorNeedBulb, lang))];
  if (!state.inventory.includes('tape')) return [line('error', l(TA_TEXT.projectorNeedTape, lang))];
  setFlag(state, 'tape_played');
  return [line('text', l(TA_TEXT.tapePlayed, lang))];
};

const unlockBooth = (state: AdventureState, lang: Lang4): AdventureLine[] => {
  if (hasFlag(state, 'booth_unlocked')) return [line('system', l(TA_TEXT.boothAlready, lang))];
  if (!state.inventory.includes('old_key')) return [line('error', l(TA_TEXT.boothNeedKey, lang))];
  setFlag(state, 'booth_unlocked');
  return [line('system', l(TA_TEXT.boothUnlocked, lang))];
};

const unlockExit = (state: AdventureState, code: string | null, lang: Lang4): AdventureLine[] => {
  if (hasFlag(state, 'exit_unlocked')) return [line('system', l(TA_TEXT.terminalAlready, lang))];
  if (!code) return [line('system', l(TA_TEXT.terminalNeedCode, lang))];
  if (code !== '471') return [line('error', l(TA_TEXT.terminalBad, lang))];
  setFlag(state, 'exit_unlocked');
  return [line('system', l(TA_TEXT.terminalOk, lang))];
};

const examine = (state: AdventureState, target: string, lang: Lang4): AdventureLine[] => {
  if (!target) return describeRoom(state, lang);
  if (['etrafına', 'etrafa', 'etraf', 'around', 'autour', '周り'].includes(target)) {
    return describeRoom(state, lang);
  }
  const room = roomById(state.roomId);
  if (room?.id === 'archive' && !hasFlag(state, 'light_on')) {
    return [line('error', l(TA_TEXT.dark, lang))];
  }
  const itemId = findItem(target, lang);
  if (itemId) {
    const item = itemById(itemId);
    if (!item) return [];
    const inInventory = state.inventory.includes(itemId);
    const onGround = (state.ground[state.roomId] || []).includes(itemId);
    if (!inInventory && !onGround) return [line('system', l(TA_TEXT.nothing, lang))];
    return [line('text', l(item.desc, lang))];
  }
  const fixtureId = findFixture(target, lang);
  if (fixtureId) {
    const description = TA_FIXTURES[fixtureId];
    if (description) return [line('text', l(description, lang))];
  }
  return [line('system', l(TA_TEXT.nothing, lang))];
};

const applyUse = (state: AdventureState, target: string, lang: Lang4): AdventureLine[] => {
  const cleaned = cleanTarget(target);
  if (!cleaned) return [line('error', l(TA_TEXT.noItemToUse, lang))];

  const [leftRaw, rightRaw] = splitTwoTargets(cleaned);
  const left = leftRaw.trim();
  const right = rightRaw ? rightRaw.trim() : '';
  const itemLeft = findItem(left, lang);
  const itemRight = right ? findItem(right, lang) : null;
  const fixtureLeft = findFixture(left, lang);
  const fixtureRight = right ? findFixture(right, lang) : null;

  // Terminal: "terminal 471", "şifre 471", "use terminal 471"
  const codeMatch = cleaned.match(/\b(\d{3})\b/);
  if (fixtureLeft === 'terminal' || fixtureRight === 'terminal' || codeMatch) {
    if (state.roomId !== 'booth') {
      return [line('system', l(TA_TEXT.noTerminal, lang))];
    }
    return unlockExit(state, codeMatch ? codeMatch[1] : null, lang);
  }

  let itemId = itemLeft ?? itemRight;
  const fixtureId = fixtureRight ?? fixtureLeft;

  // "pili fenere tak" / "use battery on flashlight"
  if (!itemId && itemRight) itemId = itemRight;
  if (itemId === 'battery' && (itemLeft === 'flashlight' || itemRight === 'flashlight' || !right)) {
    if (state.inventory.includes('flashlight')) return activateFlashlight(state, lang);
  }

  if (!itemId) {
    switch (fixtureId) {
      case 'vending':
        return buyFromVending(state, lang);
      case 'crate':
        return openCrate(state, lang);
      case 'locker':
        return openLocker(state, lang);
      case 'door':
        return unlockBooth(state, lang);
      case 'projector': {
        if (!hasFlag(state, 'bulb_set')) return setBulb(state, lang);
        return playTape(state, lang);
      }
      case 'ghost':
        return [line('text', l(TA_TEXT.talkGhost, lang))];
      default:
        return [line('system', l(TA_TEXT.nothingHappens, lang))];
    }
  }

  switch (itemId) {
    case 'flashlight':
      return activateFlashlight(state, lang);
    case 'battery':
      if (state.inventory.includes('flashlight')) return activateFlashlight(state, lang);
      return [line('system', l(TA_TEXT.nothingHappens, lang))];
    case 'coin':
      if (fixtureId === 'vending' || state.roomId === 'corridor') return buyFromVending(state, lang);
      return [line('system', l(TA_TEXT.nothingHappens, lang))];
    case 'screwdriver':
      if (fixtureId === 'crate') return openCrate(state, lang);
      if (fixtureId === 'locker') return openLocker(state, lang);
      if (state.roomId === 'storage') {
        return hasFlag(state, 'crate_open') ? openLocker(state, lang) : openCrate(state, lang);
      }
      return [line('system', l(TA_TEXT.nothingHappens, lang))];
    case 'bulb':
      if (fixtureId === 'projector' || state.roomId === 'screening') return setBulb(state, lang);
      return [line('system', l(TA_TEXT.nothingHappens, lang))];
    case 'tape':
      if (state.roomId === 'exit') return [line('system', l(TA_TEXT.endingPrompt, lang))];
      if (fixtureId === 'projector' || state.roomId === 'screening') return playTape(state, lang);
      return [line('system', l(TA_TEXT.nothingHappens, lang))];
    case 'old_key':
      if (fixtureId === 'door' || state.roomId === 'screening') return unlockBooth(state, lang);
      return [line('system', l(TA_TEXT.nothingHappens, lang))];
    case 'note': {
      const note = itemById('note');
      return note ? [line('text', l(note.desc, lang))] : [];
    }
    default:
      return [line('system', l(TA_TEXT.nothingHappens, lang))];
  }
};

/**
 * Tek bir komutu yürütür. Girdi boşsa durum aynen döner.
 * `input` kullanıcının yazdığı ham metindir; dil yalnızca metin ve
 * eşanlamlı çözümlemesi için kullanılır.
 */
export const executeCommand = (
  previous: AdventureState,
  input: string,
  lang: Lang4,
): CommandResult => {
  const state = cloneState(previous);
  const raw = input.trim();
  if (!raw) return { state, lines: [] };

  const { verb, target } = parseCommand(raw, lang);

  if (state.ending && verb !== 'restart' && verb !== 'load') {
    return { state, lines: [line('system', l(TA_TEXT.alreadyEnded, lang))] };
  }

  switch (verb) {
    case 'help':
      return { state, lines: [line('system', l(TA_HELP, lang))] };

    case 'hint': {
      const hint = getHint(state, lang);
      state.hintLevel += 1;
      return { state, lines: [line('system', hint)] };
    }

    case 'map': {
      const names = state.visited.map((id) => {
        const room = roomById(id);
        return room ? l(room.name, lang) : id;
      });
      return { state, lines: [line('system', `${l(TA_TEXT.mapTitle, lang)} ${names.join(' · ')}`)] };
    }

    case 'inventory': {
      if (state.inventory.length === 0) {
        return { state, lines: [line('system', l(TA_TEXT.inventoryEmpty, lang))] };
      }
      const names = state.inventory.map((id) => {
        const item = itemById(id);
        return item ? l(item.name, lang) : id;
      });
      return { state, lines: [line('system', `${l(TA_TEXT.inventoryTitle, lang)} ${names.join(', ')}`)] };
    }

    case 'save': {
      const ok = saveAdventure(state);
      return {
        state,
        lines: [line(ok ? 'system' : 'error', ok ? l(TA_TEXT.saveOk, lang) : l(TA_TEXT.noSave, lang))],
      };
    }

    case 'load': {
      const loaded = loadAdventure();
      if (!loaded) return { state, lines: [line('error', l(TA_TEXT.noSave, lang))] };
      return {
        state: loaded,
        lines: [line('system', l(TA_TEXT.loadOk, lang)), ...describeRoom(loaded, lang)],
      };
    }

    case 'restart': {
      const fresh = createInitialState();
      return {
        state: fresh,
        lines: [line('system', l(TA_TEXT.restartOk, lang)), line('text', l(TA_INTRO, lang)), ...describeRoom(fresh, lang)],
      };
    }

    case 'look':
      return { state, lines: examine(state, cleanTarget(target), lang) };

    case 'go': {
      const room = roomById(state.roomId);
      if (!room) return { state, lines: [line('error', l(TA_TEXT.nothing, lang))] };
      const direction = findDirection(cleanTarget(target));
      if (!direction) return { state, lines: [line('error', l(TA_TEXT.noExit, lang))] };
      if (room.id === 'screening' && direction === 'up' && !hasFlag(state, 'booth_unlocked')) {
        return { state, lines: [line('error', l(TA_TEXT.boothNeedKey, lang))] };
      }
      if (room.id === 'booth' && direction === 'north' && !hasFlag(state, 'exit_unlocked')) {
        return { state, lines: [line('error', l(TA_TEXT.exitLocked, lang))] };
      }
      const destination = room.exits[direction];
      if (!destination) return { state, lines: [line('error', l(TA_TEXT.noExit, lang))] };
      state.roomId = destination;
      state.moves += 1;
      if (!state.visited.includes(destination)) state.visited.push(destination);
      return { state, lines: describeRoom(state, lang) };
    }

    case 'take': {
      const cleaned = cleanTarget(target);
      if (!cleaned) return { state, lines: [line('error', l(TA_TEXT.nothing, lang))] };
      const room = roomById(state.roomId);
      if (room?.id === 'archive' && !hasFlag(state, 'light_on')) {
        return { state, lines: [line('error', l(TA_TEXT.dark, lang))] };
      }
      const itemId = findItem(cleaned, lang);
      if (!itemId) return { state, lines: [line('system', l(TA_TEXT.nothing, lang))] };
      if (state.inventory.includes(itemId)) {
        return { state, lines: [line('system', l(TA_TEXT.alreadyHave, lang))] };
      }
      const onGround = state.ground[state.roomId] || [];
      if (!onGround.includes(itemId)) {
        return { state, lines: [line('system', l(TA_TEXT.nothing, lang))] };
      }
      state.ground[state.roomId] = onGround.filter((id) => id !== itemId);
      addItem(state, itemId);
      if (itemId === 'tape') setFlag(state, 'tape_taken');
      if (itemId === 'note') setFlag(state, 'note_taken');
      const item = itemById(itemId);
      return {
        state,
        lines: [line('system', `${l(TA_TEXT.took, lang)} ${item ? l(item.name, lang) : itemId}`)],
      };
    }

    case 'drop': {
      const cleaned = cleanTarget(target);
      const itemId = findItem(cleaned, lang);
      if (!itemId || !state.inventory.includes(itemId)) {
        return { state, lines: [line('error', l(TA_TEXT.notCarrying, lang))] };
      }
      if (state.roomId === 'exit' && itemId === 'tape') {
        return finish(state, 'leave', lang);
      }
      removeItem(state, itemId);
      state.ground[state.roomId] = [...(state.ground[state.roomId] || []), itemId];
      const item = itemById(itemId);
      return {
        state,
        lines: [line('system', `${l(TA_TEXT.dropped, lang)} ${item ? l(item.name, lang) : itemId}`)],
      };
    }

    case 'use': {
      const noun = cleanTarget(target);
      if (state.roomId === 'exit' && findItem(noun, lang) === 'tape' && state.inventory.includes('tape')) {
        return finish(state, 'keep', lang);
      }
      return { state, lines: applyUse(state, target, lang) };
    }

    case 'open': {
      const noun = cleanTarget(target);
      if (state.roomId === 'exit' && findItem(noun, lang) === 'tape' && state.inventory.includes('tape')) {
        return finish(state, 'keep', lang);
      }
      return { state, lines: applyUse(state, target, lang) };
    }

    case 'talk': {
      const room = roomById(state.roomId);
      const fixture = findFixture(cleanTarget(target), lang);
      if (room?.id === 'screening' && (fixture === 'ghost' || !target.trim())) {
        return { state, lines: [line('text', l(TA_TEXT.talkGhost, lang))] };
      }
      return { state, lines: [line('system', l(TA_TEXT.talkNoOne, lang))] };
    }

    case 'code': {
      if (state.roomId !== 'booth') {
        return { state, lines: [line('system', l(TA_TEXT.noTerminal, lang))] };
      }
      const codeMatch = target.match(/\b(\d{3})\b/);
      return { state, lines: unlockExit(state, codeMatch ? codeMatch[1] : null, lang) };
    }

    case 'keep': {
      if (state.roomId === 'exit' && state.inventory.includes('tape')) {
        return finish(state, 'keep', lang);
      }
      return { state, lines: [line('system', l(TA_TEXT.nothingHappens, lang))] };
    }

    case 'erase': {
      if (state.roomId === 'exit' && state.inventory.includes('tape')) {
        return finish(state, 'erase', lang);
      }
      return { state, lines: [line('system', l(TA_TEXT.nothingHappens, lang))] };
    }

    default: {
      // Yalın nesne: odada alınabiliyorsa al, değilse incele.
      const noun = cleanTarget(target);
      const itemId = findItem(noun, lang);
      if (itemId) {
        const onGround = (state.ground[state.roomId] || []).includes(itemId);
        if (onGround && !state.inventory.includes(itemId)) {
          return executeCommand(previous, `take ${noun}`, lang);
        }
        return { state, lines: examine(state, noun, lang) };
      }
      const fixture = findFixture(noun, lang);
      if (fixture) return { state, lines: examine(state, noun, lang) };
      return { state, lines: [line('error', l(TA_TEXT.notUnderstood, lang))] };
    }
  }
};

/* ── Kalıcılık (localStorage) ─────────────────────────────────────────── */

export const saveAdventure = (state: AdventureState): boolean => {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    window.localStorage.setItem(ADVENTURE_SAVE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
};

export const loadAdventure = (): AdventureState | null => {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(ADVENTURE_SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AdventureState>;
    if (!parsed || typeof parsed.roomId !== 'string' || !roomById(parsed.roomId)) return null;
    if (!Array.isArray(parsed.inventory) || !Array.isArray(parsed.flags)) return null;
    const ground: Record<string, string[]> = {};
    for (const room of ADVENTURE_ROOMS) {
      const saved = parsed.ground?.[room.id];
      ground[room.id] = Array.isArray(saved) ? saved.filter((id) => typeof id === 'string') : [...room.items];
    }
    return {
      roomId: parsed.roomId,
      inventory: parsed.inventory.filter((id) => typeof id === 'string'),
      flags: parsed.flags.filter((id) => typeof id === 'string'),
      ground,
      moves: typeof parsed.moves === 'number' ? parsed.moves : 0,
      hintLevel: typeof parsed.hintLevel === 'number' ? parsed.hintLevel : 0,
      ending: typeof parsed.ending === 'string' && ADVENTURE_ENDINGS.some((e) => e.id === parsed.ending)
        ? parsed.ending
        : null,
      visited: Array.isArray(parsed.visited)
        ? parsed.visited.filter((id) => typeof id === 'string' && roomById(id))
        : ['club'],
    };
  } catch {
    return null;
  }
};

export const clearAdventureSave = (): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(ADVENTURE_SAVE_KEY);
  } catch {
    // storage disabled — nothing to clear
  }
};

export { ADVENTURE_ENDINGS, ADVENTURE_ITEMS, ADVENTURE_ROOMS, TA_INTRO, TA_TEXT };
