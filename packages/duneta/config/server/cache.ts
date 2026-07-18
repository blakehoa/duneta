export type CacheDriver = 'memory' | 'redis' | 'memcached' | 'custom';

export type CacheTransport = 'tcp' | 'http';

export type RedisStoreOptions = {
  /** `redis://` / `rediss://` (TCP) or `https://` (HTTP command API). */
  url?: string;
  transport?: CacheTransport;
  password?: string;
  /** Bearer token for HTTP transport (falls back to `password`). */
  token?: string;
};

export type MemcachedStoreOptions = {
  url?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
};

/** One named store — mirrors `DatabaseConnection`. */
export type MemoryCacheStore = { driver: 'memory' };

export type RedisCacheStore = {
  driver: 'redis';
  store: RedisStoreOptions;
};

export type MemcachedCacheStore = {
  driver: 'memcached';
  store: MemcachedStoreOptions;
};

export type CustomCacheStore = {
  driver: 'custom';
  /** Id passed to `registerCacheStore()`. */
  provider: string;
  options?: Record<string, unknown>;
};

export type CacheStoreEntry =
  | MemoryCacheStore
  | RedisCacheStore
  | MemcachedCacheStore
  | CustomCacheStore;

/** Multi-store cache — mirrors `DatabaseConfig`. */
export type CacheConfig<TStores extends object = Record<string, CacheStoreEntry>> = {
  enabled?: boolean;
  /** Default store name — falls back to the first store when omitted. */
  default?: string;
  stores: TStores;
};

export function memoryCache(): MemoryCacheStore {
  return { driver: 'memory' };
}

export function redisCache(store: RedisStoreOptions = {}): RedisCacheStore {
  return { driver: 'redis', store };
}

export function memcachedCache(store: MemcachedStoreOptions = {}): MemcachedCacheStore {
  return { driver: 'memcached', store };
}

export function customCache(
  provider: string,
  options?: Record<string, unknown>,
): CustomCacheStore {
  return { driver: 'custom', provider, options };
}

/** Mirror `defineConnections` — drops undefined entries. */
export function defineCacheStores<const T extends Record<string, CacheStoreEntry | undefined>>(
  stores: T,
) {
  const resolved = {} as {
    [K in keyof T as T[K] extends CacheStoreEntry ? K : never]: NonNullable<T[K]>;
  };
  for (const [name, store] of Object.entries(stores)) {
    if (store) Object.assign(resolved, { [name]: store });
  }
  return resolved;
}

export function resolveRedisTransport(config: RedisStoreOptions): CacheTransport {
  if (config.transport) return config.transport;

  const url = config.url?.trim();
  if (url?.startsWith('http://') || url?.startsWith('https://')) return 'http';
  if (url?.startsWith('redis://') || url?.startsWith('rediss://')) return 'tcp';

  return 'tcp';
}
