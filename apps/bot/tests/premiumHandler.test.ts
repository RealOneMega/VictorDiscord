import { describe, expect, it, vi, beforeEach } from 'vitest';
import { resolveEntitlement } from '../src/handlers/premiumHandler.js';

const mockFetch = vi.fn();

declare global {
  // eslint-disable-next-line no-var
  var fetch: typeof mockFetch;
}

globalThis.fetch = mockFetch as any;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('premiumHandler', () => {
  it('returns fallback on non-200 response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    const result = await resolveEntitlement('user', 'guild', { apiBaseUrl: 'http://localhost' });
    expect(result.plan).toBe('free');
  });

  it('returns cached entitlements', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ scope: 'user', isPremium: true, plan: 'pro', features: ['x'] }),
    });

    const first = await resolveEntitlement('user', 'guild', { apiBaseUrl: 'http://localhost' });
    const second = await resolveEntitlement('user', 'guild', { apiBaseUrl: 'http://localhost' });

    expect(first.plan).toBe('pro');
    expect(second.plan).toBe('pro');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
