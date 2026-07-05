import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '../repositories/schemas/index.js';

export type Database = NodePgDatabase<typeof schema>;
