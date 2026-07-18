import { AsyncLocalStorage } from 'node:async_hooks';
import type { Database } from './types.js';

type RequestDatabaseContext = {
  databases: Record<string, Database>;
  defaultName: string;
};

const requestDatabases = new AsyncLocalStorage<RequestDatabaseContext>();

export function runWithRequestDatabases<T>(
  databases: Record<string, Database>,
  defaultName: string,
  run: () => T,
): T {
  return requestDatabases.run({ databases, defaultName }, run);
}

export function requestDatabase(name?: string): Database {
  const context = requestDatabases.getStore();
  const resolvedName = name ?? context?.defaultName;
  const db = resolvedName ? context?.databases[resolvedName] : undefined;
  if (!db) {
    throw new Error(
      `Database "${resolvedName ?? 'default'}" is not available outside a request or scheduled invocation.`,
    );
  }
  return db;
}

/**
 * Stable facade for boot-time dependency injection. Every operation is forwarded
 * to the database client owned by the current Worker invocation.
 */
export function createRequestDatabaseFacade(name: string): Database {
  return new Proxy({} as Database, {
    get(_target, property) {
      const db = requestDatabase(name) as unknown as Record<
        PropertyKey,
        unknown
      >;
      const value = db[property];
      return typeof value === 'function' ? value.bind(db) : value;
    },
  });
}
