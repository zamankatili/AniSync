import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9333;
const BASE = 'http://127.0.0.1:5180';
const OUT = path.resolve('.tmp/shots');
fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- demo state ---------- */
const fallback = fs.readFileSync('src/data/fallback.ts', 'utf8');
const grab = (name) => {
  const start = fallback.indexOf(`export const ${name}`);
  const eq = fallback.indexOf('= [', start);
  const from = eq + 2;
  const to = fallback.indexOf('\n];', from);
  return JSON.parse(fallback.slice(from, to + 2));
};
const ANIME = grab('FALLBACK_ANIME');
const MANGA = grab('FALLBACK_MANGA');
const BOOKS = grab('FALLBACK_BOOKS');

const pick = (arr, needle) => arr.find((m) => m.title.toLowerCase().includes(needle.toLowerCase())) ?? arr[0];
const frieren = pick(ANIME, 'Frieren');
const chainsaw = pick(MANGA, 'Chainsaw');
const dune = pick(BOOKS, 'Dune');
const steins = pick(ANIME, 'Steins');
const game = {
  id: 'game:1245620',
  source: 'steam',
  type: 'game',
  title: 'Elden Ring',
  subtitle: 'Action RPG · Açık Dünya',
  cover: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg',
  description: 'FromSoftware’un en sabırlı olanı ödüllendirdiği dünya. Yavaş oyna, not al, kaybol.',
  genres: ['Action RPG', 'Açık Dünya'],
  score: null,
  year: 2022,
  totalUnits: null,
  unitLabel: 'saat',
  meta: '2022 · Action RPG',
  status: null,
  note: 'FromSoftware’un en sabırlı olanı ödüllendirdiği dünya. Yavaş oyna, not al, kaybol.',
};

const now = Date.now();
const iso = (daysAgo = 0) => new Date(now - daysAgo * 86400000).toISOString();
const entry = (media, status, progress, extra = {}) => ({
  media,
  status,
  progress,
  createdAt: iso(12),
  updatedAt: iso(0.2),
  ...extra,
});

const profile = {
  name: 'Semih',
  handle: 'semih',
  emoji: '🫖',
  color: '#eda85a',
  bio: 'Gece izler, sabah tartışır. Frieren sonrası boşluktayım.',
  joinedAt: iso(48),
  genres: ['Fantasy', 'Drama', 'Mystery', 'Slice of Life'],
  homeType: 'anime',
};

const today = new Date().toLocaleDateString('sv-SE');
const demo = {
  onboarded: true,
  profile,
  xp: 340,
  shelf: {
    [frieren.id]: entry(frieren, 'active', 9),
    [chainsaw.id]: entry(chainsaw, 'active', 42, { score: 9, favorite: true }),
    [dune.id]: entry(dune, 'done', 412, { score: 8 }),
    [steins.id]: entry(steins, 'planned', 0),
    [game.id]: entry(game, 'paused', 34),
  },
  joined: ['sezonluk', 'gece-kuslari'],
  atmos: 'cay',
  settings: { motion: true, hideSpoilers: false, compact: false },
  streak: 5,
  lastVisitDay: today,
  answered: {},
};

/* ---------- chrome ---------- */
const profileDir = path.resolve('.tmp/chrome-profile');
fs.rmSync(profileDir, { recursive: true, force: true });
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--mute-audio',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-features=Translate,MediaRouter',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profileDir}`,
    '--window-size=1440,900',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

let ws;
let msgId = 0;
const pending = new Map();
const events = [];

async function connect() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      const json = await res.json();
      ws = new WebSocket(json.webSocketDebuggerUrl);
      await new Promise((resolve, reject) => {
        ws.onopen = resolve;
        ws.onerror = reject;
      });
      return;
    } catch {
      await sleep(300);
    }
  }
  throw new Error('Chrome açılmadı');
}

function send(method, params = {}, sessionId) {
  const id = ++msgId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });
}

let sessionId;
async function boot() {
  await connect();
  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(`${msg.error.message} (${msg.error.code})`));
      else resolve(msg.result);
    } else if (msg.method) {
      events.push(msg);
    }
  };
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const attached = await send('Target.attachToTarget', { targetId, flatten: true });
  sessionId = attached.sessionId;
  await send('Page.enable', {}, sessionId);
  await send('Runtime.enable', {}, sessionId);
  await send('Log.enable', {}, sessionId);
}

async function viewport(width, height, mobile, scale = 2) {
  await send(
    'Emulation.setDeviceMetricsOverride',
    { width, height, deviceScaleFactor: scale, mobile, screenWidth: width, screenHeight: height },
    sessionId,
  );
}

async function evaluate(expression) {
  const res = await send(
    'Runtime.evaluate',
    { expression, awaitPromise: true, returnByValue: true },
    sessionId,
  );
  if (res.exceptionDetails) throw new Error(res.exceptionDetails.text || 'eval hatası');
  return res.result.value;
}

async function goto(url) {
  await send('Page.navigate', { url }, sessionId);
  await sleep(700);
  for (let i = 0; i < 40; i += 1) {
    const ready = await evaluate('document.readyState');
    if (ready === 'complete') break;
    await sleep(150);
  }
  await evaluate('document.fonts ? document.fonts.ready.then(() => true) : true');
  await evaluate(`(async () => {
    document.querySelectorAll('img').forEach((i) => { i.loading = 'eager'; });
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 500));
    window.scrollTo(0, 0);
    return true;
  })()`);
  await evaluate(`Promise.race([
    Promise.all([...document.images].filter(i => !i.complete).map(i => new Promise(r => { i.onload = i.onerror = r; }))),
    new Promise(r => setTimeout(r, 6000))
  ]).then(() => true)`);
  await sleep(600);
}

async function cleanupImages() {
  const broken = await evaluate(
    `[...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.src).slice(0, 8)`,
  );
  if (broken && broken.length) console.log('BROKEN IMAGES:', broken);
}

async function setState(state) {
  await evaluate(`localStorage.setItem('anisync.v2', ${JSON.stringify(JSON.stringify({ state, version: 2 }))}); true`);
}

async function shot(name, fullPage = true, clean = fullPage) {
  if (clean) {
    await evaluate(`(() => {
      const s = document.createElement('style');
      s.id = 'shot-clean';
      s.textContent = '.tabbar, header.sticky { visibility: hidden !important; }';
      document.head.appendChild(s);
      return true;
    })()`);
    await sleep(120);
  }
  let params = { format: 'png' };
  if (fullPage) {
    const metrics = await send('Page.getLayoutMetrics', {}, sessionId);
    const size = metrics.cssContentSize;
    const height = Math.min(Math.ceil(size.height), 4200);
    params = {
      format: 'png',
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: Math.ceil(size.width), height, scale: 1 },
    };
  }
  const { data } = await send('Page.captureScreenshot', params, sessionId);
  fs.writeFileSync(path.join(OUT, `${name}.png`), Buffer.from(data, 'base64'));
  if (clean) {
    await evaluate(`document.getElementById('shot-clean')?.remove(); true`);
  }
  console.log('shot', name);
}

async function main() {
  await boot();

  /* 1. onboarding */
  await viewport(390, 844, true);
  await goto(`${BASE}/`);
  await evaluate(`localStorage.clear(); true`);
  await goto(`${BASE}/`);
  await shot('m-onboarding', false);
  await viewport(1440, 900, false, 1);
  await goto(`${BASE}/`);
  await shot('d-onboarding', false);

  /* 1b. onboarding akışını gerçekten tamamla */
  await viewport(390, 844, true);
  await goto(`${BASE}/`);
  await evaluate(`document.querySelector('input')?.focus(); true`);
  await send('Input.insertText', { text: 'Deniz' }, sessionId);
  await sleep(250);
  await evaluate(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Devam'))?.click(); true`);
  await sleep(600);
  await evaluate(`['Fantastik','Dram','Gizem'].forEach(t => {
    const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === t);
    b?.click();
  }); true`);
  await sleep(300);
  await evaluate(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Mekâna gir'))?.click(); true`);
  await sleep(1400);
  await shot('m-onboarding-sonrasi', false);

  /* 2. demo state, mobile pages */
  await viewport(390, 844, true);
  await setState(demo);
  await goto(`${BASE}/`);
  await cleanupImages();
  await shot('m-salon');
  await shot('m-salon-top', false, false);

  const pages = [
    ['kesfet', 'm-kesfet'],
    ['raf', 'm-raf'],
    ['kose', 'm-kose'],
    ['ben', 'm-ben'],
    ['atmosfer', 'm-atmosfer'],
    [`m/anime/${frieren.id.split(':')[1]}`, 'm-detay'],
  ];
  for (const [route, name] of pages) {
    await goto(`${BASE}/${route}`);
    await cleanupImages();
    await shot(name, false, false);
    await shot(`${name}-full`);
  }

  /* 2b. etkileşim: rafıma ekle sayfası */
  const berserk = MANGA.find((m) => m.title.includes('Berserk'));
  await goto(`${BASE}/m/manga/${berserk.id.split(':')[1]}`);
  await evaluate(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Rafıma ekle'))?.click(); true`);
  await sleep(600);
  await shot('m-detay-ekle', false, false);

  /* 2c. etkileşim: seviye atlama */
  await setState({ ...demo, xp: 496 });
  await goto(`${BASE}/m/anime/${frieren.id.split(':')[1]}`);
  await evaluate(`document.querySelector('[aria-label="Bir adım ileri"]')?.click(); true`);
  await sleep(900);
  await shot('m-seviye-atladi', false, false);

  /* 2d. arama sonucu */
  await goto(`${BASE}/kesfet`);
  await evaluate(`document.querySelector('input')?.focus(); true`);
  await send('Input.insertText', { text: 'berserk' }, sessionId);
  await sleep(2200);
  await shot('m-kesfet-arama', false, false);

  /* 3. themes on salon (mobile) */
  for (const atmos of ['klasik', 'sinema', 'kutuphane']) {
    await setState({ ...demo, atmos });
    await goto(`${BASE}/`);
    await shot(`m-salon-${atmos}`, false, false);
  }

  /* 4. desktop */
  await viewport(1440, 900, false, 1);
  await setState(demo);
  for (const [route, name] of [
    ['', 'd-salon'],
    ['kesfet', 'd-kesfet'],
    ['raf', 'd-raf'],
    ['kose', 'd-kose'],
    ['atmosfer', 'd-atmosfer'],
    [`m/anime/${frieren.id.split(':')[1]}`, 'd-detay'],
  ]) {
    await goto(`${BASE}/${route}`);
    await cleanupImages();
    await shot(name, false, false);
  }

  /* 5. tema önizleme kartı (klasik) */
  await setState({ ...demo, atmos: 'klasik' });
  await viewport(390, 844, true);
  await goto(`${BASE}/atmosfer`);
  await shot('m-atmosfer-klasik', false, false);

  const errors = events
    .filter((e) => e.method === 'Log.entryAdded' && e.params.entry.level === 'error')
    .map((e) => e.params.entry.text);
  const consoleErrs = events
    .filter((e) => e.method === 'Runtime.exceptionThrown')
    .map((e) => e.params.exceptionDetails.text + ' ' + (e.params.exceptionDetails.exception?.description ?? ''));
  console.log('LOG ERRORS:', errors.slice(0, 10));
  console.log('EXCEPTIONS:', consoleErrs.slice(0, 10));
}

try {
  await main();
} catch (err) {
  console.error('FAILED', err);
} finally {
  try { ws?.close(); } catch {}
  chrome.kill();
}
