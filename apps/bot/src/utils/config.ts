import { z } from 'zod';

const botEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),
  API_BASE_URL: z.string().url().default('http://localhost:3001'),
  INTERNAL_API_PORT: z.coerce.number().default(4001),
  INTERNAL_API_TOKEN: z.string().min(1),
  LAVALINK_HOST: z.string().min(1),
  LAVALINK_PASSWORD: z.string().min(1),
  LAVALINK_PORT: z.coerce.number().default(2333),
  ENABLE_AUTOMOD: z.coerce.boolean().default(false),
  ENABLE_LEVELING: z.coerce.boolean().default(true),
  ENABLE_WELCOME: z.coerce.boolean().default(true),
  ENABLE_TICKETS: z.coerce.boolean().default(true),
  ENABLE_OWNER_CONSOLE_MEMBERS: z.coerce.boolean().default(false),
});

export type BotEnv = z.infer<typeof botEnvSchema>;

export const loadBotEnv = (): BotEnv => {
  return botEnvSchema.parse(process.env);
};

export const featureFlags = (env: BotEnv) => ({
  automod: env.ENABLE_AUTOMOD,
  leveling: env.ENABLE_LEVELING,
  welcome: env.ENABLE_WELCOME,
  tickets: env.ENABLE_TICKETS,
  ownerConsoleMembers: env.ENABLE_OWNER_CONSOLE_MEMBERS,
});
