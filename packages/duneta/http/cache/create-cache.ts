import type { CacheConfig, CacheStoreEntry } from '../../config/server/cache.js';
import { Cache } from './cache.js';
import { createCacheStore } from './stores/index.js';
import { NullCacheStore } from './stores/null.js';

export const disabledCache = new Cache(new NullCacheStore(), 'none', false);

function driverLabel(entry: CacheStoreEntry): string {
  return entry.driver === 'custom' ? entry.provider : entry.driver;
}

/** All configured cache stores. */
export function createCaches(config: CacheConfig): Record<string, Cache> {
  if (config.enabled !== true) return {};

  const caches: Record<string, Cache> = {};
  for (const [name, entry] of Object.entries(config.stores) as [string, CacheStoreEntry][]) {
    if (!entry) continue;
    caches[name] = new Cache(createCacheStore(entry), driverLabel(entry), true);
  }
  return caches;
}

/** `cache.default` store, else the first configured one, else a no-op cache. */
export function defaultCache(config: CacheConfig, caches: Record<string, Cache>): Cache {
  if (config.default) {
    const store = caches[config.default];
    if (!store) {
      throw new Error(`[duneta] cache.default "${config.default}" is not configured`);
    }
    return store;
  }
  return Object.values(caches)[0] ?? disabledCache;
}

/**
 * Resolve a named store, or fall back to `fallback` when `name` is omitted.
 * Throws if `name` is set but missing from `caches`.
 */
export function resolveCache(
  caches: Record<string, Cache>,
  name: string | undefined,
  fallback: Cache,
): Cache {
  if (!name) return fallback;
  const store = caches[name];
  if (!store) {
    throw new Error(`[duneta] cache store "${name}" is not configured`);
  }
  return store;
}
