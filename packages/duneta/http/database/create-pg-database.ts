import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../repositories/schemas/index.js';
import type { Database } from './types.js';

/** Edge connect budget — Hyperdrive is fast; hanging forever is worse than failing. */
const CONNECTION_TIMEOUT_MS = 5_000;

export type OpenedDatabase = {
  db: Database;
  /** End the edge client. Hyperdrive keeps the origin connection pooled. */
  close: () => Promise<void>;
};

/** Open one node-postgres client for the current Worker invocation. */
export async function createPgDatabase(url: string): Promise<OpenedDatabase> {
  const client = new pg.Client({
    connectionString: url,
    connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
  });
  await client.connect();
  return {
    db: drizzle(client, { schema }),
    close: () => client.end(),
  };
}
