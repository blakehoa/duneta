import { eq } from 'drizzle-orm';
import { BaseRepository } from './base-repository.js';
import { user } from './schemas/auth.js';

export class UserRepository extends BaseRepository<typeof user> {
  constructor() {
    super(user);
  }

  findByEmail(email: string) {
    return this.db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1)
      .then((rows) => rows[0] ?? null);
  }
}
