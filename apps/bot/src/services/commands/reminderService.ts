import type { ChatInputCommandInteraction } from 'discord.js';
import type { EntitlementResult } from '@victor/shared';
import { PREMIUM_FEATURES } from '@victor/shared';

export const handleReminderCommand = async (
  interaction: ChatInputCommandInteraction,
  entitlement: EntitlementResult,
) => {
  const minutes = interaction.options.getInteger('minutes', true);
  const message = interaction.options.getString('message', true);
  const recurring = interaction.options.getBoolean('recurring') ?? false;

  if (recurring && !entitlement.features.includes(PREMIUM_FEATURES.RECURRING_REMINDERS)) {
    await interaction.reply({
      content: 'Recurring reminders require a premium plan.',
      ephemeral: true,
    });
    return;
  }

  await interaction.reply({
    content: `Reminder set for ${minutes} minutes.`,
    ephemeral: true,
  });

  setTimeout(() => {
    interaction.user.send(`⏰ Reminder: ${message}`).catch(() => undefined);
  }, minutes * 60 * 1000);
};
