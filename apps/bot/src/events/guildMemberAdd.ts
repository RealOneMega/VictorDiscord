import type { EventDefinition } from '../handlers/eventHandler.js';
import { loadBotEnv } from '../utils/config.js';

export const event: EventDefinition = {
  event: 'guildMemberAdd',
  execute: async (member) => {
    const env = loadBotEnv();
    if (!env.ENABLE_WELCOME) {
      return;
    }
    const channel = member.guild.systemChannel;
    if (channel) {
      await channel.send(`Welcome ${member.user}! Please check the rules and enjoy your stay.`);
    }
  },
};
