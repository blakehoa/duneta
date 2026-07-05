export type RateLimitKey = 'ip' | 'user' | 'apiKey' | 'ip+user' | 'ip+identifier';

export type RateLimitRule = {
  /** Unique name — used in counter keys and 429 responses. */
  name: string;
  enabled?: boolean;
  max: number;
  windowMs: number;
  key: RateLimitKey;
  /** Path prefix under `/api` (e.g. `/auth`, `/users`). Omit = all routes. */
  path?: string;
  /** HTTP methods (e.g. `GET`, `POST`). Omit = all methods. */
  methods?: string[];
  /** Header for `apiKey` strategy. Default: `x-api-key`. */
  apiKeyHeader?: string;
  /** Query param for `ip+identifier`. Default: `email`. */
  identifierQuery?: string;
  /** Header for `ip+identifier`. Default: `x-identifier`. */
  identifierHeader?: string;
  /** Path prefixes skipped by this rule (e.g. `/health`). */
  excludePaths?: string[];
};

export type RateLimitConfig = {
  enabled?: boolean;
  /** All matching rules apply in order (multi-hop). */
  rules?: RateLimitRule[];
};

const AUTH_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'] as const;

export function rateLimitRule(rule: RateLimitRule): RateLimitRule {
  return { enabled: true, ...rule };
}

export function defineRateLimitRules(...rules: RateLimitRule[]): RateLimitRule[] {
  return rules;
}

export const DEFAULT_RATE_LIMIT_RULES = defineRateLimitRules(
  rateLimitRule({ name: 'api', max: 100, windowMs: 60_000, key: 'ip' }),
  rateLimitRule({
    name: 'auth',
    max: 5,
    windowMs: 15 * 60_000,
    key: 'ip+identifier',
    path: '/auth',
    methods: [...AUTH_METHODS],
    identifierQuery: 'email',
  }),
);

export function activeRateLimitRules(config: RateLimitConfig): RateLimitRule[] {
  return (config.rules ?? DEFAULT_RATE_LIMIT_RULES).filter((rule) => rule.enabled !== false);
}

/** Sensible multi-hop rules for production APIs. */
export const RECOMMENDED_RATE_LIMIT_RULES = defineRateLimitRules(
  rateLimitRule({
    name: 'global-ip',
    max: 300,
    windowMs: 60_000,
    key: 'ip',
    excludePaths: ['/health'],
  }),
  rateLimitRule({
    name: 'public-read',
    max: 120,
    windowMs: 60_000,
    key: 'ip',
    path: '/users',
    methods: ['GET'],
  }),
  rateLimitRule({
    name: 'authenticated',
    max: 100,
    windowMs: 60_000,
    key: 'user',
    path: '/users',
  }),
  rateLimitRule({
    name: 'auth-brute-force',
    max: 5,
    windowMs: 15 * 60_000,
    key: 'ip+identifier',
    path: '/auth',
    methods: ['POST'],
    identifierQuery: 'email',
  }),
);
