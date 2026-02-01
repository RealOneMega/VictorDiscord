import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import type { ModalDefinition } from '../../handlers/modalHandler.js';
import { modalSchemas } from '../../handlers/modalHandler.js';
import { createPoll } from '../../services/pollService.js';

export const modal: ModalDefinition<typeof modalSchemas.pollCreate._output> = {
  customIdPrefix: 'poll:create',
  schema: modalSchemas.pollCreate,
  handle: async (interaction, data) => {
    const options = data.options
      .split(',')
      .map((option) => option.trim())
      .filter(Boolean);

    if (options.length < 2) {
      await interaction.reply({ content: 'Provide at least two options.', ephemeral: true });
      return;
    }

    const poll = createPoll(data.question, options);

    const row = new ActionRowBuilder<ButtonBuilder>();
    options.forEach((option, index) => {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`poll:vote:${poll.id}:${index}`)
          .setLabel(option)
          .setStyle(ButtonStyle.Primary),
      );
    });

    await interaction.reply({
      content: `**${poll.question}**\nVote below:`,
      components: [row],
    });
  },
};
