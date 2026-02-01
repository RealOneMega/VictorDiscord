import type { FastifyInstance } from 'fastify';
import { resolveEntitlements } from '../lib/entitlements.js';

export const registerEntitlementRoutes = async (app: FastifyInstance) => {
  app.get('/entitlements/resolve', async (request) => {
    const query = request.query as { userId?: string; guildId?: string };
    if (!query.userId) {
      return { scope: 'user', isPremium: false, plan: 'free', features: [] };
    }
    return resolveEntitlements(query.userId, query.guildId);
  });
};
