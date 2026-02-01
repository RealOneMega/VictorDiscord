import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { checkPermissions, type PermissionRequirement } from './permissionHandler.js';
import { resolveEntitlement, hasFeature } from './premiumHandler.js';
import { getCommandExecutor } from '../services/commandRouter.js';
import { loadBotEnv } from '../utils/config.js';
import { logger } from '../utils/logger.js';

export interface CommandDefinition {
  data: SlashCommandBuilder;
  handlerKey: string;
  permissions?: PermissionRequirement;
  cooldownSeconds?: number;
  featureFlag?: string;
  premiumFeature?: string;
}

const commandRegistry = new Map<string, CommandDefinition>();
const cooldowns = new Map<string, number>();
let loaded = false;

const resolveCommandFiles = async () => {
  const root = path.dirname(fileURLToPath(import.meta.url));
  const commandDir = path.join(root, '..', 'commands');
  const entries = await readdir(commandDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js')))
    .map((entry) => path.join(commandDir, entry.name));
};

const loadCommands = async () => {
  if (loaded) return;
  const files = await resolveCommandFiles();
  await Promise.all(
    files.map(async (filePath) => {
      const module = (await import(pathToFileURL(filePath).toString())) as {
        command: CommandDefinition;
      };
      commandRegistry.set(module.command.data.name, module.command);
    }),
  );
  loaded = true;
};

const checkCooldown = (userId: string, commandName: string, cooldownSeconds = 0) => {
  if (cooldownSeconds <= 0) return { allowed: true };
  const key = `${userId}:${commandName}`;
  const now = Date.now();
  const expiresAt = cooldowns.get(key);
  if (expiresAt && expiresAt > now) {
    const remaining = Math.ceil((expiresAt - now) / 1000);
    return { allowed: false, remaining };
  }
  cooldowns.set(key, now + cooldownSeconds * 1000);
  return { allowed: true };
};

export const handleCommandInteraction = async (interaction: ChatInputCommandInteraction) => {
  await loadCommands();
  const definition = commandRegistry.get(interaction.commandName);
  if (!definition) {
    await interaction.reply({ content: 'Command not available.', ephemeral: true });
    return;
  }

  const permissionCheck = checkPermissions(interaction, definition.permissions);
  if (!permissionCheck.allowed) {
    await interaction.reply({ content: permissionCheck.reason ?? 'Permission denied.', ephemeral: true });
    return;
  }

  const cooldownCheck = checkCooldown(
    interaction.user.id,
    interaction.commandName,
    definition.cooldownSeconds,
  );
  if (!cooldownCheck.allowed) {
    await interaction.reply({
      content: `Slow down! Try again in ${cooldownCheck.remaining}s.`,
      ephemeral: true,
    });
    return;
  }

  const env = loadBotEnv();
  const entitlement = await resolveEntitlement(interaction.user.id, interaction.guildId, {
    apiBaseUrl: env.API_BASE_URL,
  });

  if (!hasFeature(entitlement, definition.premiumFeature)) {
    await interaction.reply({
      content: 'This feature requires a premium plan. Visit the dashboard to upgrade.',
      ephemeral: true,
    });
    return;
  }

  const executor = getCommandExecutor(definition.handlerKey);
  if (!executor) {
    await interaction.reply({ content: 'Command handler not found.', ephemeral: true });
    return;
  }

  try {
    await executor(interaction, entitlement);
  } catch (error) {
    logger.error({ err: error }, 'Command execution failed');
    if (!interaction.replied) {
      await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
    }
  }
};
