import type { Hono as HonoType } from 'hono';
import type { DunetaServerConfig } from '../config/server/types.js';
import type { RequestContext } from '../middleware/http/request-context.js';
import {
  composeRouter,
  createUsersRoutes,
  healthRoutes,
  meRoutes,
  type RouteGroup,
} from '../http/router/index.js';

/** API routes module from `routes/api.ts` (Hono `/api`). */
export type DunetaApiRoutes = {
  api?:
    | RouteGroup[]
    | HonoType<RequestContext>
    | ((
        config: DunetaServerConfig,
      ) =>
        | RouteGroup[]
        | HonoType<RequestContext>
        | Promise<RouteGroup[] | HonoType<RequestContext>>);
};

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

export function defaultApiRoutes(): RouteGroup[] {
  return [healthRoutes, meRoutes, createUsersRoutes()];
}

async function resolveApi(
  routes: DunetaApiRoutes,
  config: DunetaServerConfig,
): Promise<RouteGroup[] | HonoType<RequestContext>> {
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
  return composeRouter([...defaultApiRoutes(), ...api]);
}
