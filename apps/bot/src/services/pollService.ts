import type { ButtonInteraction } from 'discord.js';

export interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: Map<string, number>;
}

const polls = new Map<string, Poll>();

export const createPoll = (question: string, options: string[]): Poll => {
  const id = Math.random().toString(36).slice(2, 8);
  const poll: Poll = {
    id,
    question,
    options,
    votes: new Map(),
  };
  polls.set(id, poll);
  return poll;
};

export const getPoll = (pollId: string) => polls.get(pollId);

export const recordVote = (poll: Poll, userId: string, optionIndex: number) => {
  poll.votes.set(userId, optionIndex);
};

export const formatPollResults = (poll: Poll) => {
  return poll.options.map((option, index) => {
    const count = Array.from(poll.votes.values()).filter((vote) => vote === index).length;
    return `• ${option}: **${count}**`;
  });
};

export const handlePollVote = async (
  interaction: ButtonInteraction,
  pollId: string,
  optionIndex: number,
) => {
  const poll = getPoll(pollId);
  if (!poll) {
    await interaction.reply({ content: 'Poll not found.', ephemeral: true });
    return;
  }

  recordVote(poll, interaction.user.id, optionIndex);
  const tally = formatPollResults(poll);

  await interaction.reply({
    content: `Thanks for voting! Current results:\n${tally.join('\n')}`,
    ephemeral: true,
  });
};
