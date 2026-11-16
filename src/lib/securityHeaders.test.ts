import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface HeaderRule {
  source: string;
  headers: Array<{ key: string; value: string }>;
}

const vercel = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')) as {
  headers?: HeaderRule[];
};

const globalRule = (vercel.headers ?? []).find((rule) => rule.source === '/(.*)');
const header = (key: string): string | undefined =>
  globalRule?.headers.find((entry) => entry.key.toLowerCase() === key.toLowerCase())?.value;

/**
 * Güvenlik başlıkları tek yerde (vercel.json) yaşar; bu test onların sessizce
 * silinmesini engeller. `Cross-Origin-Embedder-Policy` bilinçli olarak yok:
 * YouTube iframe'leri (Voice Duel, İkonik Sahneler, Watch Party) COEP ile
 * yüklenmez. `Cross-Origin-Opener-Policy` ise Google popup girişini bozmamak
 * için `same-origin-allow-popups` olmalı.
 */
describe('security headers (vercel.json)', () => {
  it('defines one global header rule for every path', () => {
    expect(globalRule, 'missing "/(.*)" header rule').toBeTruthy();
  });

  it('enforces HSTS for at least six months', () => {
    const hsts = header('Strict-Transport-Security');
    expect(hsts).toBeTruthy();
    const maxAge = Number(/max-age=(\d+)/.exec(hsts!)?.[1] ?? 0);
    expect(maxAge).toBeGreaterThanOrEqual(15_552_000);
  });

  it('blocks MIME sniffing and framing', () => {
    expect(header('X-Content-Type-Options')).toBe('nosniff');
    expect(header('X-Frame-Options')).toBe('SAMEORIGIN');
  });

  it('sets a privacy-preserving referrer policy', () => {
    expect(header('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });

  it('denies powerful device permissions the app never uses', () => {
    const policy = header('Permissions-Policy') ?? '';
    for (const feature of ['camera', 'microphone', 'geolocation', 'payment', 'usb']) {
      expect(policy, `Permissions-Policy must disable ${feature}`).toContain(`${feature}=()`);
    }
  });

  it('keeps Google sign-in popups working (COOP) and YouTube embeds loading (no COEP)', () => {
    expect(header('Cross-Origin-Opener-Policy')).toBe('same-origin-allow-popups');
    expect(header('Cross-Origin-Embedder-Policy')).toBeUndefined();
  });

  it('keeps immutable caching for hashed assets', () => {
    const assets = (vercel.headers ?? []).find((rule) => rule.source === '/assets/(.*)');
    const cache = assets?.headers.find((entry) => entry.key === 'Cache-Control')?.value ?? '';
    expect(cache).toContain('immutable');
    expect(cache).toContain('max-age=31536000');
  });
});
