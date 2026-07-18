import { eq } from 'drizzle-orm';
import { BasePgRepository } from './base-pg-repository.js';
import { user } from './schemas/auth.js';

export class UserRepository extends BasePgRepository<typeof user> {
  constructor() {
    super(user);
  }

  /** Find one user by email address, or return `null`. */
  async findByEmail(email: string) {
    const db = await this.db();
    const rows = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
    return rows[0] ?? null;
  }
}
