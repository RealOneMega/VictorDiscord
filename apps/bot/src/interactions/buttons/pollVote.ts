import type { ButtonDefinition } from '../../handlers/buttonHandler.js';
import { handlePollVote } from '../../services/pollService.js';

export const button: ButtonDefinition = {
  customIdPrefix: 'poll:vote',
  handle: async (interaction, customId) => {
    const [, , pollId, optionIndexRaw] = customId.split(':');
    const optionIndex = Number(optionIndexRaw);
    if (!pollId || Number.isNaN(optionIndex)) {
      await interaction.reply({ content: 'Invalid poll selection.', ephemeral: true });
      return;
    }
    await handlePollVote(interaction, pollId, optionIndex);
  },
};
