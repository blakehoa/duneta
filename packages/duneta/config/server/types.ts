import type { DatabaseConfig } from './database';
import type { CacheConfig } from './cache';
export type { CacheConfig } from './cache';
import type { StorageConfig } from './storage';
export type { StorageConfig } from './storage';
import type { RateLimitConfig } from './rate-limit';

export type Runtime = 'worker';
export type NodeEnv = 'development' | 'production' | 'test';

export type RuntimeConfig = {
  target: Runtime;
};

export type AppConfig = {
  name: string;
  env: NodeEnv;
  port: number;
  debug: boolean;
};

/** How a request value is resolved: query → cookie → header. */
export type ContextResolveConfig = {
  header: string;
  cookie: string;
  query: string;
};

export type OAuthProviderConfig = {
  enabled?: boolean;
  clientId: string;
  clientSecret: string;
};

export type EmailProviderConfig = {
  enabled?: boolean;
  requireEmailVerification?: boolean;
  minPasswordLength?: number;
  disableSignUp?: boolean;
};

export type AuthProvidersConfig = {
  email: EmailProviderConfig;
  google?: OAuthProviderConfig;
  github?: OAuthProviderConfig;
};

export type AuthTokenStrategy = 'cookie' | 'bearer' | 'both';

export type AuthTokensConfig = {
  strategy: AuthTokenStrategy;
  bearer?: { enabled?: boolean };
  jwt?: {
    enabled?: boolean;
    expiresIn?: number;
  };
};

export type AuthSessionConfig = {
  /** Session lifetime in seconds. */
  expiresIn: number;
  rememberMeExpiresIn: number;
  cookie: {
    name: string;
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
    path: string;
  };
  /**
   * Signed session payload in the browser cookie (Better Auth `cookieCache`).
   * Keep `maxAge` short so revoke takes effect quickly on other devices.
   */
  cookieCache?: {
    enabled?: boolean;
    /** Seconds — prefer 60–300, not `expiresIn`. */
    maxAge?: number;
  };
  /**
   * App-cache secondary storage (Better Auth `secondaryStorage`).
   * When enabled, sessions are also stored in Redis/etc. Keep Postgres via `storeSessionInDatabase`.
   */
  cache?: {
    enabled?: boolean;
    /** Key prefix in the cache store. Default: `session`. */
    key?: string;
    /** Named store in `cache.stores`. Omit → default cache. */
    store?: string;
  };
};

/** Default auth driver: [Better Auth](https://better-auth.com/docs/introduction) */
export type BetterAuthConfig = {
  enabled?: boolean;
  driver: 'better-auth';
  secret: string;
  baseUrl: string;
  /** Path relative to `/api` mount (e.g. `/auth` → `/api/auth`). */
  basePath: string;
  providers: AuthProvidersConfig;
  tokens: AuthTokensConfig;
  session: AuthSessionConfig;
};

export type AuthConfig = BetterAuthConfig;

export type LocaleConfig = {
  default: string;
  supported: string[];
  resolve: ContextResolveConfig;
};

export type TimezoneConfig = {
  default: string;
  supported: string[];
  resolve: ContextResolveConfig;
};

export type CsrfConfig = {
  enabled?: boolean;
  secret: string;
  cookie: string;
  header: string;
  tokenLength: number;
  expirationMs: number;
  /** Path prefixes skipped (e.g. `/auth` for OAuth callbacks). */
  excludePaths: string[];
};

export type SecurityConfig = {
  rateLimit: RateLimitConfig;
  csrf: CsrfConfig;
};

export type RequestIdConfig = {
  header: string;
};

export type RequestConfig = {
  id: RequestIdConfig;
};

export type SecurityHeadersConfig = {
  frameOptions: 'DENY' | 'SAMEORIGIN';
  contentTypeOptions: boolean;
  referrerPolicy: string;
  permissionsPolicy: string;
};

export type LoggingConfig = {
  enabled?: boolean;
  /** `json` for production / Logpush; `text` for local readability. */
  format?: 'json' | 'text';
};

export type CronConfig = {
  enabled?: boolean;
};

export type ImageFormat = 'auto' | 'avif' | 'webp';

/** Server image optimization — remote fetch policy and cache (route path is fixed). */
export type ImageOptimizationConfig = {
  domains: string[];
  remotePatterns: string[];
  formats: ImageFormat[];
  minimumCacheTtl: number;
};

export type DebugConfig = {
  enabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
};

/** Built-in server config sections shipped by `duneta/config/server`. */
export interface DunetaCoreConfig {
  runtime: RuntimeConfig;
  app: AppConfig;
  database: DatabaseConfig;
  auth: AuthConfig;
  locale: LocaleConfig;
  timezone: TimezoneConfig;
  request: RequestConfig;
  headers: SecurityHeadersConfig;
  cache: CacheConfig;
  storage: StorageConfig;
  security: SecurityConfig;
  logging: LoggingConfig;
  cron: CronConfig;
  image: ImageOptimizationConfig;
  debug: DebugConfig;
}

export type DunetaCoreConfigKey = keyof DunetaCoreConfig;

/**
 * Full server config = core sections + optional app-specific extensions.
 *
 * @example
 * type HrmConfig = DunetaServerConfig<{ hrm: HrmModuleConfig }>;
 */
export type DunetaServerConfig<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- default: no app-specific config extensions
  TExtra extends Record<string, unknown> = {},
  TDatabase extends DatabaseConfig = DatabaseConfig,
> = Omit<DunetaCoreConfig, 'database'> & {
  database: TDatabase;
} & TExtra;
