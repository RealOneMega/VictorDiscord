import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Client } from 'discord.js';
import { logger } from '../utils/logger.js';

export interface EventDefinition {
  event: string;
  once?: boolean;
  debounceMs?: number;
  execute: (...args: unknown[]) => Promise<void> | void;
}

const debounceMap = new Map<string, NodeJS.Timeout>();

const resolveEventFiles = async () => {
  const root = path.dirname(fileURLToPath(import.meta.url));
  const eventsDir = path.join(root, '..', 'events');
  const entries = await readdir(eventsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js')))
    .map((entry) => {
    return path.join(eventsDir, entry.name);
  });
};

export const registerEventHandlers = async (client: Client) => {
  const eventFiles = await resolveEventFiles();

  await Promise.all(
    eventFiles.map(async (filePath) => {
      const module = (await import(pathToFileURL(filePath).toString())) as {
        event: EventDefinition;
      };

      const definition = module.event;

      const handler = (...args: unknown[]) => {
        if (definition.debounceMs) {
          const key = `${definition.event}:${definition.execute.toString()}`;
          const existing = debounceMap.get(key);
          if (existing) {
            clearTimeout(existing);
          }
          debounceMap.set(
            key,
            setTimeout(() => {
              Promise.resolve(definition.execute(...args)).catch((error) => {
                logger.error({ err: error }, 'Event handler failed');
              });
              debounceMap.delete(key);
            }, definition.debounceMs),
          );
          return;
        }

        Promise.resolve(definition.execute(...args)).catch((error) => {
          logger.error({ err: error }, 'Event handler failed');
        });
      };

      if (definition.once) {
        client.once(definition.event, handler);
      } else {
        client.on(definition.event, handler);
      }
    }),
  );
};
