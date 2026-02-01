# Troubleshooting

## Bot not responding
- Verify `DISCORD_TOKEN` and `DISCORD_CLIENT_ID`.
- Ensure privileged intents are enabled if automod, tickets, or welcome features are on.

## Music playback issues
- Confirm Lavalink is reachable and credentials match.
- Ensure the bot has permission to connect and speak in voice channels.

## Stripe webhook errors
- Confirm `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint.
- Ensure `/stripe/webhook` is reachable from Stripe.

## Dashboard login fails
- Check OAuth redirect URI matches `DISCORD_REDIRECT_URI`.
- Verify `SESSION_SECRET` length and cookie settings.

## Owner Console issues
- Ensure the authenticated user matches the configured owner ID(s).
- Missing data often means the bot lacks permissions or intents (e.g. `GUILD_MEMBERS` for member lists).
- DM failures can happen when users disable DMs or block the bot.
- Owner actions are rate-limited; retry after cooldowns.
