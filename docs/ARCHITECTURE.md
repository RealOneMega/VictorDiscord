# Architecture

## Overview
This monorepo is organized as a pnpm workspace with three services:

- **apps/bot**: Discord.js v14 bot with handler-driven architecture.
- **apps/api**: Fastify REST API for configuration, entitlements, and Stripe webhooks.
- **apps/web**: Next.js dashboard for configuration, analytics, and billing.
- **packages/shared**: Shared types, constants, and Zod schemas.

## Handler-based Bot
All Discord logic routes through centralized handlers:

- Command handler loads slash commands and routes to service executors.
- Event handler registers events and applies debouncing for high-frequency events.
- Interaction handler is the single entry point for interactions.
- Button, select menu, and modal handlers centrally manage customId routing.
- Premium handler resolves entitlements through the API with caching.
- Permission handler centralizes permission checks.
- Intent manager declares all intents in one place.
- Discord gateway service powers owner console requests for guild/channel/role/member and messaging actions.

## Performance Principles
- Event debouncing for message events.
- XP batching every 60 seconds via the API.
- LRU caching for entitlements and hot data.
- Owner console uses on-demand Discord API fetches with strict rate limiting.
- Minimal gateway intents derived from feature flags.
