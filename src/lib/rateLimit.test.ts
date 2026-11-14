import { describe, expect, it } from 'vitest';
import {
  clientKeyFromHeaders,
  createMemoryStore,
  evaluateRateLimit,
  hashClientKey,
  RATE_LIMITS,
} from './rateLimit';

describe('rateLimit', () => {
  it('hashes IPs deterministically without leaking the original value', () => {
    const hashed = hashClientKey('203.0.113.9');
    expect(hashed).toBe(hashClientKey('203.0.113.9'));
    expect(hashed).not.toContain('203');
    expect(hashed).toMatch(/^[0-9a-f]{8}$/);
    expect(hashClientKey('203.0.113.10')).not.toBe(hashed);
  });

  it('takes the first x-forwarded-for address', () => {
    const a = clientKeyFromHeaders({ 'x-forwarded-for': '203.0.113.9, 70.41.3.18' });
    expect(a).toBe(hashClientKey('203.0.113.9'));
  });

  it('falls back to x-real-ip and then to a shared bucket', () => {
    expect(clientKeyFromHeaders({ 'x-real-ip': '198.51.100.4' })).toBe(hashClientKey('198.51.100.4'));
    expect(clientKeyFromHeaders(undefined)).toBe(hashClientKey('unknown'));
    expect(clientKeyFromHeaders({})).toBe(hashClientKey('unknown'));
  });

  it('allows requests up to the limit and reports remaining quota', () => {
    const rule = { name: 'test', limit: 3, windowMs: 60_000 };
    expect(evaluateRateLimit({ count: 1, ttlMs: 59_000 }, rule, 1_000)).toMatchObject({
      allowed: true,
      remaining: 2,
      retryAfterSeconds: 0,
    });
    expect(evaluateRateLimit({ count: 3, ttlMs: 30_000 }, rule).allowed).toBe(true);
  });

  it('blocks once the limit is exceeded and rounds retry-after up', () => {
    const rule = { name: 'test', limit: 2, windowMs: 60_000 };
    const decision = evaluateRateLimit({ count: 3, ttlMs: 12_400 }, rule, 5_000);
    expect(decision.allowed).toBe(false);
    expect(decision.remaining).toBe(0);
    expect(decision.retryAfterSeconds).toBe(13);
    expect(decision.resetAtMs).toBe(17_400);
  });

  it('counts per key and resets after the window expires', async () => {
    let now = 1_000;
    const store = createMemoryStore(() => now);
    const rule = { name: 'test', limit: 2, windowMs: 10_000 };

    expect((await store.consume('k', rule.windowMs)).count).toBe(1);
    expect((await store.consume('k', rule.windowMs)).count).toBe(2);
    expect((await store.consume('other', rule.windowMs)).count).toBe(1);

    now += 10_001;
    const afterWindow = await store.consume('k', rule.windowMs);
    expect(afterWindow.count).toBe(1);
    expect(afterWindow.ttlMs).toBe(rule.windowMs);
  });

  it('ships sane defaults for every public endpoint', () => {
    for (const [key, rule] of Object.entries(RATE_LIMITS)) {
      expect(rule.name).toBe(key);
      expect(rule.limit).toBeGreaterThan(0);
      expect(rule.windowMs).toBeGreaterThanOrEqual(1_000);
    }
    expect(RATE_LIMITS['ai-recommendations'].limit).toBeLessThan(RATE_LIMITS['anime-news'].limit);
  });
});
