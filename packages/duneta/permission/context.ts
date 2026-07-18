import type { Context } from 'hono';
import type { RequestContext } from '../middleware/http/request-context.js';
import { createPermissionCheck } from './check.js';
import type { PermissionCheck, PermissionContext } from './types.js';

export function getPermissionContext(c: Context<RequestContext>) {
  return c.get('permissionContext');
}

export function getPermissionCheck(c: Context<RequestContext>) {
  return c.get('permissionCheck');
}

export function getPermissionResolver(c: Context<RequestContext>) {
  return c.get('permissionResolver');
}

export function requirePermissionCheck(
  c: Context<RequestContext>,
): PermissionCheck {
  const check = getPermissionCheck(c);
  if (!check) {
    throw new Error(
      'Permissions not loaded. Export resolvePermissions from app/providers/app-service-provider.ts and use requireSession().',
    );
  }
  return check;
}

export function setPermissions(
  c: Context<RequestContext>,
  context: PermissionContext,
): PermissionCheck {
  const check = createPermissionCheck(context);
  c.set('permissionContext', context);
  c.set('permissionCheck', check);
  return check;
}
