import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { StringSelectMenuInteraction } from 'discord.js';

export interface SelectDefinition {
  customIdPrefix: string;
  handle: (interaction: StringSelectMenuInteraction, customId: string) => Promise<void>;
}

const selectRegistry = new Map<string, SelectDefinition>();
let loaded = false;

const resolveSelectFiles = async () => {
  const root = path.dirname(fileURLToPath(import.meta.url));
  const interactionsDir = path.join(root, '..', 'interactions', 'selects');
  const entries = await readdir(interactionsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js')))
    .map((entry) => path.join(interactionsDir, entry.name));
};

export const handleSelectMenuInteraction = async (interaction: StringSelectMenuInteraction) => {
  if (!loaded) {
    const files = await resolveSelectFiles();
    await Promise.all(
      files.map(async (filePath) => {
        const module = (await import(pathToFileURL(filePath).toString())) as {
          select: SelectDefinition;
        };
        selectRegistry.set(module.select.customIdPrefix, module.select);
      }),
    );
    loaded = true;
  }

  const entry = Array.from(selectRegistry.values()).find((definition) =>
    interaction.customId.startsWith(definition.customIdPrefix),
  );

  if (!entry) {
    await interaction.reply({ content: 'Select menu no longer active.', ephemeral: true });
    return;
  }

  await entry.handle(interaction, interaction.customId);
};
