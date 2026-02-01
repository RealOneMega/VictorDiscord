import { prisma } from './db.js';
import type { EntitlementResult } from '@victor/shared';

export const resolveEntitlements = async (userId: string, guildId?: string | null) => {
  const entitlements = await prisma.entitlement.findMany({
    where: {
      OR: [
        { userId },
        guildId ? { guildId } : undefined,
      ].filter(Boolean) as object[],
    },
  });

  const active = entitlements.find((item) => !item.expiresAt || item.expiresAt > new Date());

  if (!active) {
    const result: EntitlementResult = {
      scope: 'user',
      isPremium: false,
      plan: 'free',
      features: [],
    };
    return result;
  }

  return {
    scope: active.guildId ? 'guild' : 'user',
    isPremium: active.plan !== 'free',
    plan: active.plan as EntitlementResult['plan'],
    features: Array.isArray(active.features) ? active.features : [],
    expiresAt: active.expiresAt?.toISOString(),
  } satisfies EntitlementResult;
};
