import type { DatabaseConnection } from '../../config/server/database.js';
import { isDatabaseEnabled } from '../../config/server/features.js';
import type { DunetaServerConfig } from '../../config/server/types.js';
import { createPgDatabase } from './create-pg-database.js';
import { createRequestDatabaseFacade } from './request-context.js';
import type { Database, WorkerEnv } from './types.js';

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
    databases[name] = createRequestDatabaseFacade(name);
  }
  return databases;
}

/** Open fresh clients for one fetch/scheduled invocation. */
export async function openRequestDatabases(
  config: DunetaServerConfig,
  env: WorkerEnv,
): Promise<Record<string, Database>> {
  if (!isDatabaseEnabled(config)) return {};
  const entries = Object.entries(config.database.connections) as [
    string,
    DatabaseConnection,
  ][];
  return Object.fromEntries(
    await Promise.all(
      entries.map(async ([name, connection]) => {
        if (!connection?.hyperdrive) {
          throw new Error(
            `[duneta] database.connections.${name} requires hyperdrive binding`,
          );
        }
        return [
          name,
          await createPgDatabase(hyperdriveUrl(env, connection.hyperdrive)),
        ] as const;
      }),
    ),
  );
}

export function createDatabase(config: DunetaServerConfig): Database | null {
  if (!isDatabaseEnabled(config)) return null;
  return createDatabases(config)[config.database.default] ?? null;
}
