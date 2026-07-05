import type { CacheStore } from '../types.js';

type MemoryEntry = { value: string; expiresAt?: number };

export class MemoryCacheStore implements CacheStore {
  private readonly store = new Map<string, MemoryEntry>();

  get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return Promise.resolve(null);
    if (entry.expiresAt !== undefined && entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return Promise.resolve(null);
    }
    return Promise.resolve(entry.value);
  }

  set(key: string, value: string, ttlMs?: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: ttlMs ? Date.now() + ttlMs : undefined,
    });
    return Promise.resolve();
  }

  del(key: string): Promise<void> {
    this.store.delete(key);
    return Promise.resolve();
  }

  incr(key: string): Promise<number> {
    const current = Number(this.store.get(key)?.value ?? '0');
    const next = current + 1;
    const entry = this.store.get(key);
    this.store.set(key, { value: String(next), expiresAt: entry?.expiresAt });
    return Promise.resolve(next);
  }

  expire(key: string, ttlMs: number): Promise<void> {
    const entry = this.store.get(key);
    if (!entry) return Promise.resolve();
    entry.expiresAt = Date.now() + ttlMs;
    this.store.set(key, entry);
    return Promise.resolve();
  }

  ping(): Promise<string> {
    return Promise.resolve('PONG');
  }
}
