import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/db.js';
import { loadApiEnv } from '../lib/env.js';
import { requireOwner } from '../lib/ownerAuth.js';
import {
  fetchOwnerChannels,
  fetchOwnerGuilds,
  fetchOwnerMembers,
  fetchOwnerMessages,
  fetchOwnerRoles,
  sendOwnerChannel,
  sendOwnerDm,
  sendOwnerRole,
} from '../lib/botGateway.js';
import { logAudit } from '../lib/auditLog.js';

const dayKey = () => new Date().toISOString().slice(0, 10);
const globalCounts = new Map<string, number>();
const guildCounts = new Map<string, number>();

const incrementCount = (map: Map<string, number>, key: string) => {
  const value = (map.get(key) ?? 0) + 1;
  map.set(key, value);
  return value;
};

const enforceCaps = (guildId?: string) => {
  const env = loadApiEnv();
  const currentDay = dayKey();
  const globalKey = `${currentDay}:global`;
  const globalValue = incrementCount(globalCounts, globalKey);
  if (globalValue > env.OWNER_DAILY_CAP_GLOBAL) {
    throw new Error('Global owner messaging cap reached');
  }
  if (guildId) {
    const guildKey = `${currentDay}:${guildId}`;
    const guildValue = incrementCount(guildCounts, guildKey);
    if (guildValue > env.OWNER_DAILY_CAP_GUILD) {
      throw new Error('Guild owner messaging cap reached');
    }
  }
};

const ownerRateLimit = { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } };

export const registerOwnerRoutes = async (app: FastifyInstance) => {
  const env = loadApiEnv();

  app.get('/owner/guilds', ownerRateLimit, async (request, reply) => {
    if (!(await requireOwner(request, reply))) return;
    const guilds = await fetchOwnerGuilds();
    const configs = await prisma.guildConfig.findMany();
    const entitlements = await prisma.entitlement.findMany({ where: { guildId: { not: null } } });

    return guilds.map((guild) => {
      const config = configs.find((item) => item.id === guild.id);
      const entitlement = entitlements.find((item) => item.guildId === guild.id);
      return {
        ...guild,
        premium: entitlement?.plan !== 'free',
        enabledModules: {
          autoMod: config?.autoModEnabled ?? false,
          welcome: config?.welcomeEnabled ?? true,
          tickets: Boolean(config?.ticketPanelChannelId),
        },
      };
    });
  });

  app.get('/owner/guilds/:guildId/channels', ownerRateLimit, async (request, reply) => {
    if (!(await requireOwner(request, reply))) return;
    const { guildId } = request.params as { guildId: string };
    return fetchOwnerChannels(guildId);
  });

  app.get('/owner/guilds/:guildId/roles', ownerRateLimit, async (request, reply) => {
    if (!(await requireOwner(request, reply))) return;
    const { guildId } = request.params as { guildId: string };
    return fetchOwnerRoles(guildId);
  });

  app.get('/owner/guilds/:guildId/members', ownerRateLimit, async (request, reply) => {
    if (!(await requireOwner(request, reply))) return;
    const { guildId } = request.params as { guildId: string };
    const querySchema = z.object({
      limit: z.coerce.number().min(1).max(100).optional(),
      after: z.string().optional(),
    });
    const query = querySchema.parse(request.query);
    return fetchOwnerMembers(guildId, query.limit, query.after);
  });

  app.get('/owner/guilds/:guildId/messages', ownerRateLimit, async (request, reply) => {
    if (!(await requireOwner(request, reply))) return;
    const { guildId } = request.params as { guildId: string };
    const querySchema = z.object({
      channelId: z.string().min(1),
      limit: z.coerce.number().min(1).max(100).optional(),
      before: z.string().optional(),
    });
    const query = querySchema.parse(request.query);
    return fetchOwnerMessages(guildId, query.channelId, query.limit, query.before);
  });

  app.post('/owner/send/channel', ownerRateLimit, async (request, reply) => {
    const owner = await requireOwner(request, reply);
    if (!owner) return;
    if (env.DISABLE_OWNER_MESSAGING) {
      return reply.status(403).send({ error: 'Owner messaging disabled' });
    }
    const bodySchema = z.object({
      guildId: z.string().min(1),
      channelId: z.string().min(1),
      content: z.string().min(1).max(1900),
      embed: z.record(z.unknown()).optional(),
    });
    const body = bodySchema.parse(request.body);

    let success = false;
    let reason: string | undefined;
    try {
      enforceCaps(body.guildId);
      const result = await sendOwnerChannel(body);
      success = true;
      const config = await prisma.guildConfig.findUnique({ where: { id: body.guildId } });
      if (config?.logChannelId) {
        await sendOwnerChannel({
          guildId: body.guildId,
          channelId: config.logChannelId,
          content: `Owner action: sent a message to <#${body.channelId}>`,
        });
      }
      return result;
    } catch (error) {
      reason = (error as Error).message;
      throw error;
    } finally {
      await logAudit({
        actorId: owner.id,
        action: 'owner.send.channel',
        targetId: body.channelId,
        guildId: body.guildId,
        channelId: body.channelId,
        payload: body,
        success,
        reason,
      });
    }
  });

  app.post('/owner/send/dm', ownerRateLimit, async (request, reply) => {
    const owner = await requireOwner(request, reply);
    if (!owner) return;
    if (env.DISABLE_OWNER_MESSAGING) {
      return reply.status(403).send({ error: 'Owner messaging disabled' });
    }
    const bodySchema = z.object({
      userId: z.string().min(1),
      content: z.string().min(1).max(1900),
      embed: z.record(z.unknown()).optional(),
    });
    const body = bodySchema.parse(request.body);

    let success = false;
    let reason: string | undefined;
    try {
      enforceCaps();
      const result = await sendOwnerDm(body);
      success = true;
      return result;
    } catch (error) {
      reason = (error as Error).message;
      throw error;
    } finally {
      await logAudit({
        actorId: owner.id,
        action: 'owner.send.dm',
        targetId: body.userId,
        payload: body,
        success,
        reason,
      });
    }
  });

  app.post('/owner/send/role', ownerRateLimit, async (request, reply) => {
    const owner = await requireOwner(request, reply);
    if (!owner) return;
    if (env.DISABLE_OWNER_MESSAGING) {
      return reply.status(403).send({ error: 'Owner messaging disabled' });
    }
    const bodySchema = z.object({
      guildId: z.string().min(1),
      roleId: z.string().min(1),
      content: z.string().min(1).max(1900),
      embed: z.record(z.unknown()).optional(),
      dryRun: z.coerce.boolean().optional(),
    });
    const body = bodySchema.parse(request.body);

    const config = await prisma.guildConfig.findUnique({ where: { id: body.guildId } });
    if (!config?.allowOwnerBulkDm) {
      return reply.status(403).send({ error: 'Bulk DM is disabled for this guild' });
    }

    let success = false;
    let reason: string | undefined;
    try {
      if (!body.dryRun) {
        enforceCaps(body.guildId);
      }
      const result = await sendOwnerRole(body);
      success = true;
      if (config.logChannelId && !body.dryRun) {
        await sendOwnerChannel({
          guildId: body.guildId,
          channelId: config.logChannelId,
          content: `Owner action: bulk DM initiated for role <@&${body.roleId}>`,
        });
      }
      return result;
    } catch (error) {
      reason = (error as Error).message;
      throw error;
    } finally {
      await logAudit({
        actorId: owner.id,
        action: 'owner.send.role',
        targetId: body.roleId,
        guildId: body.guildId,
        payload: body,
        success,
        reason,
      });
    }
  });
};
