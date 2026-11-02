import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9344;
const profileDir = path.resolve('.tmp/chrome-probe');
fs.rmSync(profileDir, { recursive: true, force: true });

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profileDir}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws;
let id = 0;
const pending = new Map();

for (let i = 0; i < 60; i += 1) {
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
    const json = await res.json();
    ws = new WebSocket(json.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });
    break;
  } catch {
    await sleep(300);
  }
}

const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const msgId = ++id;
    pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
  });

ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(msg.error.message));
    else resolve(msg.result);
  }
};

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Page.enable', {}, sessionId);
await send('Runtime.enable', {}, sessionId);
await send(
  'Emulation.setDeviceMetricsOverride',
  { width: 390, height: 844, deviceScaleFactor: 2, mobile: true },
  sessionId,
);
await send('Page.navigate', { url: 'http://127.0.0.1:5180/' }, sessionId);
await sleep(2500);

const expression = `(() => {
  const vw = window.innerWidth;
  const wide = [...document.querySelectorAll('body *')]
    .map((el) => ({ el, r: el.getBoundingClientRect() }))
    .filter(({ r }) => r.width > 0 && r.right > vw + 1)
    .slice(0, 12)
    .map(({ el, r }) => (el.tagName + '.' + String(el.className).slice(0, 70) + ' | w=' + Math.round(r.width) + ' right=' + Math.round(r.right)));
  const form = document.querySelector('input')?.closest('div');
  return JSON.stringify({
    innerWidth: vw,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    inputRect: form ? form.getBoundingClientRect().width : null,
    wide,
  }, null, 2);
})()`;

const res = await send('Runtime.evaluate', { expression, returnByValue: true }, sessionId);
console.log(res.result.value);

const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
fs.writeFileSync(path.resolve('.tmp/onboarding-klasik.png'), Buffer.from(shot.data, 'base64'));
console.log('saved .tmp/onboarding-klasik.png');

ws.close();
chrome.kill();
