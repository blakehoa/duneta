import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer, jwt } from 'better-auth/plugins';
import {
  buildSocialProviders,
  isAuthEnabled,
  isBearerTokenEnabled,
  isJwtEnabled,
  resolveAuthBasePath,
} from '../config/server/features.js';
import type { DunetaServerConfig } from '../config/server/types.js';
import type { Database } from '../http/database/types.js';
import * as schema from '../http/repositories/schemas/auth.js';
import type { Auth } from './types.js';

export function createAuth(config: DunetaServerConfig, db: Database | null): Auth | null {
  if (!isAuthEnabled(config) || !db) return null;

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

  return betterAuth({
    secret: authConfig.secret,
    baseURL: authConfig.baseUrl,
    basePath: resolveAuthBasePath(authConfig.basePath),
    database: drizzleAdapter(db, {
      provider: 'pg',
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    emailAndPassword: email.enabled !== false
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
        maxAge: session.cookieCache?.maxAge ?? session.expiresIn,
      },
    },
  }) as unknown as Auth;
}
