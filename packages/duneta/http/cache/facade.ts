import { Cache } from './cache.js';
import { disabledCache, resolveCache } from './create-cache.js';

let active: Cache = disabledCache;
let stores: Record<string, Cache> = {};

/** Wire the global cache instance(s) (called on boot). */
export function setGlobalCache(cache: Cache, all: Record<string, Cache> = {}): void {
  active = cache;
  stores = all;
}

/**
 * Global cache facade — default store, or `cached.store('name')` for a named one.
 *
 * ```ts
 * await cached.set('key', 'value', 60_000);
 * await cached.store('second').get('key');
 * ```
 */
export const cached = {
  get enabled() {
    return active.enabled;
  },

  get(key: string) {
    return active.get(key);
  },

  set(key: string, value: string, ttlMs?: number) {
    return active.set(key, value, ttlMs);
  },

  has(key: string) {
    return active.has(key);
  },

  forget(key: string) {
    return active.forget(key);
  },

  incr(key: string) {
    return active.incr(key);
  },

  expire(key: string, ttlMs: number) {
    return active.expire(key, ttlMs);
  },

  ping() {
    return active.ping();
  },

  /** Named store from `cache.stores` — throws if missing. */
  store(name: string): Cache {
    return resolveCache(stores, name, disabledCache);
  },
};
