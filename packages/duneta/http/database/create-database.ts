import { connectionUrl, databasePoolForRuntime } from '../../config/server/database.js';
import { isDatabaseEnabled } from '../../config/server/features.js';
import type { DunetaServerConfig } from '../../config/server/types.js';
import { createPgDatabase } from './create-pg-database.js';
import type { Database } from './types.js';

export function createDatabase(config: DunetaServerConfig): Database | null {
  if (!isDatabaseEnabled(config)) return null;

  const url = connectionUrl(config.database);
  if (!url) return null;

  const connection = config.database.connections[config.database.default];
  if (connection && connection.driver !== 'postgres') return null;

  const pool = databasePoolForRuntime(config.runtime.target, config.database.pool);
  return createPgDatabase(url, pool);
}
