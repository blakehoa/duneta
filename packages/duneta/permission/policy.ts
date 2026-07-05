import type { Context } from 'hono';
import type { RequestContext } from '../middleware/http/request-context.js';
import { requirePermissionCheck } from './context.js';
import { ForbiddenError } from './errors.js';
import type { Permission, PolicySubject } from './types.js';

/** Extend in app `policies/*` for domain rules. */
export abstract class BasePolicy {
  protected static check(c: Context<RequestContext>) {
    return requirePermissionCheck(c);
  }

  protected static can(c: Context<RequestContext>, permission: Permission, subject?: PolicySubject) {
    return this.check(c).can(permission, subject);
  }

  protected static assert(c: Context<RequestContext>, permission: Permission, subject?: PolicySubject) {
    this.check(c).assert(permission, subject);
  }

  protected static assertAny(
    c: Context<RequestContext>,
    permissions: Permission[],
    subject?: PolicySubject,
  ) {
    if (permissions.some((p) => this.can(c, p, subject))) return;
    throw new ForbiddenError();
  }
}
