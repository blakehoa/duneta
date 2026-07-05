import { eq } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import type { Database } from '../database/types.js';

type TableWithId = PgTable & { id: PgColumn };

export abstract class BaseRepository<TTable extends TableWithId> {
  private static contextDb: Database | null | undefined;

  /** Gọi một lần lúc boot — trước `registerServices`. */
  static bindDb(db: Database | null): void {
    BaseRepository.contextDb = db;
  }

  constructor(protected readonly table: TTable) {}

  protected get db(): Database {
    if (BaseRepository.contextDb === undefined) {
      throw new Error('Repository context not bound. Call BaseRepository.bindDb() at boot.');
    }
    if (BaseRepository.contextDb === null) {
      throw new Error('Database not configured. Set database in config/server.ts.');
    }
    return BaseRepository.contextDb;
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
