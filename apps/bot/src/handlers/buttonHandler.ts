import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { ButtonInteraction } from 'discord.js';

export interface ButtonDefinition {
  customIdPrefix: string;
  expiresAt?: number;
  handle: (interaction: ButtonInteraction, customId: string) => Promise<void>;
}

const buttonRegistry = new Map<string, ButtonDefinition>();
let loaded = false;

const resolveButtonFiles = async () => {
  const root = path.dirname(fileURLToPath(import.meta.url));
  const interactionsDir = path.join(root, '..', 'interactions', 'buttons');
  const entries = await readdir(interactionsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js')))
    .map((entry) => path.join(interactionsDir, entry.name));
};

export const handleButtonInteraction = async (interaction: ButtonInteraction) => {
  if (!loaded) {
    const files = await resolveButtonFiles();
    await Promise.all(
      files.map(async (filePath) => {
        const module = (await import(pathToFileURL(filePath).toString())) as {
          button: ButtonDefinition;
        };
        buttonRegistry.set(module.button.customIdPrefix, module.button);
      }),
    );
    loaded = true;
  }

  const entry = Array.from(buttonRegistry.values()).find((definition) =>
    interaction.customId.startsWith(definition.customIdPrefix),
  );

  if (!entry) {
    await interaction.reply({ content: 'Button no longer active.', ephemeral: true });
    return;
  }

  if (entry.expiresAt && entry.expiresAt < Date.now()) {
    await interaction.reply({ content: 'This button has expired.', ephemeral: true });
    return;
  }

  await entry.handle(interaction, interaction.customId);
};
