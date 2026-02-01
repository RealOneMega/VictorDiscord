import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { CommandDefinition } from '../handlers/commandHandler.js';

export const command: CommandDefinition = {
  data: new SlashCommandBuilder()
    .setName('moderation')
    .setDescription('Moderation tools.')
    .addSubcommand((sub) =>
      sub
        .setName('purge')
        .setDescription('Bulk delete messages.')
        .addIntegerOption((option) =>
          option.setName('count').setDescription('Number of messages').setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('timeout')
        .setDescription('Timeout a member.')
        .addUserOption((option) =>
          option.setName('member').setDescription('Member to timeout').setRequired(true),
        )
        .addIntegerOption((option) =>
          option.setName('minutes').setDescription('Minutes').setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('warn')
        .setDescription('Warn a member.')
        .addUserOption((option) =>
          option.setName('member').setDescription('Member to warn').setRequired(true),
        )
        .addStringOption((option) => option.setName('reason').setDescription('Reason')),
    ),
  handlerKey: 'moderation',
  permissions: {
    guildOnly: true,
    requiredPermissions: [PermissionFlagsBits.ManageMessages],
  },
};
