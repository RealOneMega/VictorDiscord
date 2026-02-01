# Premium & Monetization

## Plans
- **Free**: Core features
- **Pro**: Scheduled polls, poll exports, recurring reminders, ticket automation
- **Enterprise**: Custom features and dedicated support

## Entitlements
- Entitlements are resolved via the API and cached in the bot for 60s.
- Both user-level and guild-level entitlements are supported.

## Stripe Webhooks
- `POST /stripe/webhook`
- Webhook verification is enabled via `STRIPE_WEBHOOK_SECRET`.
- Subscription metadata should include:
  - `scope`: `user` or `guild`
  - `targetId`: Discord user or guild ID
