import type { DatabaseConnection } from './database.js';
import type { AuthProvidersConfig, DunetaServerConfig } from './types.js';

export function isDatabaseEnabled(config: DunetaServerConfig): boolean {
  if (config.database?.enabled !== true) return false;
  const name = config.database.default;
  const connection = config.database.connections[name as keyof typeof config.database.connections] as
    | DatabaseConnection
    | undefined;
  return Boolean(connection?.hyperdrive);
}

export function isWorkerRuntime(config: DunetaServerConfig): boolean {
  return config.runtime?.target === 'worker';
}

export function isAuthEnabled(config: DunetaServerConfig): boolean {
  if (config.auth?.enabled !== true) return false;
  if (!isDatabaseEnabled(config)) return false;
  return Boolean(config.auth.secret);
}

export function isCacheEnabled(config: DunetaServerConfig): boolean {
  if (config.cache?.enabled !== true) return false;
  return Object.keys(config.cache.stores).length > 0;
}

export function isStorageEnabled(config: DunetaServerConfig): boolean {
  return config.storage?.enabled === true;
}

export function isRateLimitEnabled(config: DunetaServerConfig): boolean {
  return config.security?.rateLimit?.enabled === true;
}

export function isCsrfEnabled(config: DunetaServerConfig): boolean {
  if (config.security?.csrf?.enabled !== true) return false;
  return Boolean(config.security.csrf.secret);
}

export function isLoggingEnabled(config: DunetaServerConfig): boolean {
  return config.logging?.enabled === true;
}

export function isCronEnabled(config: DunetaServerConfig): boolean {
  return config.cron?.enabled === true;
}

export function isBearerTokenEnabled(config: DunetaServerConfig): boolean {
  const { tokens } = config.auth;
  return (
    tokens.strategy === 'bearer' ||
    tokens.strategy === 'both' ||
    tokens.bearer?.enabled === true
  );
}

export function isJwtEnabled(config: DunetaServerConfig): boolean {
  return config.auth.tokens.jwt?.enabled === true;
}

const OAUTH_PROVIDER_KEYS = ['google', 'github'] as const;

export function buildSocialProviders(providers: AuthProvidersConfig) {
  const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {};

  for (const key of OAUTH_PROVIDER_KEYS) {
    const provider = providers[key];
    if (!provider?.enabled || !provider.clientId || !provider.clientSecret) continue;
    socialProviders[key] = {
      clientId: provider.clientId,
      clientSecret: provider.clientSecret,
    };
  }

  return socialProviders;
}

export function resolveAuthBasePath(basePath: string) {
  if (basePath.startsWith('/api')) return basePath;
  return `/api${basePath.startsWith('/') ? basePath : `/${basePath}`}`;
}

export function resolveAuthMountPath(basePath: string) {
  return basePath.replace(/^\/api/, '') || '/auth';
}
