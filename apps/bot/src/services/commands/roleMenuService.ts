import type { ChatInputCommandInteraction } from 'discord.js';
import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import type { EntitlementResult } from '@victor/shared';

export const handleRoleMenuCommand = async (
  interaction: ChatInputCommandInteraction,
  _entitlement: EntitlementResult,
) => {
  const roles = interaction.options.getString('roles', true);
  const roleIds = roles.split(',').map((roleId) => roleId.trim()).filter(Boolean);

  if (roleIds.length === 0) {
    await interaction.reply({ content: 'Provide at least one role ID.', ephemeral: true });
    return;
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId('role:menu')
    .setPlaceholder('Select roles to toggle')
    .setMinValues(0)
    .setMaxValues(Math.min(roleIds.length, 5));

  roleIds.forEach((roleId) => {
    menu.addOptions(
      new StringSelectMenuOptionBuilder().setLabel(`Role ${roleId}`).setValue(roleId),
    );
  });

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);

  await interaction.reply({
    content: 'Choose roles to toggle:',
    components: [row],
  });
};
