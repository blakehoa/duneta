import type { Context } from 'hono';
import type { RequestContext } from '../middleware/http/request-context.js';

/** e.g. `users.read`, `users.read:self`, `posts.*`, `*` */
export type Permission = string;

export type PolicySubject = {
  type: string;
  id?: string;
  ownerId?: string;
  [key: string]: unknown;
};

/** Resolved grants for the current user (per request). */
export type PermissionContext = {
  userId: string;
  grants: readonly Permission[];
  roles?: readonly string[];
  meta?: Record<string, unknown>;
};

export type PermissionCheck = {
  readonly context: PermissionContext;
  can(permission: Permission, subject?: PolicySubject): boolean;
  assert(permission: Permission, subject?: PolicySubject): void;
};

export type PermissionResolverInput = {
  c: Context<RequestContext>;
  userId: string;
};

export type PermissionResolver = (
  input: PermissionResolverInput,
) => Promise<PermissionContext | null> | PermissionContext | null;
