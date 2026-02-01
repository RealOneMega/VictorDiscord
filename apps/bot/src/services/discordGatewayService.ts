import type {
  Channel,
  Client,
  Guild,
  GuildMember,
  Role,
  TextChannel,
} from 'discord.js';
import { PermissionsBitField } from 'discord.js';

export interface GatewayGuildInfo {
  id: string;
  name: string;
  memberCount?: number;
  joinedAt?: string;
}

export const listGuilds = (client: Client): GatewayGuildInfo[] => {
  return client.guilds.cache.map((guild) => ({
    id: guild.id,
    name: guild.name,
    memberCount: guild.memberCount,
    joinedAt: guild.joinedAt?.toISOString(),
  }));
};

const resolveGuild = async (client: Client, guildId: string): Promise<Guild> => {
  const cached = client.guilds.cache.get(guildId);
  if (cached) return cached;
  return client.guilds.fetch(guildId);
};

export const listChannels = async (client: Client, guildId: string) => {
  const guild = await resolveGuild(client, guildId);
  const botMember = guild.members.me;
  if (!botMember) {
    throw new Error('Bot member not available');
  }
  const channels = await guild.channels.fetch();
  return channels
    .filter((channel): channel is Channel => Boolean(channel))
    .filter((channel) => {
      if (!channel || !('permissionsFor' in channel)) return false;
      const perms = channel.permissionsFor(botMember);
      return perms?.has(PermissionsBitField.Flags.ViewChannel);
    })
    .map((channel) => ({
      id: channel.id,
      name: channel.name,
      type: channel.type,
    }));
};

export const listRoles = async (client: Client, guildId: string): Promise<Role[]> => {
  const guild = await resolveGuild(client, guildId);
  const roles = await guild.roles.fetch();
  return roles.map((role) => role);
};

export const listMembers = async (client: Client, guildId: string, limit = 50, after?: string) => {
  const guild = await resolveGuild(client, guildId);
  const members = await guild.members.list({ limit, after });
  return members.map((member) => ({
    id: member.user.id,
    tag: member.user.tag,
  }));
};

export const fetchMessages = async (
  client: Client,
  guildId: string,
  channelId: string,
  limit = 50,
  before?: string,
) => {
  const guild = await resolveGuild(client, guildId);
  const botMember = guild.members.me;
  if (!botMember) {
    throw new Error('Bot member not available');
  }
  const channel = await guild.channels.fetch(channelId);
  if (!channel || !('messages' in channel)) {
    throw new Error('Channel not accessible');
  }
  const permissions = channel.permissionsFor(botMember);
  if (!permissions?.has(PermissionsBitField.Flags.ReadMessageHistory)) {
    throw new Error('Missing ReadMessageHistory permission');
  }

  const messages = await (channel as TextChannel).messages.fetch({ limit, before });
  return messages.map((message) => ({
    id: message.id,
    authorId: message.author.id,
    authorTag: message.author.tag,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  }));
};

export const sendChannelMessage = async (
  client: Client,
  guildId: string,
  channelId: string,
  content: string,
  embed?: Record<string, unknown>,
) => {
  const guild = await resolveGuild(client, guildId);
  const channel = await guild.channels.fetch(channelId);
  if (!channel || !('send' in channel)) {
    throw new Error('Channel not accessible');
  }
  return (channel as TextChannel).send({ content, embeds: embed ? [embed] : [] });
};

export const sendDm = async (
  client: Client,
  userId: string,
  content: string,
  embed?: Record<string, unknown>,
) => {
  const user = await client.users.fetch(userId);
  return user.send({ content, embeds: embed ? [embed] : [] });
};

export const sendRoleMessage = async (
  client: Client,
  guildId: string,
  roleId: string,
  content: string,
  embed?: Record<string, unknown>,
) => {
  const guild = await resolveGuild(client, guildId);
  const role = await guild.roles.fetch(roleId);
  if (!role) throw new Error('Role not found');

  const members = await guild.members.fetch({ withPresences: false });
  const targets = members.filter((member: GuildMember) => member.roles.cache.has(roleId));
  return targets.map((member) => ({ member, content, embed }));
};
