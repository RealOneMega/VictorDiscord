import type { ChatInputCommandInteraction } from 'discord.js';
import type { EntitlementResult } from '@victor/shared';

export const handlePingCommand = async (
  interaction: ChatInputCommandInteraction,
  _entitlement: EntitlementResult,
) => {
  const sent = await interaction.reply({
    content: 'Pinging...',
    ephemeral: true,
    fetchReply: true,
  });

  const latency = sent.createdTimestamp - interaction.createdTimestamp;
  await interaction.editReply(`Pong! ${latency}ms`);
};
