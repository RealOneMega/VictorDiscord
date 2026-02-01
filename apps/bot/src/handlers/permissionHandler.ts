import type { ChatInputCommandInteraction, GuildMember, PermissionResolvable } from 'discord.js';

export interface PermissionRequirement {
  guildOnly?: boolean;
  requiredPermissions?: PermissionResolvable[];
}

export const checkPermissions = (
  interaction: ChatInputCommandInteraction,
  requirement?: PermissionRequirement,
): { allowed: boolean; reason?: string } => {
  if (!requirement) {
    return { allowed: true };
  }

  if (requirement.guildOnly && !interaction.inGuild()) {
    return { allowed: false, reason: 'This command can only be used in servers.' };
  }

  if (requirement.requiredPermissions && interaction.inGuild()) {
    const member = interaction.member as GuildMember | null;
    if (!member) {
      return { allowed: false, reason: 'Missing permissions context.' };
    }
    const missing = requirement.requiredPermissions.filter(
      (permission) => !member.permissions.has(permission),
    );
    if (missing.length > 0) {
      return { allowed: false, reason: 'You do not have permission to use this command.' };
    }
  }

  return { allowed: true };
};
