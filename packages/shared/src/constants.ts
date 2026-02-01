export const PREMIUM_FEATURES = {
  SCHEDULED_POLLS: 'scheduled_polls',
  POLL_EXPORTS: 'poll_exports',
  RECURRING_REMINDERS: 'recurring_reminders',
  ADVANCED_AUTOMOD: 'advanced_automod',
  TICKET_AUTOMATION: 'ticket_automation',
} as const;

export const DEFAULT_CACHE_TTL_MS = 60_000;
export const METRICS_FLUSH_INTERVAL_MS = 60_000;
