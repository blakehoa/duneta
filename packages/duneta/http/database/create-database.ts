import type { DatabaseConnection } from '../../config/server/database.js';
import { isAuthEnabled, isDatabaseEnabled } from '../../config/server/features.js';
import type { DunetaServerConfig } from '../../config/server/types.js';
import { createPgDatabase, type OpenedDatabase } from './create-pg-database.js';
import {
  createDatabaseFacade,
  type InvocationDatabaseScope,
} from './invocation-context.js';
import type { Database, WorkerEnv } from './types.js';

/** Resolve one Hyperdrive binding to its invocation-local connection URL. */
function hyperdriveUrl(env: WorkerEnv, binding: string): string {
  const value = env?.[binding] as { connectionString?: string } | undefined;
  const url = value?.connectionString;
  if (!url) {
    throw new Error(
      `[duneta] missing Hyperdrive binding "${binding}" (wrangler hyperdrive[].binding)`,
    );
  }
  return url;
}

/** Stable request-scoped facades safe to inject into singleton services at boot. */
export function createDatabases(
  config: DunetaServerConfig,
): Record<string, Database> {
  if (!isDatabaseEnabled(config)) return {};

  const { connections, default: defaultName } = config.database;
  if (!connections[defaultName as keyof typeof connections]) {
    throw new Error(
      `[duneta] database.default "${defaultName}" missing from connections`,
    );
  }

  const databases: Record<string, Database> = {};
  for (const [name, connection] of Object.entries(connections) as [
    string,
    DatabaseConnection,
  ][]) {
    if (!connection?.hyperdrive) {
      throw new Error(
        `[duneta] database.connections.${name} requires hyperdrive binding`,
      );
    }
    databases[name] = createDatabaseFacade(name);
  }
  return databases;
}

/**
 * Lazy client registry for one fetch/scheduled invocation. Nothing connects
 * until `getOrOpen(name)` is first awaited; repeated calls share one client.
 */
export function createDatabaseScope(
  config: DunetaServerConfig,
  env: WorkerEnv,
): InvocationDatabaseScope {
  const connections = config.database.connections as Record<
    string,
    DatabaseConnection
  >;
  const defaultName = config.database.default;
  const authName = isAuthEnabled(config)
    ? (config.auth.database ?? defaultName)
    : defaultName;

  const clients = new Map<string, Promise<OpenedDatabase>>();
  const openedByName = new Map<string, Database>();
  const retained: Promise<unknown>[] = [];
  let closed = false;

  /** Resolve and validate one named connection without opening it. */
  function resolveConnection(name: string): DatabaseConnection {
    const connection = connections[name];
    if (!connection) {
      throw new Error(
        `[duneta] unknown request database "${name}" (database.connections)`,
      );
    }
    return connection;
  }

  /** Return the shared client, opening it on first use. */
  async function getOrOpen(name = defaultName): Promise<Database> {
    if (closed) {
      throw new Error('[duneta] database scope is already closed');
    }

    let pending = clients.get(name);
    if (!pending) {
      const databaseConnection = resolveConnection(name);
      if (!databaseConnection.hyperdrive) {
        throw new Error(
          `[duneta] database.connections.${name} requires hyperdrive binding`,
        );
      }
      pending = createPgDatabase(
        hyperdriveUrl(env, databaseConnection.hyperdrive),
      );
      clients.set(name, pending);
      pending
        .then((opened) => {
          if (!closed) openedByName.set(name, opened.db);
        })
        .catch(() => {
          if (!closed) clients.delete(name);
        });
    }
    return (await pending).db;
  }

  return {
    defaultName,
    authName,
    getOrOpen,
    peek(name = defaultName) {
      return closed ? undefined : openedByName.get(name);
    },
    driver(name = defaultName) {
      return resolveConnection(name).driver;
    },
    retain(promise) {
      if (closed) return;
      retained.push(Promise.resolve(promise).catch(() => undefined));
    },
    async close() {
      if (closed) return;

      // Background work (waitUntil) may still need clients after the handler.
      await Promise.allSettled(retained);
      if (closed) return;

      closed = true;
      const pendings = [...clients.values()];
      clients.clear();
      openedByName.clear();
      await Promise.allSettled(
        pendings.map((pending) => pending.then((opened) => opened.close())),
      );
    },
  };
}
