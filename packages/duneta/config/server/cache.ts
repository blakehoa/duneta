export type CacheDriver = 'memory' | 'redis' | 'memcached';

export type CacheTransport = 'tcp' | 'http';

export type CacheRetryConfig = {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
};

export type CacheTimeoutConfig = {
  connectionTimeout: number;
  commandTimeout: number;
};

export const DEFAULT_CACHE_RETRY: CacheRetryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
};

export const DEFAULT_CACHE_TIMEOUT: CacheTimeoutConfig = {
  connectionTimeout: 5000,
  commandTimeout: 3000,
};

export type MemoryStoreOptions = Record<string, never>;

export type RedisStoreOptions = CacheTimeoutConfig & {
  /** `redis://` / `rediss://` (TCP) or `https://` (HTTP command API). */
  url?: string;
  transport?: CacheTransport;
  host?: string;
  port?: number;
  password?: string;
  /** Bearer token for HTTP transport (falls back to `password`). */
  token?: string;
  db?: number;
  retry?: Partial<CacheRetryConfig>;
};

export type MemcachedStoreOptions = CacheTimeoutConfig & {
  url?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  retry?: Partial<CacheRetryConfig>;
};

export type CacheDisabled = { enabled?: false };

export type MemoryCacheConfig = {
  enabled: true;
  driver: 'memory';
  store?: MemoryStoreOptions;
};

export type RedisCacheConfig = {
  enabled: true;
  driver: 'redis';
  store: RedisStoreOptions;
};

export type MemcachedCacheConfig = {
  enabled: true;
  driver: 'memcached';
  store: MemcachedStoreOptions;
};

export type CacheConfig =
  | CacheDisabled
  | MemoryCacheConfig
  | RedisCacheConfig
  | MemcachedCacheConfig;

export type ActiveCacheConfig = MemoryCacheConfig | RedisCacheConfig | MemcachedCacheConfig;

export function isCacheActive(config: CacheConfig): config is ActiveCacheConfig {
  return config.enabled === true;
}

export function memoryCache(store: MemoryStoreOptions = {}): MemoryCacheConfig {
  return { enabled: true, driver: 'memory', store };
}

export function redisCache(store: Partial<RedisStoreOptions> = {}): RedisCacheConfig {
  return {
    enabled: true,
    driver: 'redis',
    store: { ...DEFAULT_CACHE_TIMEOUT, retry: { ...DEFAULT_CACHE_RETRY }, ...store },
  };
}

export function memcachedCache(store: Partial<MemcachedStoreOptions> = {}): MemcachedCacheConfig {
  return {
    enabled: true,
    driver: 'memcached',
    store: {
      host: 'localhost',
      port: 11211,
      retry: { ...DEFAULT_CACHE_RETRY },
      ...DEFAULT_CACHE_TIMEOUT,
      ...store,
    },
  };
}

export function resolveRedisTransport(config: RedisStoreOptions): CacheTransport {
  if (config.transport) return config.transport;

  const url = config.url?.trim();
  if (url?.startsWith('http://') || url?.startsWith('https://')) return 'http';
  if (url?.startsWith('redis://') || url?.startsWith('rediss://')) return 'tcp';

  return 'tcp';
}
