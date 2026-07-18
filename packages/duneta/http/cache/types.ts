export type CacheCounter = {
  count: number;
  ttlMs: number;
};

export type CacheStore = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlMs?: number): Promise<void>;
  del(key: string): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, ttlMs: number): Promise<void>;
  incrWithTtl?(key: string, ttlMs: number): Promise<CacheCounter>;
  ping?(): Promise<string>;
};
