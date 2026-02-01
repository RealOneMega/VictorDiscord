import type { ButtonDefinition } from '../../handlers/buttonHandler.js';
import { createTicketChannel } from '../../services/commands/ticketService.js';

export const button: ButtonDefinition = {
  customIdPrefix: 'ticket:create',
  handle: async (interaction) => {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: 'Tickets are only available in servers.', ephemeral: true });
      return;
    }
    await createTicketChannel(interaction.guild, interaction);
  },
};
