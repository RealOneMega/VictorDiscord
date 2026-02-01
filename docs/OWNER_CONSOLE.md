# Owner Console

The Owner Console is a privileged dashboard area reserved for the bot owner. It provides visibility and safe actions across all guilds while respecting Discord permissions and bot access.

## Access Control
- Only the owner Discord user ID `255864836640997376` can access Owner Console routes.
- Optional allowlist via `OWNER_IDS="..."` (comma-separated) can be used to extend access.
- All API endpoints require an authenticated Discord OAuth session and server-side owner checks.

## Visibility
- List guilds the bot is in, including guild ID, name, member count (if available), join date, premium status, and enabled modules.
- For a guild, list channels and roles the bot can view.
- On-demand message fetch for channels where the bot has `ViewChannel` and `ReadMessageHistory`.
  - No live chat streaming.
  - No message storage in the database.
- Member listing and bulk DM require the `GUILD_MEMBERS` intent to be enabled.
- Set `ENABLE_OWNER_CONSOLE_MEMBERS=true` to opt into member listing and bulk DM intents.

## Actions
- Send a message as the bot to a channel or DM a user.
- Bulk DM a role is **disabled by default** and must be explicitly enabled per guild.
- Use `dryRun` to preview recipient counts before confirming bulk sends.
- All actions are rate limited, queued, and logged to audit logs.

## Safety
- Bulk DM requires confirmation and optional dry-run.
- Global and per-guild daily caps can be configured.
- `DISABLE_OWNER_MESSAGING=true` disables all owner messaging.

## Data Minimization
- Store only IDs and minimal metadata.
- Do not store message bodies.
- Show only data the bot can access with its permissions.
