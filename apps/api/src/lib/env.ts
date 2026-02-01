import { z } from 'zod';

const apiEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),
  DISCORD_CLIENT_SECRET: z.string().min(1),
  DISCORD_REDIRECT_URI: z.string().url(),
  SESSION_SECRET: z.string().min(16),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  DASHBOARD_URL: z.string().url().default('http://localhost:3000'),
  OWNER_IDS: z.string().optional(),
  DISABLE_OWNER_MESSAGING: z.coerce.boolean().default(false),
  OWNER_DAILY_CAP_GLOBAL: z.coerce.number().default(500),
  OWNER_DAILY_CAP_GUILD: z.coerce.number().default(100),
  BOT_INTERNAL_API_URL: z.string().url().default('http://127.0.0.1:4001'),
  BOT_INTERNAL_API_TOKEN: z.string().min(1),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export const loadApiEnv = (): ApiEnv => apiEnvSchema.parse(process.env);
