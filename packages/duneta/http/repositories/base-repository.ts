import type { Database } from '../database/types.js';
import { getInvocationDatabase } from '../database/invocation-context.js';

/** Non-empty connection list; the first name is the repository default. */
export type RepositoryDatabaseNames = readonly [string, ...string[]];

/** Base data-access class with lazy per-invocation database resolution. */
export abstract class BaseRepository {
  /**
   * Connections this repository may use. The first entry is used by `db()`.
   * Omit the property when the repository only uses the app default.
   */
  protected readonly databases?: RepositoryDatabaseNames;

  /**
   * Lazily open the request client for a declared connection.
   * Omit `name` to use the first declared connection or the app default.
   */
  protected db(name?: string): Promise<Database> {
    if (name && !this.databases?.includes(name)) {
      return Promise.reject(
        new Error(
          `[duneta] ${this.constructor.name} did not declare database "${name}"`,
        ),
      );
    }
    return getInvocationDatabase(name ?? this.databases?.[0]);
  }
}
