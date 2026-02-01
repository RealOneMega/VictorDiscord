import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),
  DISCORD_CLIENT_SECRET: z.string().min(1),
  DISCORD_REDIRECT_URI: z.string().url(),
  DATABASE_URL: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  SESSION_SECRET: z.string().min(16),
  LAVALINK_HOST: z.string().min(1),
  LAVALINK_PASSWORD: z.string().min(1),
  LAVALINK_PORT: z.coerce.number().default(2333),
});

export type Env = z.infer<typeof envSchema>;

export const loadEnv = (input: Record<string, string | undefined>): Env => {
  return envSchema.parse(input);
};
