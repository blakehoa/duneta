import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import type { DatabasePoolConfig } from '../../config/server/database.js';
import * as schema from '../repositories/schemas/index.js';
import type { Database } from './types.js';

export function createPgDatabase(url: string, pool: DatabasePoolConfig): Database {
  const pgPool = new pg.Pool({
    connectionString: url,
    max: pool.max,
    idleTimeoutMillis: pool.idleTimeout * 1000,
    connectionTimeoutMillis: pool.connectTimeout * 1000,
  });

  return drizzle(pgPool, { schema });
}
