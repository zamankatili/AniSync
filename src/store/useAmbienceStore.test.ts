import { describe, expect, it } from 'vitest';
import { DEFAULT_AMBIENCE, resolveStoredAmbience } from './useAmbienceStore';

/**
 * Tercih çözümleyici kilidi.
 *
 * Kural: bilinmeyen/bozuk bir kayıt asla `full` (hareketli) moda yükselmez.
 * Varsayılan `calm`dır: sabit ton, parçacık yok, ses yok.
 */
describe('resolveStoredAmbience', () => {
  it('defaults to calm north on a first visit', () => {
    expect(resolveStoredAmbience(null)).toEqual(DEFAULT_AMBIENCE);
    expect(DEFAULT_AMBIENCE).toEqual({ mode: 'calm', hemisphere: 'north' });
  });

  it('defaults to calm north for an empty string', () => {
    expect(resolveStoredAmbience('')).toEqual(DEFAULT_AMBIENCE);
  });

  it('defaults to calm north for broken JSON', () => {
    expect(resolveStoredAmbience('{not json')).toEqual(DEFAULT_AMBIENCE);
    expect(resolveStoredAmbience('null')).toEqual(DEFAULT_AMBIENCE);
  });

  it('honours an explicit full + south selection', () => {
    expect(resolveStoredAmbience('{"mode":"full","hemisphere":"south"}')).toEqual({
      mode: 'full',
      hemisphere: 'south',
    });
  });

  it('honours an explicit off selection', () => {
    expect(resolveStoredAmbience('{"mode":"off","hemisphere":"north"}')).toEqual({
      mode: 'off',
      hemisphere: 'north',
    });
  });

  it('never upgrades an unknown mode to full', () => {
    expect(resolveStoredAmbience('{"mode":"party","hemisphere":"north"}').mode).toBe('calm');
    expect(resolveStoredAmbience('{"mode":true}').mode).toBe('calm');
  });

  it('falls back to the northern hemisphere for unknown values', () => {
    expect(resolveStoredAmbience('{"mode":"calm","hemisphere":"mars"}').hemisphere).toBe('north');
    expect(resolveStoredAmbience('{"mode":"calm","hemisphere":42}').hemisphere).toBe('north');
  });
});
