import type { RedisStoreOptions } from '../../../config/server/cache.js';
import type { CacheStore } from '../types.js';

const INCR_WITH_TTL_SCRIPT =
  "local count = redis.call('INCR', KEYS[1]); if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]); end; return { count, redis.call('PTTL', KEYS[1]) }";

async function redisHttpCommand(
  endpoint: string,
  token: string | undefined,
  command: (string | number)[],
): Promise<unknown> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    throw new Error(`Redis HTTP request failed: ${response.status}`);
  }

  const body = (await response.json()) as { result?: unknown };
  return body.result;
}

/** HTTP Redis command API (any provider with REST interface). */
export function createRedisHttpStore(config: RedisStoreOptions): CacheStore {
  const endpoint = config.url;
  if (!endpoint) {
    throw new Error('Redis HTTP store requires `url` (https://…).');
  }

  const token = config.token ?? config.password;

  return {
    get: async (key) => {
      const result = await redisHttpCommand(endpoint, token, ['GET', key]);
      return result == null ? null : (result as string);
    },
    set: async (key, value, ttlMs) => {
      if (ttlMs) {
        await redisHttpCommand(endpoint, token, [
          'SET',
          key,
          value,
          'PX',
          ttlMs,
        ]);
        return;
      }
      await redisHttpCommand(endpoint, token, ['SET', key, value]);
    },
    incr: async (key) =>
      Number(await redisHttpCommand(endpoint, token, ['INCR', key])),
    incrWithTtl: async (key, ttlMs) => {
      const result = (await redisHttpCommand(endpoint, token, [
        'EVAL',
        INCR_WITH_TTL_SCRIPT,
        1,
        key,
        ttlMs,
      ])) as [number, number];
      return {
        count: Number(result[0]),
        ttlMs: Math.max(0, Number(result[1])),
      };
    },
    del: async (key) => {
      await redisHttpCommand(endpoint, token, ['DEL', key]);
    },
    expire: async (key, ttlMs) => {
      await redisHttpCommand(endpoint, token, ['PEXPIRE', key, ttlMs]);
    },
  };
}
