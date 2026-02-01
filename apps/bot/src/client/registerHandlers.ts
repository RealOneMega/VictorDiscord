import type { Client } from 'discord.js';
import { registerEventHandlers } from '../handlers/eventHandler.js';
import { registerInteractionHandler } from '../handlers/interactionHandler.js';
import { registerErrorHandler } from '../handlers/errorHandler.js';

export const registerHandlers = async (client: Client) => {
  await registerEventHandlers(client);
  registerInteractionHandler(client);
  registerErrorHandler(client);
};
