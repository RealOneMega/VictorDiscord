# Deployment

## Requirements
- Node.js 22.12+ with pnpm
- MariaDB instance with isolated database + dedicated user (least privilege)
- Lavalink node reachable from the bot
- Stripe account + webhook secret

## Install
```bash
pnpm install
pnpm -r build
```

## Database
```bash
pnpm --filter @victor/api prisma:generate
pnpm --filter @victor/api prisma:migrate
```

### MariaDB guidance
- Create a separate database and user for this platform (do not reuse WordPress tables).
- Use conservative pooling in `DATABASE_URL`, e.g. `?connection_limit=5&pool_timeout=10` to avoid impacting other sites.

## PM2
```bash
pm2 start ecosystem.config.cjs
```

## Health Check
- API health endpoint: `GET /health`

## Graceful Shutdown
The bot and API listen for SIGINT/SIGTERM and shut down cleanly.
