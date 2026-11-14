import { describe, expect, it } from 'vitest';
import {
  isErrorReportingConfigured,
  scrubEvent,
  SENTRY_DSN,
  captureError,
  captureMessage,
} from './errorReporting';

describe('errorReporting', () => {
  it('is disabled when no DSN is configured', () => {
    expect(SENTRY_DSN).toBe('');
    expect(isErrorReportingConfigured()).toBe(false);
    // No-op çağrılar hata fırlatmamalı.
    expect(() => captureError(new Error('x'))).not.toThrow();
    expect(() => captureMessage('x')).not.toThrow();
  });

  it('removes user identity from events', () => {
    const cleaned = scrubEvent({
      user: { email: 'user@example.com', id: 'uid-1' },
      message: 'boom',
    });
    expect(cleaned.user).toBeUndefined();
    expect(cleaned.message).toBe('boom');
  });

  it('strips query strings and request bodies', () => {
    const cleaned = scrubEvent({
      request: {
        url: 'https://anisync-tau.vercel.app/api/translate?token=secret',
        data: { email: 'user@example.com' },
        cookies: 'session=abc',
      },
    });
    const request = cleaned.request as Record<string, unknown>;
    expect(request.url).toBe('https://anisync-tau.vercel.app/api/translate');
    expect(request.data).toBeUndefined();
    expect(request.cookies).toBeUndefined();
  });

  it('sanitises breadcrumb URLs', () => {
    const cleaned = scrubEvent({
      breadcrumbs: [
        { message: 'navigate', data: { url: '/anime/16498?utm=x' } },
        { message: 'plain' },
      ],
    });
    const crumbs = cleaned.breadcrumbs as Array<Record<string, unknown>>;
    expect((crumbs[0].data as Record<string, unknown>).url).toBe('/anime/16498');
    expect(crumbs[1]).toEqual({ message: 'plain' });
  });
});
