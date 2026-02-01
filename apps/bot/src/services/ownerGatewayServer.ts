import http from 'node:http';
import { once } from 'node:events';
import { Buffer } from 'node:buffer';
import type { Client } from 'discord.js';
import { GatewayIntentBits } from 'discord.js';
import {
  fetchMessages,
  listChannels,
  listGuilds,
  listMembers,
  listRoles,
  sendChannelMessage,
  sendDm,
  sendRoleMessage,
} from './discordGatewayService.js';
import { logger } from '../utils/logger.js';

interface OwnerGatewayOptions {
  port: number;
  token: string;
}

interface MessageQueueItem {
  execute: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}

const queue: MessageQueueItem[] = [];
let processing = false;

const processQueue = async () => {
  if (processing) return;
  processing = true;
  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) continue;
    try {
      const result = await item.execute();
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 1100));
  }
  processing = false;
};

const enqueue = <T>(execute: () => Promise<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    queue.push({ execute, resolve, reject });
    processQueue().catch((error) => logger.error({ err: error }, 'Owner queue failed'));
  });
};

const readJson = async (req: http.IncomingMessage) => {
  const chunks: Buffer[] = [];
  req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
  await once(req, 'end');
  if (chunks.length === 0) return null;
  return JSON.parse(Buffer.concat(chunks).toString('utf-8')) as Record<string, unknown>;
};

const unauthorized = (res: http.ServerResponse) => {
  res.writeHead(401, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Unauthorized' }));
};

const badRequest = (res: http.ServerResponse, message: string) => {
  res.writeHead(400, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: message }));
};

const ok = (res: http.ServerResponse, payload: unknown) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
};

const assertIntent = (client: Client, intent: GatewayIntentBits) => {
  if (!client.options.intents?.has(intent)) {
    throw new Error(`Missing required intent: ${GatewayIntentBits[intent]}`);
  }
};

export const startOwnerGatewayServer = (client: Client, options: OwnerGatewayOptions) => {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const auth = req.headers.authorization;

    if (auth !== `Bearer ${options.token}`) {
      return unauthorized(res);
    }

    try {
      if (req.method === 'GET' && url.pathname === '/owner/guilds') {
        return ok(res, listGuilds(client));
      }

      if (req.method === 'GET' && url.pathname.startsWith('/owner/guilds/') && url.pathname.endsWith('/channels')) {
        const guildId = url.pathname.split('/')[3];
        return ok(res, await listChannels(client, guildId));
      }

      if (req.method === 'GET' && url.pathname.startsWith('/owner/guilds/') && url.pathname.endsWith('/roles')) {
        const guildId = url.pathname.split('/')[3];
        const roles = await listRoles(client, guildId);
        return ok(
          res,
          roles.map((role) => ({ id: role.id, name: role.name, color: role.hexColor })),
        );
      }

      if (req.method === 'GET' && url.pathname.startsWith('/owner/guilds/') && url.pathname.endsWith('/members')) {
        const guildId = url.pathname.split('/')[3];
        assertIntent(client, GatewayIntentBits.GuildMembers);
        const rawLimit = Number(url.searchParams.get('limit') ?? '50');
        const limit = Math.min(Math.max(rawLimit, 1), 100);
        const after = url.searchParams.get('after') ?? undefined;
        return ok(res, await listMembers(client, guildId, limit, after));
      }

      if (req.method === 'GET' && url.pathname.startsWith('/owner/guilds/') && url.pathname.endsWith('/messages')) {
        const guildId = url.pathname.split('/')[3];
        const channelId = url.searchParams.get('channelId');
        if (!channelId) {
          return badRequest(res, 'channelId is required');
        }
        const rawLimit = Number(url.searchParams.get('limit') ?? '50');
        const limit = Math.min(Math.max(rawLimit, 1), 100);
        const before = url.searchParams.get('before') ?? undefined;
        return ok(res, await fetchMessages(client, guildId, channelId, limit, before));
      }

      if (req.method === 'POST' && url.pathname === '/owner/send/channel') {
        const body = await readJson(req);
        if (!body?.guildId || !body?.channelId || !body?.content) {
          return badRequest(res, 'guildId, channelId, content required');
        }
        const result = await enqueue(() =>
          sendChannelMessage(
            client,
            body.guildId as string,
            body.channelId as string,
            body.content as string,
            body.embed as Record<string, unknown> | undefined,
          ),
        );
        return ok(res, { status: 'ok', messageId: (result as { id?: string }).id });
      }

      if (req.method === 'POST' && url.pathname === '/owner/send/dm') {
        const body = await readJson(req);
        if (!body?.userId || !body?.content) {
          return badRequest(res, 'userId, content required');
        }
        const result = await enqueue(() =>
          sendDm(client, body.userId as string, body.content as string, body.embed as Record<string, unknown> | undefined),
        );
        return ok(res, { status: 'ok', messageId: (result as { id?: string }).id });
      }

      if (req.method === 'POST' && url.pathname === '/owner/send/role') {
        const body = await readJson(req);
        if (!body?.guildId || !body?.roleId || !body?.content) {
          return badRequest(res, 'guildId, roleId, content required');
        }
        assertIntent(client, GatewayIntentBits.GuildMembers);
        const tasks = await sendRoleMessage(
          client,
          body.guildId as string,
          body.roleId as string,
          body.content as string,
          body.embed as Record<string, unknown> | undefined,
        );
        if (body.dryRun) {
          return ok(res, { status: 'dry-run', recipients: tasks.length });
        }
        const results = await Promise.all(
          tasks.map((task) =>
            enqueue(() => task.member.send({ content: task.content, embeds: task.embed ? [task.embed] : [] })),
          ),
        );
        return ok(res, { status: 'ok', sent: results.length });
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    } catch (error) {
      logger.error({ err: error }, 'Owner gateway error');
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: (error as Error).message }));
    }
  });

  server.listen(options.port, '127.0.0.1');
  logger.info({ port: options.port }, 'Owner gateway server running');

  return () => server.close();
};
