import type { Client, Interaction } from 'discord.js';
import { handleCommandInteraction } from './commandHandler.js';
import { handleButtonInteraction } from './buttonHandler.js';
import { handleSelectMenuInteraction } from './selectMenuHandler.js';
import { handleModalSubmitInteraction } from './modalHandler.js';
import { logger } from '../utils/logger.js';

export const registerInteractionHandler = (client: Client) => {
  client.on('interactionCreate', async (interaction: Interaction) => {
    try {
      if (interaction.isChatInputCommand()) {
        await handleCommandInteraction(interaction);
        return;
      }
      if (interaction.isButton()) {
        await handleButtonInteraction(interaction);
        return;
      }
      if (interaction.isStringSelectMenu()) {
        await handleSelectMenuInteraction(interaction);
        return;
      }
      if (interaction.isModalSubmit()) {
        await handleModalSubmitInteraction(interaction);
      }
    } catch (error) {
      logger.error({ err: error }, 'Interaction handler failed');
      if (interaction.isRepliable()) {
        await interaction.reply({
          content: 'Something went wrong while processing that interaction.',
          ephemeral: true,
        });
      }
    }
  });
};
