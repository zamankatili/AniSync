import { describe, it, expect } from 'vitest';
import { isBootstrapAdminEmail, featureFlagValue, isAnnouncementActive } from './adminConfig';

describe('adminConfig helpers', () => {
  it('isBootstrapAdminEmail recognizes listed emails case-insensitively', () => {
    expect(isBootstrapAdminEmail('zamankatilii@gmail.com')).toBe(true);
    expect(isBootstrapAdminEmail('zamankatilii@GMAIL.COM')).toBe(true);
    expect(isBootstrapAdminEmail('someone@example.com')).toBe(false);
    expect(isBootstrapAdminEmail(undefined)).toBe(false);
  });

  it('featureFlagValue clamps and coerces to 0-100', () => {
    expect(featureFlagValue(150)).toBe(100);
    expect(featureFlagValue(-10)).toBe(0);
    expect(featureFlagValue(42)).toBe(42);
    expect(featureFlagValue(true)).toBe(100);
    expect(featureFlagValue(false)).toBe(0);
    expect(featureFlagValue(undefined)).toBe(0);
  });

  it('isAnnouncementActive respects startsAt/endsAt', () => {
    const now = new Date('2026-11-15T12:00:00Z');
    expect(isAnnouncementActive(null, now)).toBe(false);
    expect(isAnnouncementActive({ tr: 'x', en: 'x', type: 'info' }, now)).toBe(true);
    expect(isAnnouncementActive({ tr: 'x', en: 'x', type: 'info', startsAt: '2026-12-01T00:00:00Z' }, now)).toBe(false);
    expect(isAnnouncementActive({ tr: 'x', en: 'x', type: 'info', endsAt: '2026-11-01T00:00:00Z' }, now)).toBe(false);
  });
});
