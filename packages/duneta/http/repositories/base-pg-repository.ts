import { eq } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import {
  getInvocationDatabaseDriver,
} from '../database/invocation-context.js';
import type { Database } from '../database/types.js';
import { BaseRepository } from './base-repository.js';

type TableWithId = PgTable & { id: PgColumn };

/** PostgreSQL repository with generic CRUD helpers for tables containing `id`. */
export abstract class BasePgRepository<
  TTable extends TableWithId,
> extends BaseRepository {
  constructor(protected readonly table: TTable) {
    super();
  }

  /** Resolve a declared database and reject non-PostgreSQL connections. */
  protected override db(name?: string): Promise<Database> {
    const connectionName = name ?? this.databases?.[0];
    const driver = getInvocationDatabaseDriver(connectionName);
    if (driver !== 'postgres') {
      return Promise.reject(
        new Error(
          `[duneta] ${this.constructor.name} requires driver "postgres"; ` +
            `database "${connectionName ?? 'default'}" uses "${driver}"`,
        ),
      );
    }
    return super.db(name);
  }

  /** Return every row from the repository table. */
  async findAll() {
    const db = await this.db();
    return db.select().from(this.table as PgTable);
  }

  /** Find one row by its `id`, or return `null`. */
  async findById(id: string) {
    const db = await this.db();
    const rows = await db
      .select()
      .from(this.table as PgTable)
      .where(eq(this.table.id, id))
      .limit(1);
    return (rows as Record<string, unknown>[])[0] ?? null;
  }

  /** Insert and return one row. */
  async create(values: Record<string, unknown>) {
    const db = await this.db();
    const rows = await db
      .insert(this.table as PgTable)
      .values(values)
      .returning();
    return (rows as Record<string, unknown>[])[0] ?? null;
  }

  /** Update and return one row by its `id`. */
  async update(id: string, values: Record<string, unknown>) {
    const db = await this.db();
    const rows = await db
      .update(this.table as PgTable)
      .set(values)
      .where(eq(this.table.id, id))
      .returning();
    return (rows as Record<string, unknown>[])[0] ?? null;
  }

  /** Delete and return one row by its `id`. */
  async delete(id: string) {
    const db = await this.db();
    const rows = await db
      .delete(this.table as PgTable)
      .where(eq(this.table.id, id))
      .returning();
    return (rows as Record<string, unknown>[])[0] ?? null;
  }
}
