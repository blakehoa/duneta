import type { ActiveCacheConfig, CacheConfig } from '../../../config/server/cache.js';
import { isCacheActive, resolveRedisTransport } from '../../../config/server/cache.js';
import type { CacheStore } from '../types.js';
import { MemoryCacheStore } from './memory.js';
import { NullCacheStore } from './null.js';
import { createRedisHttpStore } from './redis-http.js';

export type CacheStoreFactory = (config: ActiveCacheConfig) => CacheStore;

const builtinStores = new Map<string, CacheStoreFactory>([
  ['memory', () => new MemoryCacheStore()],
  ['redis', (config) => {
    if (config.driver !== 'redis') {
      throw new Error('Expected redis cache config.');
    }
    if (resolveRedisTransport(config.store) === 'http') {
      return createRedisHttpStore(config.store);
    }
    throw new Error(
      'Redis TCP is not wired yet. Use an HTTP `url` on Workers, or `driver: "memory"` locally.',
    );
  }],
  ['memcached', () => {
    throw new Error('Memcached is not wired yet. Use `driver: "redis"` or `driver: "memory"`.');
  }],
]);

const customStores = new Map<string, CacheStoreFactory>();

export function registerCacheStore(driver: string, factory: CacheStoreFactory): void {
  customStores.set(driver, factory);
}

export function createCacheStore(config: CacheConfig): CacheStore {
  if (!isCacheActive(config)) return new NullCacheStore();

  const factory = customStores.get(config.driver) ?? builtinStores.get(config.driver);
  if (!factory) {
    throw new Error(
      `Unknown cache driver "${config.driver}". Built-in: memory, redis, memcached. Use registerCacheStore() for custom drivers.`,
    );
  }
  return factory(config);
}

export function isDistributedCache(config: CacheConfig): boolean {
  if (!isCacheActive(config)) return false;
  if (config.driver === 'memory') return false;
  if (config.driver === 'redis') return resolveRedisTransport(config.store) === 'http';
  if (config.driver === 'memcached') return true;
  return false;
}
