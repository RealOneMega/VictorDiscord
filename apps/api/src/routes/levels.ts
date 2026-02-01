import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/db.js';

export const registerLevelRoutes = async (app: FastifyInstance) => {
  app.post('/levels/batch', async (request) => {
    const body = request.body as { updates?: { userId: string; guildId: string; amount: number }[] };
    const updates = body.updates ?? [];

    await prisma.$transaction(
      updates.map((update) =>
        prisma.levelStat.upsert({
          where: { userId_guildId: { userId: update.userId, guildId: update.guildId } },
          update: {
            xp: { increment: update.amount },
          },
          create: {
            userId: update.userId,
            guildId: update.guildId,
            xp: update.amount,
          },
        }),
      ),
    );

    return { status: 'ok', processed: updates.length };
  });
};
