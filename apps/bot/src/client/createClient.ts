import { Client, Partials } from 'discord.js';
import { assertPrivilegedIntents, deriveIntents } from './intentManager.js';
import { featureFlags, loadBotEnv } from '../utils/config.js';
import { logger } from '../utils/logger.js';

export const createClient = () => {
  const env = loadBotEnv();
  const intents = deriveIntents(env);
  const flags = featureFlags(env);
  if (flags.automod || flags.leveling || flags.tickets || flags.welcome || flags.ownerConsoleMembers) {
    assertPrivilegedIntents(intents);
  }

  const client = new Client({
    intents,
    partials: [Partials.Channel],
  });

  client.once('ready', () => {
    logger.info({ user: client.user?.tag }, 'Discord client ready');
  });

  return { client, env };
};
