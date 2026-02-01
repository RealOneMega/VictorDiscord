import { SlashCommandBuilder } from 'discord.js';
import type { CommandDefinition } from '../handlers/commandHandler.js';

export const command: CommandDefinition = {
  data: new SlashCommandBuilder()
    .setName('music')
    .setDescription('Control music playback via Lavalink.')
    .addSubcommand((sub) =>
      sub
        .setName('play')
        .setDescription('Play a track by search query or URL.')
        .addStringOption((option) =>
          option.setName('query').setDescription('Track query or URL.').setRequired(true),
        ),
    )
    .addSubcommand((sub) => sub.setName('pause').setDescription('Pause playback.'))
    .addSubcommand((sub) => sub.setName('skip').setDescription('Skip the current track.')),
  handlerKey: 'music',
  cooldownSeconds: 3,
  permissions: {
    guildOnly: true,
  },
};
