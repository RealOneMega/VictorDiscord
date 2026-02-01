import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/db.js';

export const registerAnalyticsRoutes = async (app: FastifyInstance) => {
  app.get('/analytics/summary', async () => {
    const [guildCount, userCount, activeSubscriptions] = await Promise.all([
      prisma.guild.count(),
      prisma.user.count(),
      prisma.entitlement.count({ where: { plan: { not: 'free' } } }),
    ]);

    return {
      guildCount,
      userCount,
      activeSubscriptions,
    };
  });
};
