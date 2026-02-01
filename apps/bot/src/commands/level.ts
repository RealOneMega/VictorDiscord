import { SlashCommandBuilder } from 'discord.js';
import type { CommandDefinition } from '../handlers/commandHandler.js';

export const command: CommandDefinition = {
  data: new SlashCommandBuilder().setName('level').setDescription('View your level stats.'),
  handlerKey: 'level',
  cooldownSeconds: 5,
};
