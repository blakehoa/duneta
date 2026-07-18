import { eq } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import type { Database } from '../database/types.js';
import { requestDatabase } from '../database/request-context.js';

type TableWithId = PgTable & { id: PgColumn };

export abstract class BaseRepository<TTable extends TableWithId> {
  constructor(
    protected readonly table: TTable,
    private readonly database?: string,
  ) {}

  protected get db(): Database {
    return requestDatabase(this.database);
  }

  async findAll() {
    return this.db.select().from(this.table as PgTable);
  }

  async findById(id: string) {
    const rows = await this.db
      .select()
      .from(this.table as PgTable)
      .where(eq(this.table.id, id))
      .limit(1);
    return (rows as Record<string, unknown>[])[0] ?? null;
  }

  async create(values: Record<string, unknown>) {
    const rows = await this.db
      .insert(this.table as PgTable)
      .values(values)
      .returning();
    return (rows as Record<string, unknown>[])[0] ?? null;
  }

  async update(id: string, values: Record<string, unknown>) {
    const rows = await this.db
      .update(this.table as PgTable)
      .set(values)
      .where(eq(this.table.id, id))
      .returning();
    return (rows as Record<string, unknown>[])[0] ?? null;
  }

  async delete(id: string) {
    const rows = await this.db
      .delete(this.table as PgTable)
      .where(eq(this.table.id, id))
      .returning();
    return (rows as Record<string, unknown>[])[0] ?? null;
  }
}
