import {
  // defineConnections,
  defineServerConfig,
  // postgres,
} from 'duneta/config/server';

/**
 * Features OFF by default for dogfood.
 *
 * Enable database with Hyperdrive:
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
 * App repositories should extend `BasePgRepository` from
 * `duneta/http/repositories` and call `await this.db()` — connections open
 * lazily per request and are shared across repositories in the same invocation.
 */
export default defineServerConfig({
  database: {
    enabled: false,
  },
  auth: {
    enabled: false,
  },
  security: {
    rateLimit: {
      enabled: false,
    },
    csrf: {
      enabled: false,
    },
  },
  logging: {
    enabled: false,
  },
  storage: { enabled: false },
});
