import { Cache } from '../cache/cache.js';
import { NullCacheStore } from '../cache/stores/null.js';

const disabled = new Cache(new NullCacheStore(), 'none', false, false);

let active: Cache = disabled;

/** Wire the global cache instance (called on boot). */
export function setGlobalCache(cache: Cache): void {
  active = cache;
}

/**
 * Global cache facade — use anywhere without injecting context.
 *
 * ```ts
 * import { cached } from 'duneta/server/cached';
 * await cached.set('key', 'value', 60_000);
 * await cached.get('key');
 * await cached.has('key');
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

  check(key: string) {
    return active.check(key);
  },

  forget(key: string) {
    return active.forget(key);
  },

  del(key: string) {
    return active.del(key);
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
};
