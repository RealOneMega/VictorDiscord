import Stripe from 'stripe';
import { loadApiEnv } from './env.js';

const env = loadApiEnv();

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export const verifyStripeSignature = (payload: Buffer, signature: string) => {
  return stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
};
