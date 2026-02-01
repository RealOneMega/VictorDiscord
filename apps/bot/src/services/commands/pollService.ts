import type { ChatInputCommandInteraction } from 'discord.js';
import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import type { EntitlementResult } from '@victor/shared';

export const handlePollCommand = async (
  interaction: ChatInputCommandInteraction,
  _entitlement: EntitlementResult,
) => {
  const modal = new ModalBuilder().setCustomId('poll:create').setTitle('Create a poll');

  const questionInput = new TextInputBuilder()
    .setCustomId('question')
    .setLabel('Poll question')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const optionsInput = new TextInputBuilder()
    .setCustomId('options')
    .setLabel('Options (comma separated)')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(questionInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(optionsInput),
  );

  await interaction.showModal(modal);
};
