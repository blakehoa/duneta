import type { CacheStoreEntry } from '../../../config/server/cache.js';
import { resolveRedisTransport } from '../../../config/server/cache.js';
import type { CacheStore } from '../types.js';
import { MemoryCacheStore } from './memory.js';
import { createRedisHttpStore } from './redis-http.js';

export type CacheStoreFactory = (entry: CacheStoreEntry) => CacheStore;

const builtinStores = new Map<string, CacheStoreFactory>([
  ['memory', () => new MemoryCacheStore()],
  [
    'redis',
    (entry) => {
      if (entry.driver !== 'redis') {
        throw new Error('Expected redis cache store.');
      }
      if (resolveRedisTransport(entry.store) === 'http') {
        return createRedisHttpStore(entry.store);
      }
      throw new Error(
        'Redis TCP is not wired yet. Use an HTTP `url` on Workers, or `driver: "memory"` locally.',
      );
    },
  ],
  [
    'memcached',
    () => {
      throw new Error('Memcached is not wired yet. Use `driver: "redis"` or `driver: "memory"`.');
    },
  ],
]);

const customProviders = new Map<string, CacheStoreFactory>();

/** Register a custom provider for `customCache('name')` (or override a builtin driver). */
export function registerCacheStore(provider: string, factory: CacheStoreFactory): void {
  customProviders.set(provider, factory);
}

export function createCacheStore(entry: CacheStoreEntry): CacheStore {
  if (entry.driver === 'custom') {
    const factory = customProviders.get(entry.provider);
    if (!factory) {
      throw new Error(
        `Unknown custom cache provider "${entry.provider}". Use registerCacheStore("${entry.provider}", ...) first.`,
      );
    }
    return factory(entry);
  }

  const factory = customProviders.get(entry.driver) ?? builtinStores.get(entry.driver);
  if (!factory) {
    throw new Error(
      `Unknown cache driver "${entry.driver}". Built-in: memory, redis, memcached, custom.`,
    );
  }
  return factory(entry);
}
