export { Cache } from './cache.js';
export {
  createCaches,
  defaultCache,
  disabledCache,
  resolveCache,
} from './create-cache.js';
export { registerCacheStore, type CacheStoreFactory } from './stores/index.js';
export type { CacheCounter, CacheStore } from './types.js';
export { cached } from './facade.js';
