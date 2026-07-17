import { databasePool, type DatabaseConnection } from '../../config/server/database.js';
import { isDatabaseEnabled } from '../../config/server/features.js';
import type { DunetaServerConfig } from '../../config/server/types.js';
import { createPgDatabase } from './create-pg-database.js';
import type { Database } from './types.js';
import { hyperdriveUrl } from './worker-env.js';

function open(config: DunetaServerConfig, connection: DatabaseConnection): Database {
  return createPgDatabase(hyperdriveUrl(connection.hyperdrive), databasePool(config.database));
}

/** All configured Hyperdrive connections. Throws if enabled without bindings. */
export function createDatabases(config: DunetaServerConfig): Record<string, Database> {
  if (!isDatabaseEnabled(config)) return {};

  const { connections, default: defaultName } = config.database;
  if (!connections[defaultName as keyof typeof connections]) {
    throw new Error(`[duneta] database.default "${defaultName}" missing from connections`);
  }

  const databases: Record<string, Database> = {};
  for (const [name, connection] of Object.entries(connections) as [string, DatabaseConnection][]) {
    if (!connection?.hyperdrive) {
      throw new Error(`[duneta] database.connections.${name} requires hyperdrive binding`);
    }
    databases[name] = open(config, connection);
  }
  return databases;
}

export function createDatabase(config: DunetaServerConfig): Database | null {
  if (!isDatabaseEnabled(config)) return null;
  return createDatabases(config)[config.database.default] ?? null;
}
