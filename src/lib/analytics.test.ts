import { describe, expect, it } from 'vitest';
import {
  ALLOWED_EVENT_PARAMS,
  getAnalyticsConsent,
  isAnalyticsConfigured,
  sanitizeAnalyticsPath,
  sanitizeEventName,
  sanitizeEventParams,
  trackConversionOnce,
  trackEvent,
  trackPageView,
} from './analytics';

describe('analytics', () => {
  it('stays disabled when no GA4 id is configured', () => {
    // Test ortamında VITE_GA4_ID tanımsız; hiçbir şey yüklenmemeli.
    expect(isAnalyticsConfigured()).toBe(false);
    expect(trackPageView('/anime/16498')).toBeUndefined();
    expect(trackEvent('game_start', { mode: 'voice' })).toBe(false);
  });

  it('defaults to unset consent without storage access', () => {
    expect(getAnalyticsConsent()).toBe('unset');
  });

  it('strips query strings and hashes from page paths', () => {
    expect(sanitizeAnalyticsPath('/calendar?month=11#top')).toBe('/calendar');
    expect(sanitizeAnalyticsPath('/')).toBe('/');
    expect(sanitizeAnalyticsPath('')).toBe('/');
  });

  it('redacts identity segments in known routes', () => {
    expect(sanitizeAnalyticsPath('/anime/16498')).toBe('/anime/:id');
    expect(sanitizeAnalyticsPath('/media/anilist:154587')).toBe('/media/:id');
    expect(sanitizeAnalyticsPath('/watch-party/room-42')).toBe('/watch-party/:id');
    expect(sanitizeAnalyticsPath('/profile/AbC123')).toBe('/profile/:id');
  });

  it('keeps non-identity routes readable', () => {
    expect(sanitizeAnalyticsPath('/voice-duel')).toBe('/voice-duel');
    expect(sanitizeAnalyticsPath('/lore')).toBe('/lore');
  });

  it('rejects unsafe custom event names', () => {
    expect(sanitizeEventName('game_start')).toBe('game_start');
    expect(sanitizeEventName('Game Start')).toBeNull();
    expect(sanitizeEventName('x')).toBeNull();
    expect(sanitizeEventName('a'.repeat(60))).toBeNull();
  });

  it('drops unknown or unsafe event parameters', () => {
    const params = sanitizeEventParams({
      mode: 'voice',
      difficulty: 'zor',
      count: 10,
      result: true,
      email: 'user@example.com',
      note: 'x'.repeat(41),
      nested: { a: 1 },
      empty: '',
    });

    expect(params).toEqual({ mode: 'voice', difficulty: 'zor', count: 10, result: true });
    for (const key of Object.keys(params)) {
      expect(ALLOWED_EVENT_PARAMS).toContain(key);
    }
  });

  it('never sends conversions while measurement is disabled', () => {
    // GA4 kimliği tanımsız: dönüşüm ne gönderilir ne de işaretlenir.
    expect(trackConversionOnce('signup', 'signup', { surface: 'email' })).toBe(false);
    expect(trackConversionOnce('first_game_finish', 'first_game_finish', { surface: 'voice_duel' })).toBe(false);
  });

  it('rejects unsafe conversion keys', () => {
    expect(trackConversionOnce('Signup', 'signup')).toBe(false);
    expect(trackConversionOnce('a', 'signup')).toBe(false);
    expect(trackConversionOnce('../etc', 'signup')).toBe(false);
  });
});
