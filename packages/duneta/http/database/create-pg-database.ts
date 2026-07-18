import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../repositories/schemas/index.js';
import type { Database } from './types.js';

/** Open one node-postgres client for the current Worker invocation. */
export async function createPgDatabase(url: string): Promise<Database> {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  return drizzle(client, { schema });
}
