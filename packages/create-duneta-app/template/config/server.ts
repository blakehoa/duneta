import {
  // defineConnections,
  defineServerConfig,
  // postgres,
} from 'duneta/config/server';

/**
 * Minimal API — optional modules OFF.
 * `app.env` comes from `process.env.NODE_ENV` (Wrangler vars).
 *
 * When enabling Postgres + Hyperdrive:
 *
 * ```ts
 * export default defineServerConfig({
 *   database: {
 *     enabled: true,
 *     default: 'primary',
 *     connections: defineConnections({
 *       primary: postgres('HYPERDRIVE'),
 *     }),
 *   },
 * });
 * ```
 *
 * Repositories should extend `BasePgRepository` and open clients lazily via
 * `await this.db()` — no `database` metadata on ApiRoute.
 */
export default defineServerConfig({});
