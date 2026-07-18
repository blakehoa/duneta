import type { CacheCounter, CacheStore } from './types.js';

/** Application cache — use `get` / `set` / `has` / `forget` everywhere. */
export class Cache {
  readonly enabled: boolean;

  constructor(
    private readonly store: CacheStore,
    readonly driver: string,
    enabled = true,
  ) {
    this.enabled = enabled;
  }

  get(key: string): Promise<string | null> {
    return this.store.get(key);
  }

  set(key: string, value: string, ttlMs?: number): Promise<void> {
    return this.store.set(key, value, ttlMs);
  }

  async has(key: string): Promise<boolean> {
    return (await this.store.get(key)) !== null;
  }

  forget(key: string): Promise<void> {
    return this.store.del(key);
  }

  incr(key: string): Promise<number> {
    return this.store.incr(key);
  }

  expire(key: string, ttlMs: number): Promise<void> {
    return this.store.expire(key, ttlMs);
  }

  async incrWithTtl(key: string, ttlMs: number): Promise<CacheCounter> {
    if (this.store.incrWithTtl) return this.store.incrWithTtl(key, ttlMs);

    const count = await this.store.incr(key);
    if (count === 1) await this.store.expire(key, ttlMs);
    return { count, ttlMs };
  }

  ping(): Promise<string> {
    return this.store.ping?.() ?? Promise.resolve('PONG');
  }
}
