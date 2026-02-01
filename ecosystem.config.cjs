module.exports = {
  apps: [
    {
      name: 'victor-bot',
      script: 'apps/bot/dist/index.js',
      node_args: '--max-old-space-size=512',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'victor-api',
      script: 'apps/api/dist/index.js',
      node_args: '--max-old-space-size=512',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'victor-web',
      script: 'apps/web/.next/standalone/server.js',
      node_args: '--max-old-space-size=512',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
