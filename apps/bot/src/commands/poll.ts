import { SlashCommandBuilder } from 'discord.js';
import type { CommandDefinition } from '../handlers/commandHandler.js';
export const command: CommandDefinition = {
  data: new SlashCommandBuilder().setName('poll').setDescription('Create a poll via modal.'),
  handlerKey: 'poll',
  cooldownSeconds: 10,
};
