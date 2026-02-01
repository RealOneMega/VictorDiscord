import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/db.js';

export const registerGuildRoutes = async (app: FastifyInstance) => {
  app.get('/guilds/:guildId/config', async (request) => {
    const { guildId } = request.params as { guildId: string };
    const config = await prisma.guildConfig.findUnique({ where: { id: guildId } });
    return (
      config ?? {
        id: guildId,
        logChannelId: null,
        autoModEnabled: false,
        welcomeEnabled: true,
        ticketPanelChannelId: null,
        allowOwnerBulkDm: false,
      }
    );
  });

  app.put('/guilds/:guildId/config', async (request) => {
    const { guildId } = request.params as { guildId: string };
    const body = request.body as {
      logChannelId?: string | null;
      autoModEnabled?: boolean;
      welcomeEnabled?: boolean;
      ticketPanelChannelId?: string | null;
      allowOwnerBulkDm?: boolean;
    };
    const updated = await prisma.guildConfig.upsert({
      where: { id: guildId },
      update: {
        logChannelId: body.logChannelId ?? null,
        autoModEnabled: body.autoModEnabled ?? false,
        welcomeEnabled: body.welcomeEnabled ?? true,
        ticketPanelChannelId: body.ticketPanelChannelId ?? null,
        allowOwnerBulkDm: body.allowOwnerBulkDm ?? false,
      },
      create: {
        id: guildId,
        logChannelId: body.logChannelId ?? null,
        autoModEnabled: body.autoModEnabled ?? false,
        welcomeEnabled: body.welcomeEnabled ?? true,
        ticketPanelChannelId: body.ticketPanelChannelId ?? null,
        allowOwnerBulkDm: body.allowOwnerBulkDm ?? false,
      },
    });
    return updated;
  });
};
