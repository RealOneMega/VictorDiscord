import { LRUCache } from 'lru-cache';
import { DEFAULT_CACHE_TTL_MS, type EntitlementResult } from '@victor/shared';
import { logger } from '../utils/logger.js';

interface PremiumHandlerOptions {
  apiBaseUrl: string;
  ttlMs?: number;
}

const cache = new LRUCache<string, EntitlementResult>({
  max: 10_000,
  ttl: DEFAULT_CACHE_TTL_MS,
});

export const resolveEntitlement = async (
  userId: string,
  guildId: string | null,
  options: PremiumHandlerOptions,
): Promise<EntitlementResult> => {
  const cacheKey = `${userId}:${guildId ?? 'global'}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const endpoint = new URL('/entitlements/resolve', options.apiBaseUrl);
  endpoint.searchParams.set('userId', userId);
  if (guildId) {
    endpoint.searchParams.set('guildId', guildId);
  }

  const response = await fetch(endpoint);
  if (!response.ok) {
    logger.warn({ status: response.status }, 'Failed to resolve entitlements');
    return { scope: 'user', isPremium: false, plan: 'free', features: [] };
  }

  const payload = (await response.json()) as EntitlementResult;
  cache.set(cacheKey, payload, { ttl: options.ttlMs ?? DEFAULT_CACHE_TTL_MS });
  return payload;
};

export const hasFeature = (entitlement: EntitlementResult, feature: string | undefined) => {
  if (!feature) {
    return true;
  }
  return entitlement.features.includes(feature);
};
