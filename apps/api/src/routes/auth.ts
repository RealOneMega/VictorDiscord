import type { FastifyInstance } from 'fastify';
import { loadApiEnv } from '../lib/env.js';

const DISCORD_TOKEN_URL = 'https://discord.com/api/oauth2/token';
const DISCORD_API_URL = 'https://discord.com/api/users/@me';

export const registerAuthRoutes = async (app: FastifyInstance) => {
  const env = loadApiEnv();

  app.get('/auth/login', async (_request, reply) => {
    const params = new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      redirect_uri: env.DISCORD_REDIRECT_URI,
      response_type: 'code',
      scope: 'identify guilds',
    });
    return reply.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
  });

  app.get('/auth/callback', async (request, reply) => {
    const { code } = request.query as { code?: string };
    if (!code) {
      return reply.status(400).send('Missing code');
    }

    const body = new URLSearchParams({
      client_id: env.DISCORD_CLIENT_ID,
      client_secret: env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: env.DISCORD_REDIRECT_URI,
      code,
    });

    const tokenResponse = await fetch(DISCORD_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    const tokenData = (await tokenResponse.json()) as { access_token?: string };
    if (!tokenData.access_token) {
      return reply.status(400).send('OAuth failed');
    }

    const userResponse = await fetch(DISCORD_API_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const user = await userResponse.json();

    request.session.set('user', user);
    return reply.redirect(env.DASHBOARD_URL);
  });

  app.get('/auth/me', async (request) => {
    return request.session.get('user') ?? null;
  });

  app.post('/auth/logout', async (request) => {
    request.session.delete();
    return { status: 'ok' };
  });
};
