import fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import secureSession from '@fastify/secure-session';
import rawBody from '@fastify/raw-body';
import { loadApiEnv } from './lib/env.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerEntitlementRoutes } from './routes/entitlements.js';
import { registerLevelRoutes } from './routes/levels.js';
import { registerStripeRoutes } from './routes/stripe.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerGuildRoutes } from './routes/guilds.js';
import { registerAnalyticsRoutes } from './routes/analytics.js';
import { registerOwnerRoutes } from './routes/owner.js';

export const buildServer = () => {
  const env = loadApiEnv();
  const app = fastify({
    logger: true,
    trustProxy: true,
  });

  app.register(cors, {
    origin: env.DASHBOARD_URL,
    credentials: true,
  });

  app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  app.register(secureSession, {
    key: Buffer.from(env.SESSION_SECRET, 'utf-8'),
    cookieName: 'victor.session',
    cookie: {
      secure: env.NODE_ENV === 'production',
      path: '/',
    },
  });

  app.register(rawBody, {
    field: 'rawBody',
    global: false,
    encoding: false,
    routes: ['/stripe/webhook'],
  });

  app.register(registerHealthRoutes);
  app.register(registerEntitlementRoutes);
  app.register(registerLevelRoutes);
  app.register(registerStripeRoutes);
  app.register(registerAuthRoutes);
  app.register(registerGuildRoutes);
  app.register(registerAnalyticsRoutes);
  app.register(registerOwnerRoutes);

  return { app, env };
};
