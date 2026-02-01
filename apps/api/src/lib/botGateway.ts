import { loadApiEnv } from './env.js';

const env = loadApiEnv();

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${env.BOT_INTERNAL_API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${env.BOT_INTERNAL_API_TOKEN}`,
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Bot gateway error (${response.status})`);
  }

  return response.json() as Promise<T>;
};

export const fetchOwnerGuilds = () => request<{ id: string; name: string; memberCount?: number; joinedAt?: string }[]>('/owner/guilds');

export const fetchOwnerChannels = (guildId: string) =>
  request<{ id: string; name: string; type: number }[]>(`/owner/guilds/${guildId}/channels`);

export const fetchOwnerRoles = (guildId: string) =>
  request<{ id: string; name: string; color: string }[]>(`/owner/guilds/${guildId}/roles`);

export const fetchOwnerMembers = (guildId: string, limit?: number, after?: string) => {
  const params = new URLSearchParams();
  if (limit) params.set('limit', limit.toString());
  if (after) params.set('after', after);
  return request<{ id: string; tag: string }[]>(`/owner/guilds/${guildId}/members?${params.toString()}`);
};

export const fetchOwnerMessages = (guildId: string, channelId: string, limit?: number, before?: string) => {
  const params = new URLSearchParams({ channelId });
  if (limit) params.set('limit', limit.toString());
  if (before) params.set('before', before);
  return request<{ id: string; authorId: string; authorTag: string; content: string; createdAt: string }[]>(
    `/owner/guilds/${guildId}/messages?${params.toString()}`,
  );
};

export const sendOwnerChannel = (payload: {
  guildId: string;
  channelId: string;
  content: string;
  embed?: Record<string, unknown>;
}) =>
  request<{ status: string; messageId?: string }>('/owner/send/channel', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const sendOwnerDm = (payload: { userId: string; content: string; embed?: Record<string, unknown> }) =>
  request<{ status: string; messageId?: string }>('/owner/send/dm', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const sendOwnerRole = (payload: {
  guildId: string;
  roleId: string;
  content: string;
  embed?: Record<string, unknown>;
  dryRun?: boolean;
}) =>
  request<{ status: string; sent?: number; recipients?: number }>('/owner/send/role', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
