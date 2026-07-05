import { ForbiddenError } from './errors.js';
import type { Permission, PermissionCheck, PermissionContext, PolicySubject } from './types.js';

type Parsed = { resource: string; action: string; scope?: string };

function parse(permission: Permission): Parsed {
  const [base, scope] = permission.includes(':')
    ? (permission.split(':') as [string, string])
    : [permission, undefined];

  if (base === '*') return { resource: '*', action: '*', scope };
  if (base.endsWith('.*')) return { resource: base.slice(0, -2), action: '*', scope };

  const dot = base.lastIndexOf('.');
  if (dot === -1) return { resource: base, action: '*', scope };

  return { resource: base.slice(0, dot), action: base.slice(dot + 1), scope };
}

function resourceMatches(granted: Parsed, required: Parsed) {
  if (granted.resource === '*') return true;
  if (granted.resource !== required.resource) return false;
  if (granted.action === '*') return true;
  return granted.action === required.action;
}

function scopeAllows(
  grantedScope: string | undefined,
  requiredScope: string | undefined,
  context: PermissionContext,
  subject?: PolicySubject,
) {
  const scope = grantedScope ?? requiredScope;
  if (!scope) return true;
  if (scope !== 'self') return true;
  if (!subject) return false;
  return (subject.ownerId ?? subject.id) === context.userId;
}

function matches(
  granted: Permission,
  required: Permission,
  context: PermissionContext,
  subject?: PolicySubject,
) {
  const g = parse(granted);
  const r = parse(required);
  if (!resourceMatches(g, r)) return false;
  if (!g.scope && !r.scope) return true;
  return scopeAllows(g.scope, r.scope, context, subject);
}

export function createPermissionCheck(context: PermissionContext): PermissionCheck {
  const can = (permission: Permission, subject?: PolicySubject) => {
    if (context.grants.includes('*')) return true;
    return context.grants.some((grant) => matches(grant, permission, context, subject));
  };

  return {
    context,
    can,
    assert(permission, subject) {
      if (!can(permission, subject)) throw new ForbiddenError();
    },
  };
}
