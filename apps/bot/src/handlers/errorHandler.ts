import type { Client } from 'discord.js';
import { logger } from '../utils/logger.js';

export const registerErrorHandler = (client: Client) => {
  client.on('error', (error) => {
    logger.error({ err: error }, 'Discord client error');
  });

  process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'Unhandled promise rejection');
  });

  process.on('uncaughtException', (error) => {
    logger.error({ err: error }, 'Uncaught exception');
  });
};
