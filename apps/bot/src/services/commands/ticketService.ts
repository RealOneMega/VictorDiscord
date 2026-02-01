import type { ChatInputCommandInteraction, ButtonInteraction, Guild } from 'discord.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } from 'discord.js';
import type { EntitlementResult } from '@victor/shared';

export const createTicketChannel = async (guild: Guild, interaction: ButtonInteraction) => {
  const channel = await guild.channels.create({
    name: `ticket-${interaction.user.username}`,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
    ],
  });
  await channel.send(`Welcome ${interaction.user}, a support agent will be with you soon.`);
  await interaction.reply({ content: `Ticket created: ${channel}`, ephemeral: true });
};

export const handleTicketCommand = async (
  interaction: ChatInputCommandInteraction,
  _entitlement: EntitlementResult,
) => {
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket:create')
      .setLabel('Open Ticket')
      .setStyle(ButtonStyle.Primary),
  );

  await interaction.reply({
    content: 'Need help? Open a private ticket below.',
    components: [row],
  });
};
