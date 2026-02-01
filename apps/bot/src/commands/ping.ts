import { SlashCommandBuilder } from 'discord.js';
import type { CommandDefinition } from '../handlers/commandHandler.js';

export const command: CommandDefinition = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Check bot latency.'),
  handlerKey: 'ping',
  cooldownSeconds: 5,
};
