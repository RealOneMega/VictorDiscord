import type { ChatInputCommandInteraction } from 'discord.js';
import type { EntitlementResult } from '@victor/shared';

export const handleLevelCommand = async (
  interaction: ChatInputCommandInteraction,
  _entitlement: EntitlementResult,
) => {
  await interaction.reply({
    content: 'Leveling stats are updated every 60 seconds. Visit the dashboard for details.',
    ephemeral: true,
  });
};
