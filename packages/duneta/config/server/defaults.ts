import { DEFAULT_RATE_LIMIT_RULES } from './rate-limit';
import type { DunetaServerConfig } from './types';

export const DEFAULT_CONFIG_APP_PORT = 8787;
export const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';
/** Better Auth cookieCache maxAge (seconds) — keep short for revoke. */
export const DEFAULT_COOKIE_CACHE_MAX_AGE = 60 * 5;

const THREE_DAYS = 60 * 60 * 24 * 3;
const THIRTY_DAYS = 60 * 60 * 24 * 30;

/** Minimal defaults — opt in to features in `config/server.ts`. */
export function createDefaultConfig(): DunetaServerConfig {
  const port = DEFAULT_CONFIG_APP_PORT;

  return {
    runtime: { target: 'worker' },

    app: {
      name: 'duneta-api',
      env: 'development',
      port,
      debug: false,
    },

    database: {
      enabled: false,
      default: 'primary',
      connections: {},
    },

    auth: {
      enabled: false,
      driver: 'better-auth',
      secret: '',
      baseUrl: `http://localhost:${port}`,
      basePath: '/auth',
      providers: {
        email: { enabled: true },
        google: { enabled: false, clientId: '', clientSecret: '' },
        github: { enabled: false, clientId: '', clientSecret: '' },
      },
      tokens: {
        strategy: 'cookie',
        bearer: { enabled: false },
        jwt: { enabled: false, expiresIn: 60 * 15 },
      },
      session: {
        expiresIn: THREE_DAYS,
        rememberMeExpiresIn: THIRTY_DAYS,
        cookie: {
          name: 'duneta_session',
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          path: '/',
        },
        cookieCache: { enabled: true, maxAge: DEFAULT_COOKIE_CACHE_MAX_AGE },
        cache: { enabled: false, key: 'session' },
      },
    },

    locale: {
      default: 'vi',
      supported: ['vi', 'en'],
      resolve: {
        header: 'Accept-Language',
        cookie: 'duneta_locale',
        query: 'lang',
      },
    },

    timezone: {
      default: DEFAULT_TIMEZONE,
      supported: [DEFAULT_TIMEZONE, 'UTC', 'Asia/Bangkok'],
      resolve: {
        header: 'X-Duneta-Timezone',
        cookie: 'duneta_timezone',
        query: 'tz',
      },
    },

    request: {
      id: { header: 'X-Request-Id' },
    },

    headers: {
      frameOptions: 'DENY',
      contentTypeOptions: true,
      referrerPolicy: 'strict-origin-when-cross-origin',
      permissionsPolicy: 'camera=(), microphone=(), geolocation=()',
    },

    cache: { enabled: false, stores: {} },

    storage: { enabled: false },

    security: {
      cors: {
        origins: ['*'],
        credentials: false,
        maxAge: 600,
      },
      rateLimit: {
        enabled: false,
        rules: DEFAULT_RATE_LIMIT_RULES,
      },
      csrf: {
        enabled: false,
        secret: '',
        cookie: 'duneta_csrf',
        header: 'X-CSRF-Token',
        tokenLength: 32,
        expirationMs: 24 * 60 * 60 * 1000,
        excludePaths: ['/auth'],
      },
    },

    logging: { enabled: false },

    cron: { enabled: false },

    image: {
      domains: [],
      remotePatterns: [],
      formats: ['auto'],
      minimumCacheTtl: THIRTY_DAYS,
    },

    debug: { enabled: false, logLevel: 'debug' },
  };
}
