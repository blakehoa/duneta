import { createMiddleware } from 'hono/factory';
import type { Context } from 'hono';
import type { Cache } from '../../http/cache/index.js';
import { resolveAuthSession } from '../../auth/resolve-session.js';
import {
  activeRateLimitRules,
  type RateLimitConfig,
  type RateLimitRule,
} from '../../config/server/rate-limit.js';
import type { RequestContext } from './request-context.js';

type CounterEntry = { count: number; resetAt: number };
type CompiledRule = RateLimitRule & { methodsUpper?: string[] };
type RateLimitStage = 'all' | 'pre-auth' | 'post-auth';
type RateLimitResult = {
  allowed: boolean;
  count?: number;
  resetAt: number;
};
type NativeRateLimiter = {
  limit(input: { key: string }): Promise<{ success: boolean }>;
};

const memoryStore = new Map<string, CounterEntry>();
const MAX_MEMORY_COUNTERS = 10_000;

function pruneMemoryStore(now: number) {
  for (const [key, entry] of memoryStore) {
    if (entry.resetAt <= now) memoryStore.delete(key);
  }

  while (memoryStore.size >= MAX_MEMORY_COUNTERS) {
    const oldest = memoryStore.keys().next().value as string | undefined;
    if (!oldest) break;
    memoryStore.delete(oldest);
  }
}

function clientIp(c: Context<RequestContext>) {
  return (
    c.req.header('cf-connecting-ip') ??
    c.req.header('x-forwarded-for') ??
    'local'
  );
}

function apiPath(path: string) {
  const stripped = path.startsWith('/api') ? path.slice(4) || '/' : path;
  return stripped.startsWith('/') ? stripped : `/${stripped}`;
}

function pathMatches(path: string, prefix: string) {
  return path === prefix || path.startsWith(`${prefix}/`);
}

function isExcluded(path: string, excludePaths: string[] | undefined) {
  return excludePaths?.some((prefix) => pathMatches(path, prefix)) ?? false;
}

function matchesRule(c: Context<RequestContext>, rule: CompiledRule) {
  const path = apiPath(c.req.path);
  if (isExcluded(path, rule.excludePaths)) return false;
  if (rule.path && !pathMatches(path, rule.path)) return false;
  if (
    rule.methodsUpper?.length &&
    !rule.methodsUpper.includes(c.req.method.toUpperCase())
  ) {
    return false;
  }
  return true;
}

function resolveIdentifier(c: Context<RequestContext>, rule: RateLimitRule) {
  return (
    c.req.header(rule.identifierHeader ?? 'x-identifier') ??
    c.req.query(rule.identifierQuery ?? 'email') ??
    'anon'
  );
}

async function resolveRateLimitKey(
  c: Context<RequestContext>,
  rule: RateLimitRule,
) {
  const ip = clientIp(c);

  switch (rule.key) {
    case 'ip':
      return `ip:${ip}`;
    case 'apiKey': {
      const apiKey = c.req.header(rule.apiKeyHeader ?? 'x-api-key');
      return apiKey ? `apikey:${apiKey}` : `ip:${ip}`;
    }
    case 'user': {
      const userId =
        c.get('userId') ??
        c.get('session')?.user?.id ??
        (await resolveAuthSession(c))?.user?.id;
      return userId ? `user:${userId}` : `ip:${ip}`;
    }
    case 'ip+user': {
      const userId =
        c.get('userId') ??
        c.get('session')?.user?.id ??
        (await resolveAuthSession(c))?.user?.id;
      return userId ? `ip+user:${ip}:${userId}` : `ip:${ip}`;
    }
    case 'ip+identifier':
      return `ip+id:${ip}:${resolveIdentifier(c, rule)}`;
    default:
      return `ip:${ip}`;
  }
}

function setRateLimitHeaders(
  c: Context<RequestContext>,
  rule: RateLimitRule,
  count: number | undefined,
  resetAt: number,
) {
  c.header('X-RateLimit-Limit', String(rule.max));
  if (count !== undefined) {
    c.header('X-RateLimit-Remaining', String(Math.max(0, rule.max - count)));
  }
  c.header('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));
  c.header('X-RateLimit-Rule', rule.name);
}

async function consumeNativeLimit(
  c: Context<RequestContext>,
  rule: RateLimitRule,
  key: string,
): Promise<RateLimitResult> {
  const limiter = rule.binding
    ? (c.env[rule.binding] as NativeRateLimiter | undefined)
    : undefined;
  if (!limiter || typeof limiter.limit !== 'function') {
    throw new Error(
      `[duneta] missing Rate Limiting binding "${rule.binding ?? ''}"`,
    );
  }

  const { success } = await limiter.limit({ key });
  return {
    allowed: success,
    resetAt: Date.now() + rule.windowMs,
  };
}

async function consumeLimit(
  cache: Cache | null,
  storageKey: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = Date.now();

  if (cache) {
    const counter = await cache.incrWithTtl(storageKey, windowMs);
    return {
      allowed: counter.count <= max,
      count: counter.count,
      resetAt: now + counter.ttlMs,
    };
  }

  const entry = memoryStore.get(storageKey);
  if (!entry || entry.resetAt <= now) {
    if (!entry && memoryStore.size >= MAX_MEMORY_COUNTERS)
      pruneMemoryStore(now);
    memoryStore.set(storageKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, count: 1, resetAt: now + windowMs };
  }

  entry.count += 1;
  return {
    allowed: entry.count <= max,
    count: entry.count,
    resetAt: entry.resetAt,
  };
}

function compileRule(rule: RateLimitRule): CompiledRule {
  return {
    ...rule,
    methodsUpper: rule.methods?.map((method) => method.toUpperCase()),
  };
}

function matchesStage(rule: RateLimitRule, stage: RateLimitStage) {
  if (stage === 'all') return true;
  const requiresAuth = rule.key === 'user' || rule.key === 'ip+user';
  return stage === 'post-auth' ? requiresAuth : !requiresAuth;
}

export function createRateLimitMiddleware(
  config: RateLimitConfig,
  cache: Cache | null = null,
  stage: RateLimitStage = 'all',
) {
  const rules = activeRateLimitRules(config)
    .filter((rule) => matchesStage(rule, stage))
    .map(compileRule);

  return createMiddleware<RequestContext>(async (c, next) => {
    for (const rule of rules) {
      if (!matchesRule(c, rule)) continue;

      const keyPart = await resolveRateLimitKey(c, rule);
      const storageKey = `ratelimit:${rule.name}:${keyPart}`;
      const { allowed, count, resetAt } = rule.binding
        ? await consumeNativeLimit(c, rule, storageKey)
        : await consumeLimit(cache, storageKey, rule.max, rule.windowMs);

      setRateLimitHeaders(c, rule, count, resetAt);
      if (!allowed) {
        c.header(
          'Retry-After',
          String(Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))),
        );
        return c.json({ error: 'Too many requests', rule: rule.name }, 429);
      }
    }

    await next();
  });
}
