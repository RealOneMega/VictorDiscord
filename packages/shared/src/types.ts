export type EntitlementScope = 'user' | 'guild';

export interface EntitlementResult {
  scope: EntitlementScope;
  isPremium: boolean;
  plan: 'free' | 'pro' | 'enterprise';
  features: string[];
  expiresAt?: string;
}

export interface GuildConfig {
  guildId: string;
  logChannelId?: string;
  autoModEnabled: boolean;
  welcomeEnabled: boolean;
  ticketPanelChannelId?: string;
  allowOwnerBulkDm?: boolean;
}

export interface UserProfile {
  userId: string;
  locale?: string;
  timezone?: string;
}

export interface MetricBatch {
  key: string;
  value: number;
}
