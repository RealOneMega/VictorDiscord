import { createClient } from './client/createClient.js';
import { registerHandlers } from './client/registerHandlers.js';
import { logger } from './utils/logger.js';
import { startLevelingBatcher, stopLevelingBatcher } from './services/levelingService.js';
import { startOwnerGatewayServer } from './services/ownerGatewayServer.js';

const { client, env } = createClient();

await registerHandlers(client);
startLevelingBatcher(env.API_BASE_URL);
const stopOwnerGateway = startOwnerGatewayServer(client, {
  port: env.INTERNAL_API_PORT,
  token: env.INTERNAL_API_TOKEN,
});

const shutdown = async () => {
  logger.info('Shutting down bot...');
  stopLevelingBatcher();
  stopOwnerGateway();
  await client.destroy();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

client.login(env.DISCORD_TOKEN).catch((error) => {
  logger.error({ err: error }, 'Failed to login');
  process.exit(1);
});
