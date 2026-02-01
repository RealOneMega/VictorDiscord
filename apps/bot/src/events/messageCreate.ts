import type { EventDefinition } from '../handlers/eventHandler.js';
import { loadBotEnv } from '../utils/config.js';
import { queueXp } from '../services/levelingService.js';

export const event: EventDefinition = {
  event: 'messageCreate',
  debounceMs: 200,
  execute: async (message) => {
    if (!message || message.author?.bot) {
      return;
    }

    const env = loadBotEnv();
    if (env.ENABLE_AUTOMOD && message.content.includes('discord.gg')) {
      await message.delete().catch(() => undefined);
    }

    if (env.ENABLE_LEVELING && message.guildId) {
      queueXp(message.author.id, message.guildId, 1);
    }
  },
};
