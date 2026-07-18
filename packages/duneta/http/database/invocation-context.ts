import { AsyncLocalStorage } from 'node:async_hooks';
import type { Database } from './types.js';

/**
 * Lazy per-invocation database registry. Clients open on first use, are shared
 * by connection name, and close together when the invocation ends.
 *
 * Background work registered via `retain()` (usually from `waitUntil`) may keep
 * using the same clients until those promises settle.
 */
export type InvocationDatabaseScope = {
  defaultName: string;
  /** Auth/session connection (`auth.database` or the default connection). */
  authName: string;
  /** Lazily open (once per invocation) the client for a connection. */
  getOrOpen(name?: string): Promise<Database>;
  /** Client already opened during this invocation, if any. */
  peek(name?: string): Database | undefined;
  /** Return the configured driver without opening a client. */
  driver(name?: string): string;
  /**
   * Keep the scope open until `promise` settles.
   * Call this for every `waitUntil` task that still needs the database.
   */
  retain(promise: Promise<unknown>): void;
  /** Close every client after retained background work finishes. */
  close(): Promise<void>;
};

const databaseScope = new AsyncLocalStorage<InvocationDatabaseScope>();

/** Run work inside one HTTP or scheduled database invocation. */
export function runWithDatabaseScope<T>(
  scope: InvocationDatabaseScope,
  run: () => T,
): T {
  return databaseScope.run(scope, run);
}

/** Lazily open and share one client for this invocation. */
export function getInvocationDatabase(name?: string): Promise<Database> {
  const scope = databaseScope.getStore();
  if (!scope) {
    return Promise.reject(
      new Error(
        `Database "${name ?? 'default'}" is not available outside a request or scheduled invocation.`,
      ),
    );
  }
  return scope.getOrOpen(name);
}

/** Return the configured driver for one invocation connection. */
export function getInvocationDatabaseDriver(name?: string): string {
  const scope = databaseScope.getStore();
  if (!scope) {
    throw new Error(
      `Database "${name ?? 'default'}" is not available outside a request or scheduled invocation.`,
    );
  }
  return scope.driver(name);
}

/** Open the auth/session connection; return `null` when no scope is active. */
export function getAuthInvocationDatabase(): Promise<Database | null> {
  const scope = databaseScope.getStore();
  if (!scope) return Promise.resolve(null);
  return scope.getOrOpen(scope.authName);
}

/** Return an opened client for the synchronous boot-time facade. */
function getOpenedDatabase(name?: string): Database {
  const scope = databaseScope.getStore();
  const db = scope?.peek(name);
  if (!db) {
    throw new Error(
      `Database "${name ?? scope?.defaultName ?? 'default'}" is not open for this invocation. ` +
        'Open it via a repository (`await this.db()`) or `getInvocationDatabase()`.',
    );
  }
  return db;
}

/**
 * Create a stable boot-time facade that forwards property/method access to the
 * opened client for the current invocation. Only supports get/call usage.
 */
export function createDatabaseFacade(name: string): Database {
  return new Proxy({} as Database, {
    get(_target, property) {
      const db = getOpenedDatabase(name) as unknown as Record<
        PropertyKey,
        unknown
      >;
      const value = db[property];
      return typeof value === 'function' ? value.bind(db) : value;
    },
  });
}
