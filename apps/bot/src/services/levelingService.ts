import { METRICS_FLUSH_INTERVAL_MS } from '@victor/shared';
import { logger } from '../utils/logger.js';

interface PendingXp {
  userId: string;
  guildId: string;
  amount: number;
}

const pending = new Map<string, PendingXp>();
let interval: NodeJS.Timeout | undefined;

export const queueXp = (userId: string, guildId: string, amount = 1) => {
  const key = `${guildId}:${userId}`;
  const entry = pending.get(key) ?? { userId, guildId, amount: 0 };
  entry.amount += amount;
  pending.set(key, entry);
};

const flushXp = async (apiBaseUrl: string) => {
  if (pending.size === 0) return;
  const payload = Array.from(pending.values());
  pending.clear();

  try {
    const response = await fetch(new URL('/levels/batch', apiBaseUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates: payload }),
    });
    if (!response.ok) {
      logger.warn({ status: response.status }, 'Failed to flush XP batch');
    }
  } catch (error) {
    logger.error({ err: error }, 'XP batch flush failed');
  }
};

export const startLevelingBatcher = (apiBaseUrl: string) => {
  if (interval) return;
  interval = setInterval(() => flushXp(apiBaseUrl), METRICS_FLUSH_INTERVAL_MS);
};

export const stopLevelingBatcher = () => {
  if (interval) {
    clearInterval(interval);
    interval = undefined;
  }
};
