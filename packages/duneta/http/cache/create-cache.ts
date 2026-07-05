import type { CacheConfig } from '../../config/server/cache.js';
import { isCacheActive } from '../../config/server/cache.js';
import { Cache } from './cache.js';
import { createCacheStore, isDistributedCache } from './stores/index.js';
import { NullCacheStore } from './stores/null.js';

export function createCache(config: CacheConfig): Cache {
  if (!isCacheActive(config)) {
    return new Cache(new NullCacheStore(), 'none', false, false);
  }

  const store = createCacheStore(config);
  return new Cache(store, config.driver, isDistributedCache(config), true);
}
