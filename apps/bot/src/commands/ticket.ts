import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { CommandDefinition } from '../handlers/commandHandler.js';

export const command: CommandDefinition = {
  data: new SlashCommandBuilder().setName('ticket').setDescription('Create a ticket panel.'),
  handlerKey: 'ticket',
  permissions: {
    guildOnly: true,
    requiredPermissions: [PermissionFlagsBits.ManageChannels],
  },
};
