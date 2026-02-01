import type { ChatInputCommandInteraction } from 'discord.js';
import type { EntitlementResult } from '@victor/shared';

export const handleModerationCommand = async (
  interaction: ChatInputCommandInteraction,
  _entitlement: EntitlementResult,
) => {
  const subcommand = interaction.options.getSubcommand();

  if (!interaction.inGuild()) {
    await interaction.reply({ content: 'Use moderation commands in a server.', ephemeral: true });
    return;
  }

  if (subcommand === 'purge') {
    const count = interaction.options.getInteger('count', true);
    await interaction.deferReply({ ephemeral: true });
    const channel = interaction.channel;
    if (!channel || !('bulkDelete' in channel)) {
      await interaction.editReply('This channel cannot be purged.');
      return;
    }
    await channel.bulkDelete(count, true);
    await interaction.editReply(`Deleted ${count} messages.`);
    return;
  }

  if (subcommand === 'timeout') {
    const member = interaction.options.getMember('member');
    const minutes = interaction.options.getInteger('minutes', true);
    if (!member || !('timeout' in member)) {
      await interaction.reply({ content: 'Member not found.', ephemeral: true });
      return;
    }
    await member.timeout(minutes * 60 * 1000, 'Moderation timeout');
    await interaction.reply({ content: `Timed out ${member.user.tag}.`, ephemeral: true });
    return;
  }

  if (subcommand === 'warn') {
    const member = interaction.options.getMember('member');
    const reason = interaction.options.getString('reason') ?? 'No reason provided';
    if (!member || !('send' in member.user)) {
      await interaction.reply({ content: 'Member not found.', ephemeral: true });
      return;
    }
    await member.user.send(`You have been warned: ${reason}`).catch(() => undefined);
    await interaction.reply({ content: `Warned ${member.user.tag}.`, ephemeral: true });
  }
};
