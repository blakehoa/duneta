import { Hono } from 'hono';
import type { Handler, MiddlewareHandler } from 'hono';
import type { RequestContext } from '../../middleware/http/request-context.js';

type Endpoint = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path?: string;
  handler: Handler<RequestContext>;
};

export type RouteGroup = {
  path: string;
  middleware?: MiddlewareHandler<RequestContext>[];
  endpoints?: Endpoint[];
  children?: RouteGroup[];
};

export function defineGroup(group: RouteGroup): RouteGroup {
  return group;
}

function normalizePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}

function mountGroup(group: RouteGroup) {
  const router = new Hono<RequestContext>();

  if (group.middleware?.length) router.use('*', ...group.middleware);

  for (const endpoint of group.endpoints ?? []) {
    router.on(endpoint.method, endpoint.path ?? '/', endpoint.handler);
  }

  for (const child of group.children ?? []) {
    router.route(normalizePath(child.path), mountGroup(child));
  }

  return router;
}

export function composeRouter(groups: RouteGroup[]) {
  const router = new Hono<RequestContext>();
  for (const group of groups) router.route(normalizePath(group.path), mountGroup(group));
  return router;
}
