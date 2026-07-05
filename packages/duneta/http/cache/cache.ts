import type { CacheStore } from './types.js';

/** Application cache facade — use `get` / `set` / `has` / `forget` everywhere. */
export class Cache {
  readonly enabled: boolean;

  constructor(
    private readonly store: CacheStore,
    readonly driver: string,
    readonly distributed: boolean,
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

  check(key: string): Promise<boolean> {
    return this.has(key);
  }

  async has(key: string): Promise<boolean> {
    return (await this.store.get(key)) !== null;
  }

  forget(key: string): Promise<void> {
    return this.store.del(key);
  }

  del(key: string): Promise<void> {
    return this.forget(key);
  }

  incr(key: string): Promise<number> {
    return this.store.incr(key);
  }

  expire(key: string, ttlMs: number): Promise<void> {
    return this.store.expire(key, ttlMs);
  }

  ping(): Promise<string> {
    return this.store.ping?.() ?? Promise.resolve('PONG');
  }
}
