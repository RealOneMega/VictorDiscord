import { SlashCommandBuilder } from 'discord.js';
import type { CommandDefinition } from '../handlers/commandHandler.js';

export const command: CommandDefinition = {
  data: new SlashCommandBuilder()
    .setName('rolemenu')
    .setDescription('Create a role selection menu.')
    .addStringOption((option) =>
      option
        .setName('roles')
        .setDescription('Comma separated role IDs')
        .setRequired(true),
    ),
  handlerKey: 'rolemenu',
  permissions: {
    guildOnly: true,
  },
};
