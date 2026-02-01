import type { ChatInputCommandInteraction } from 'discord.js';
import type { EntitlementResult } from '@victor/shared';
import { handlePingCommand } from './commands/pingService.js';
import { handlePollCommand } from './commands/pollService.js';
import { handleReminderCommand } from './commands/reminderService.js';
import { handleModerationCommand } from './commands/moderationService.js';
import { handleTicketCommand } from './commands/ticketService.js';
import { handleLevelCommand } from './commands/levelService.js';
import { handleMusicCommand } from './commands/musicService.js';
import { handleRoleMenuCommand } from './commands/roleMenuService.js';

export type CommandExecutor = (
  interaction: ChatInputCommandInteraction,
  entitlement: EntitlementResult,
) => Promise<void>;

const commandMap: Record<string, CommandExecutor> = {
  ping: handlePingCommand,
  poll: handlePollCommand,
  reminder: handleReminderCommand,
  moderation: handleModerationCommand,
  ticket: handleTicketCommand,
  level: handleLevelCommand,
  music: handleMusicCommand,
  rolemenu: handleRoleMenuCommand,
};

export const getCommandExecutor = (key: string) => commandMap[key];
