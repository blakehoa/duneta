import { Hono } from 'hono';
import type { Hono as HonoType } from 'hono';
import type { Handler, MiddlewareHandler } from 'hono';
import type { DunetaServerConfig } from '../config/server/types.js';
import { resolveController } from '../http/resolve-controller.js';
import { requireSession } from '../middleware/http/session.js';
import type { RequestContext } from '../middleware/http/request-context.js';

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiEndpoint = {
  method: ApiMethod;
  path?: string;
  handler: Handler<RequestContext>;
};

export type ApiRoute = {
  path: string;
  middleware?: MiddlewareHandler<RequestContext>[];
  endpoints?: ApiEndpoint[];
  children?: ApiRoute[];
};

export function ApiRoute(route: ApiRoute): ApiRoute {
  return route;
}

export namespace ApiRoute {
  export type Definition = ApiRoute;
  export type Endpoint = ApiEndpoint;
  export type Config = {
    api?:
      | ApiRoute[]
      | HonoType<RequestContext>
      | ((
          config: DunetaServerConfig,
        ) => ApiRoute[] | HonoType<RequestContext> | Promise<ApiRoute[] | HonoType<RequestContext>>);
  };

  export function define(route: ApiRoute): ApiRoute {
    return route;
  }

  export function defineMany(routes: ApiRoute[]): ApiRoute[] {
    return routes;
  }

  export function compose(routes: ApiRoute[]) {
    return composeApiRoutes(routes);
  }
}

function normalizePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}

function mountApiRoute(route: ApiRoute) {
  const router = new Hono<RequestContext>();

  if (route.middleware?.length) router.use('*', ...route.middleware);

  for (const endpoint of route.endpoints ?? []) {
    router.on(endpoint.method, endpoint.path ?? '/', endpoint.handler);
  }

  for (const child of route.children ?? []) {
    router.route(normalizePath(child.path), mountApiRoute(child));
  }

  return router;
}

export function composeApiRoutes(routes: ApiRoute[]) {
  const router = new Hono<RequestContext>();
  for (const route of routes) router.route(normalizePath(route.path), mountApiRoute(route));
  return router;
}

/** API routes module from `routes/api.ts` (Hono `/api`). */
export type DunetaApiRoutes = ApiRoute.Config;

export type DunetaRoutesModule = DunetaApiRoutes | { default: DunetaApiRoutes };

export function normalizeRoutes(mod: DunetaRoutesModule): DunetaApiRoutes {
  if (mod && typeof mod === 'object' && 'default' in mod && mod.default) {
    return mod.default;
  }
  return mod as DunetaApiRoutes;
}

function isHono(value: unknown): value is HonoType<RequestContext> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    typeof (value as HonoType<RequestContext>).fetch === 'function' &&
    typeof (value as HonoType<RequestContext>).route === 'function'
  );
}

export function defaultApiRoutes(): ApiRoute[] {
  return [healthRoutes, meRoutes, createUsersRoutes()];
}

async function resolveApi(
  routes: DunetaApiRoutes,
  config: DunetaServerConfig,
): Promise<ApiRoute[] | HonoType<RequestContext>> {
  if (!routes.api) return [];
  if (typeof routes.api === 'function') return routes.api(config);
  return routes.api;
}

/** Build the Hono `/api` router from `routes/api.ts`. */
export async function buildApiRouter(
  routes: DunetaApiRoutes,
  config: DunetaServerConfig,
): Promise<HonoType<RequestContext>> {
  const api = await resolveApi(routes, config);
  if (isHono(api)) return api;
  return composeApiRoutes([...defaultApiRoutes(), ...api]);
}

export const healthRoutes = ApiRoute({
  path: '/health',
  endpoints: [{ method: 'GET', handler: resolveController('HealthController', 'show') }],
});

export const meRoutes = ApiRoute({
  path: '/me',
  endpoints: [{ method: 'GET', handler: resolveController('MeController', 'show') }],
});

export function createUsersRoutes(middleware: MiddlewareHandler[] = [requireSession()]) {
  return ApiRoute({
    path: '/users',
    middleware,
    endpoints: [
      { method: 'GET', handler: resolveController('UserController', 'index') },
      { method: 'GET', path: '/:id', handler: resolveController('UserController', 'show') },
    ],
  });
}

/** Default storage HTTP routes — requires `StorageController` in DI. */
export function createStorageRoutes(
  controllerKey = 'StorageController',
  middleware: MiddlewareHandler[] = [requireSession()],
) {
  return ApiRoute({
    path: '/storage',
    middleware,
    endpoints: [
      { method: 'POST', handler: resolveController(controllerKey, 'store') },
      { method: 'GET', path: '/meta', handler: resolveController(controllerKey, 'head') },
      { method: 'DELETE', path: '/objects', handler: resolveController(controllerKey, 'destroy') },
    ],
  });
}

export const usersRoutes = createUsersRoutes();
