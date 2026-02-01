# Deployment

## Requirements
- Node.js 22.12+ with pnpm
- MariaDB instance with isolated database + dedicated user (least privilege)
- Lavalink node reachable from the bot
- Stripe account + webhook secret
- Bitnami AWS Lightsail stack (WordPress Multisite) running on Debian-based OS

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

## Bitnami Lightsail notes
- Bitnami WordPress Multisite on Lightsail typically runs on Debian with Apache (`/opt/bitnami/apache2`).
- Use Bitnami service scripts to restart Apache when updating vhosts.

### Apache vhost (discord.m3gastudios.com)
Create `/opt/bitnami/apache2/conf/vhosts/discord.m3gastudios.com.conf`:

```apache
<VirtualHost *:80>
  ServerName discord.m3gastudios.com
  ProxyPreserveHost On
  ProxyPass / http://127.0.0.1:3000/
  ProxyPassReverse / http://127.0.0.1:3000/
</VirtualHost>
```

Enable SSL via the Bitnami HTTPS configuration (`bncert-tool`) or your existing TLS setup:
- Ensure the HTTPS vhost includes `ProxyPass`/`ProxyPassReverse` for the Next.js dashboard.
- Restart Apache: `sudo /opt/bitnami/ctlscript.sh restart apache`.

## Health Check
- API health endpoint: `GET /health`

## Graceful Shutdown
The bot and API listen for SIGINT/SIGTERM and shut down cleanly.
