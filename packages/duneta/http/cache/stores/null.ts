import type { CacheStore } from '../types.js';

/** No-op store when cache is disabled — safe for `cached.*` calls. */
export class NullCacheStore implements CacheStore {
  get(): Promise<string | null> {
    return Promise.resolve(null);
  }

  set(): Promise<void> {
    return Promise.resolve();
  }

  del(): Promise<void> {
    return Promise.resolve();
  }

  incr(): Promise<number> {
    return Promise.resolve(0);
  }

  expire(): Promise<void> {
    return Promise.resolve();
  }
}
