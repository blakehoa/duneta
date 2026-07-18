import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { resolveAuthSession } from '../../auth/resolve-session.js';
import type { RequestContext } from '../../middleware/http/request-context.js';
import type { AuthSession } from '../../middleware/http/types.js';
import { requirePermissionCheck } from '../../permission/context.js';
import type { Permission, PolicySubject } from '../../permission/types.js';

/** Shared HTTP response, session, permission, and request metadata helpers. */
export abstract class BaseController {
  protected json<T>(
    c: Context<RequestContext>,
    data: T,
    status: ContentfulStatusCode = 200,
  ) {
    return c.json(data, status);
  }

  protected notFound(c: Context<RequestContext>, message = 'Not Found') {
    return c.json({ error: message, code: 'NOT_FOUND' }, 404);
  }

  protected unauthorized(
    c: Context<RequestContext>,
    message = 'Unauthenticated',
  ) {
    return c.json({ error: message, code: 'UNAUTHORIZED' }, 401);
  }

  protected forbidden(c: Context<RequestContext>, message = 'Forbidden') {
    return c.json({ error: message, code: 'FORBIDDEN' }, 403);
  }

  protected userId(c: Context<RequestContext>) {
    return c.get('userId');
  }

  protected can(
    c: Context<RequestContext>,
    permission: Permission,
    subject?: PolicySubject,
  ) {
    return requirePermissionCheck(c).can(permission, subject);
  }

  protected assertCan(
    c: Context<RequestContext>,
    permission: Permission,
    subject?: PolicySubject,
  ) {
    requirePermissionCheck(c).assert(permission, subject);
  }

  protected async resolveSession(
    c: Context<RequestContext>,
  ): Promise<AuthSession | null> {
    return resolveAuthSession(c);
  }

  protected locale(c: Context<RequestContext>): string {
    return c.get('locale');
  }

  protected timezone(c: Context<RequestContext>): string {
    return c.get('timezone');
  }

  protected requestId(c: Context<RequestContext>): string {
    return c.get('requestId');
  }
}
