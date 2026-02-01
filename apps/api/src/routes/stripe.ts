import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/db.js';
import { verifyStripeSignature } from '../lib/stripe.js';

export const registerStripeRoutes = async (app: FastifyInstance) => {
  app.post('/stripe/webhook', { config: { rawBody: true } }, async (request, reply) => {
    const signature = request.headers['stripe-signature'];
    if (!signature || typeof signature !== 'string') {
      return reply.status(400).send('Missing signature');
    }

    let event;
    try {
      const rawBody = (request as typeof request & { rawBody?: Buffer }).rawBody;
      if (!rawBody) {
        return reply.status(400).send('Missing raw body');
      }
      event = verifyStripeSignature(rawBody, signature);
    } catch (error) {
      return reply.status(400).send('Invalid signature');
    }

    if (event.type.startsWith('customer.subscription')) {
      const subscription = event.data.object as { id: string; status: string; metadata?: Record<string, string> };
      const scope = subscription.metadata?.scope ?? 'user';
      const targetId = subscription.metadata?.targetId;
      if (targetId) {
        await prisma.entitlement.upsert({
          where: { id: subscription.id },
          update: {
            plan: subscription.status === 'active' ? 'pro' : 'free',
            scope,
          },
          create: {
            id: subscription.id,
            plan: subscription.status === 'active' ? 'pro' : 'free',
            scope,
            features: ['scheduled_polls', 'poll_exports', 'recurring_reminders'],
            userId: scope === 'user' ? targetId : undefined,
            guildId: scope === 'guild' ? targetId : undefined,
          },
        });
      }
    }

    return { received: true };
  });
};
