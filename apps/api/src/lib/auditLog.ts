import crypto from 'node:crypto';
import { prisma } from './db.js';

export const hashPayload = (payload: unknown) => {
  const raw = JSON.stringify(payload ?? {});
  return crypto.createHash('sha256').update(raw).digest('hex');
};

export const logAudit = async (input: {
  actorId: string;
  action: string;
  targetId?: string;
  guildId?: string;
  channelId?: string;
  payload: unknown;
  success: boolean;
  reason?: string;
}) => {
  const payloadHash = hashPayload(input.payload);
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      targetId: input.targetId,
      guildId: input.guildId,
      channelId: input.channelId,
      payloadHash,
      success: input.success,
      reason: input.reason,
    },
  });
};
