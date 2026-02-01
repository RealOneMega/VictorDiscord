import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { ModalSubmitInteraction } from 'discord.js';
import { z, type ZodSchema } from 'zod';

export interface ModalDefinition<T> {
  customIdPrefix: string;
  schema: ZodSchema<T>;
  handle: (interaction: ModalSubmitInteraction, data: T) => Promise<void>;
}

const modalRegistry = new Map<string, ModalDefinition<unknown>>();
let loaded = false;

const resolveModalFiles = async () => {
  const root = path.dirname(fileURLToPath(import.meta.url));
  const interactionsDir = path.join(root, '..', 'interactions', 'modals');
  const entries = await readdir(interactionsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js')))
    .map((entry) => path.join(interactionsDir, entry.name));
};

export const handleModalSubmitInteraction = async (interaction: ModalSubmitInteraction) => {
  if (!loaded) {
    const files = await resolveModalFiles();
    await Promise.all(
      files.map(async (filePath) => {
        const module = (await import(pathToFileURL(filePath).toString())) as {
          modal: ModalDefinition<unknown>;
        };
        modalRegistry.set(module.modal.customIdPrefix, module.modal);
      }),
    );
    loaded = true;
  }

  const entry = Array.from(modalRegistry.values()).find((definition) =>
    interaction.customId.startsWith(definition.customIdPrefix),
  );

  if (!entry) {
    await interaction.reply({ content: 'Modal no longer active.', ephemeral: true });
    return;
  }

  const fields = Object.fromEntries(
    interaction.fields.fields.map((field) => [field.customId, field.value]),
  );

  const parsed = entry.schema.safeParse(fields);
  if (!parsed.success) {
    const message = parsed.error.errors.map((err) => err.message).join(', ');
    await interaction.reply({ content: `Invalid input: ${message}`, ephemeral: true });
    return;
  }

  await entry.handle(interaction, parsed.data);
};

export const modalSchemas = {
  pollCreate: z.object({
    question: z.string().min(5, 'Provide a longer question.'),
    options: z.string().min(3, 'Provide at least one option.'),
  }),
};
