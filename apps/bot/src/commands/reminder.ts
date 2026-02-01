import { SlashCommandBuilder } from 'discord.js';
import type { CommandDefinition } from '../handlers/commandHandler.js';

export const command: CommandDefinition = {
  data: new SlashCommandBuilder()
    .setName('reminder')
    .setDescription('Set a personal reminder.')
    .addIntegerOption((option) =>
      option.setName('minutes').setDescription('Minutes from now.').setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('message').setDescription('Reminder message.').setRequired(true),
    )
    .addBooleanOption((option) =>
      option.setName('recurring').setDescription('Recurring reminder (premium).'),
    ),
  handlerKey: 'reminder',
  cooldownSeconds: 5,
};
