import { GatewayIntentBits, IntentsBitField } from 'discord.js';
import type { BotEnv } from '../utils/config.js';
import { featureFlags } from '../utils/config.js';

const PRIVILEGED_INTENTS = new Set([GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent]);

export const deriveIntents = (env: BotEnv): IntentsBitField => {
  const flags = featureFlags(env);
  const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions];

  if (flags.automod) {
    intents.push(GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent);
  }

  if (flags.welcome || flags.tickets || flags.leveling || flags.ownerConsoleMembers) {
    intents.push(GatewayIntentBits.GuildMembers);
  }

  return new IntentsBitField(intents);
};

export const assertPrivilegedIntents = (intents: IntentsBitField) => {
  const missing = Array.from(PRIVILEGED_INTENTS).filter((intent) => !intents.has(intent));
  if (missing.length > 0) {
    throw new Error(
      `Missing privileged intents: ${missing.join(', ')}. Enable them in the Discord developer portal.`,
    );
  }
};
