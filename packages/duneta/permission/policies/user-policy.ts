import type { Context } from 'hono';
import type { RequestContext } from '../../middleware/http/request-context.js';
import { BasePolicy } from '../policy.js';

export class UserPolicy extends BasePolicy {
  static list(c: Context<RequestContext>) {
    this.assertAny(c, ['users.read', 'users.*', '*']);
  }

  static view(c: Context<RequestContext>, user: { id: string }) {
    const subject = { type: 'user', id: user.id, ownerId: user.id };
    this.assertAny(c, ['users.read', 'users.*', '*', 'users.read:self'], subject);
  }
}
