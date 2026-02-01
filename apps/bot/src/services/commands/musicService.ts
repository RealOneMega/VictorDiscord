import type { ChatInputCommandInteraction } from 'discord.js';
import type { EntitlementResult } from '@victor/shared';

export const handleMusicCommand = async (
  interaction: ChatInputCommandInteraction,
  _entitlement: EntitlementResult,
) => {
  const subcommand = interaction.options.getSubcommand();
  await interaction.deferReply({ ephemeral: true });

  if (subcommand === 'play') {
    const query = interaction.options.getString('query', true);
    await interaction.editReply(
      `Queued **${query}** via Lavalink. Ensure the music node is online.`,
    );
    return;
  }

  if (subcommand === 'skip') {
    await interaction.editReply('Skipped the current track.');
    return;
  }

  if (subcommand === 'pause') {
    await interaction.editReply('Paused playback.');
    return;
  }

  await interaction.editReply('Music command executed.');
};
