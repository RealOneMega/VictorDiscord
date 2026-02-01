import type { FastifyReply, FastifyRequest } from 'fastify';
import { loadApiEnv } from './env.js';

const OWNER_ID_DEFAULT = '255864836640997376';

export const getOwnerIds = () => {
  const env = loadApiEnv();
  const allowlist = env.OWNER_IDS?.split(',').map((id) => id.trim()).filter(Boolean) ?? [];
  if (allowlist.length === 0) {
    return [OWNER_ID_DEFAULT];
  }
  if (!allowlist.includes(OWNER_ID_DEFAULT)) {
    allowlist.push(OWNER_ID_DEFAULT);
  }
  return allowlist;
};

export const requireOwner = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = request.session.get('user') as { id?: string } | undefined;
  if (!user?.id) {
    reply.status(401).send({ error: 'Unauthorized' });
    return null;
  }
  const owners = getOwnerIds();
  if (!owners.includes(user.id)) {
    reply.status(403).send({ error: 'Forbidden' });
    return null;
  }
  return user;
};
