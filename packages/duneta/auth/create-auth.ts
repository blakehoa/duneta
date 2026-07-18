import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer, jwt } from 'better-auth/plugins';
import {
  buildSocialProviders,
  isAuthEnabled,
  isBearerTokenEnabled,
  isCacheEnabled,
  isJwtEnabled,
  resolveAuthBasePath,
} from '../config/server/features.js';
import { DEFAULT_COOKIE_CACHE_MAX_AGE } from '../config/server/defaults.js';
import type { DunetaServerConfig } from '../config/server/types.js';
import type { Cache } from '../http/cache/index.js';
import { defaultCache, resolveCache } from '../http/cache/index.js';
import type { Database } from '../http/database/types.js';
import * as schema from '../http/repositories/schemas/auth.js';
import type { Auth } from './types.js';

const DEFAULT_SESSION_CACHE_KEY = 'session';

function createSecondaryStorage(store: Cache, prefix: string) {
  const keyOf = (key: string) => `${prefix}:${key}`;
  return {
    get: (key: string) => store.get(keyOf(key)),
    set: (key: string, value: string, ttl?: number) =>
      store.set(keyOf(key), value, ttl ? ttl * 1000 : undefined),
    delete: (key: string) => store.forget(keyOf(key)),
  };
}

export function createAuth(
  config: DunetaServerConfig,
  db: Database | null,
  caches: Record<string, Cache> = {},
  databases: Record<string, Database> = {},
): Auth | null {
  const authDb = config.auth.database ? databases[config.auth.database] : db;

  if (config.auth?.enabled === true) {
    if (!authDb) {
      throw new Error(
        `[duneta] auth.enabled requires database "${config.auth.database ?? config.database.default}"`,
      );
    }
    if (!config.auth.secret) {
      throw new Error(
        '[duneta] auth.enabled requires AUTH_SECRET (wrangler secret put AUTH_SECRET)',
      );
    }
    if (!config.auth.baseUrl) {
      throw new Error(
        '[duneta] auth.enabled requires AUTH_BASE_URL (wrangler vars / .env)',
      );
    }
  }

  if (!isAuthEnabled(config) || !authDb) return null;

  const { auth: authConfig } = config;
  const { providers, session } = authConfig;
  const plugins = [];

  if (isBearerTokenEnabled(config)) {
    plugins.push(bearer());
  }

  if (isJwtEnabled(config)) {
    plugins.push(jwt());
  }

  const socialProviders = buildSocialProviders(providers);
  const email = providers.email;
  const sessionCache = session.cache;

  let secondaryStorage: ReturnType<typeof createSecondaryStorage> | undefined;
  if (sessionCache?.enabled === true) {
    if (!isCacheEnabled(config)) {
      throw new Error(
        '[duneta] auth.session.cache.enabled requires cache.enabled with at least one store',
      );
    }
    secondaryStorage = createSecondaryStorage(
      resolveCache(
        caches,
        sessionCache.store,
        defaultCache(config.cache, caches),
      ),
      sessionCache.key?.trim() || DEFAULT_SESSION_CACHE_KEY,
    );
  }

  return betterAuth({
    secret: authConfig.secret,
    baseURL: authConfig.baseUrl,
    basePath: resolveAuthBasePath(authConfig.basePath),
    database: drizzleAdapter(authDb, {
      provider: 'pg',
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    ...(secondaryStorage ? { secondaryStorage } : {}),
    emailAndPassword:
      email.enabled !== false
        ? {
            enabled: true,
            requireEmailVerification: email.requireEmailVerification ?? false,
            minPasswordLength: email.minPasswordLength ?? 8,
            disableSignUp: email.disableSignUp ?? false,
          }
        : { enabled: false },
    socialProviders,
    plugins,
    session: {
      expiresIn: session.expiresIn,
      cookieCache: {
        enabled: session.cookieCache?.enabled !== false,
        maxAge: session.cookieCache?.maxAge ?? DEFAULT_COOKIE_CACHE_MAX_AGE,
      },
      ...(secondaryStorage ? { storeSessionInDatabase: true } : {}),
    },
  }) as unknown as Auth;
}
