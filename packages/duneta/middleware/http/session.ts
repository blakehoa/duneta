import { createMiddleware } from 'hono/factory';
import {
  getPermissionResolver,
  setPermissions,
} from '../../permission/context.js';
import { resolveAuthSession } from '../../auth/resolve-session.js';
import type { RequestContext } from './request-context.js';

/** Require login; loads permission grants when the app service provider exports `resolvePermissions`. */
export function requireSession() {
  return createMiddleware<RequestContext>(async (c, next) => {
    const session = await resolveAuthSession(c);
    if (!session?.user) {
      return c.json({ error: 'Unauthenticated', code: 'UNAUTHORIZED' }, 401);
    }

    const resolve = getPermissionResolver(c);
    if (resolve) {
      const context = await resolve({ c, userId: session.user.id });
      if (!context) {
        return c.json({ error: 'Forbidden', code: 'FORBIDDEN' }, 403);
      }
      setPermissions(c, context);
    }

    await next();
  });
}
