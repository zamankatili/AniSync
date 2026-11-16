import { describe, expect, it } from 'vitest';
import { resolveStoredSound } from './useSoundStore';

/**
 * Ses varsayılanı kilidi.
 *
 * Kural: hiçbir ziyaretçi kendi açmadığı sesi duymamalı. Canlı akış çanı
 * başkasının gönderisiyle tetiklendiği için "istenmeyen ses" tanımına girer;
 * bu yüzden depolanmış tercih yoksa/bozuksa ses kapalı kabul edilir.
 */
describe('resolveStoredSound — varsayılan sessiz', () => {
  it('keeps sound off on a first visit (no stored value)', () => {
    expect(resolveStoredSound(null)).toEqual({ enabled: false, volume: 0.5 });
  });

  it('keeps sound off for an empty string', () => {
    expect(resolveStoredSound('').enabled).toBe(false);
  });

  it('honours an explicit opt-in', () => {
    expect(resolveStoredSound('{"enabled":true,"volume":0.8}')).toEqual({
      enabled: true,
      volume: 0.8,
    });
  });

  it('honours an explicit opt-out', () => {
    expect(resolveStoredSound('{"enabled":false,"volume":0.8}')).toEqual({
      enabled: false,
      volume: 0.8,
    });
  });

  it('treats a missing enabled flag as off', () => {
    expect(resolveStoredSound('{"volume":0.9}').enabled).toBe(false);
  });

  it('fails closed on malformed JSON', () => {
    expect(resolveStoredSound('{not json')).toEqual({ enabled: false, volume: 0.5 });
  });

  it('fails closed on JSON null', () => {
    expect(resolveStoredSound('null')).toEqual({ enabled: false, volume: 0.5 });
  });

  it('clamps the stored volume and falls back for non-numbers', () => {
    expect(resolveStoredSound('{"enabled":true,"volume":5}').volume).toBe(1);
    expect(resolveStoredSound('{"enabled":true,"volume":-3}').volume).toBe(0);
    expect(resolveStoredSound('{"enabled":true,"volume":"loud"}').volume).toBe(0.5);
    expect(resolveStoredSound('{"enabled":true}').volume).toBe(0.5);
  });
});
