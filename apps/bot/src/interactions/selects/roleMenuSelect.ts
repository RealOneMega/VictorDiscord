import type { SelectDefinition } from '../../handlers/selectMenuHandler.js';

export const select: SelectDefinition = {
  customIdPrefix: 'role:menu',
  handle: async (interaction) => {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: 'Role menus are only available in servers.', ephemeral: true });
      return;
    }

    const member = interaction.member;
    if (!member || !('roles' in member)) {
      await interaction.reply({ content: 'Unable to update roles.', ephemeral: true });
      return;
    }

    const selected = new Set(interaction.values);
    const currentRoles = new Set(member.roles.cache.map((role) => role.id));

    const toAdd = [...selected].filter((roleId) => !currentRoles.has(roleId));
    const toRemove = interaction.component.options
      .map((option) => option.value)
      .filter((roleId) => currentRoles.has(roleId) && !selected.has(roleId));

    await member.roles.add(toAdd).catch(() => undefined);
    await member.roles.remove(toRemove).catch(() => undefined);

    await interaction.reply({ content: 'Roles updated.', ephemeral: true });
  },
};
