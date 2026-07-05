import { Hono } from 'hono';
import type { Hono as HonoType } from 'hono';
import type { PermissionResolver } from '../permission/types.js';
import type { DunetaServerConfig } from '../config/server/index.js';
import type { RegisterServices } from '../http/container/index.js';
import type { RegisterCronJobs } from '../http/cron/index.js';
import type { RequestContext } from '../middleware/http/request-context.js';
import {
  buildApiRouter,
  normalizeRoutes,
  type DunetaRoutesModule,
} from '../routes/index.js';

export type ModuleLoader<T = unknown> = () => Promise<T>;

/**
 * Path strings (project-root relative). The Duneta Vite plugin rewrites these to
 * `() => import(...)` loaders. Omit a key to use the default path when the file exists.
 *
 * Defaults:
 * - routes: `./routes/api`
 * - services: `./app/providers/app-service-provider`
 * - cron: `./routes/console`
 * - permissions: `./app/providers/app-service-provider`
 *
 * Server config is always `./config/server.ts` (or `.js`) at the project root.
 */
export type DunetaWorkerOptions = {
  routes?: string;
  services?: string;
  cron?: string;
  permissions?: string;
};

/** Runtime options after the Vite plugin rewrite. */
export type ServerOptions = {
  routes?: ModuleLoader<DunetaRoutesModule>;
  services?: ModuleLoader<Record<string, unknown>>;
  cron?: ModuleLoader<Record<string, unknown>>;
  permissions?: ModuleLoader<Record<string, unknown>>;
};

export type ResolvedServerHandlers = {
  createApiRouter: (config: DunetaServerConfig) => Promise<HonoType<RequestContext>>;
  registerServices: RegisterServices;
  registerCron?: RegisterCronJobs;
  resolvePermissions?: PermissionResolver;
};

const noopRegisterServices: RegisterServices = () => {};

function emptyApiRouter(): HonoType<RequestContext> {
  return new Hono<RequestContext>();
}

function pickExport<T>(mod: Record<string, unknown>, names: string[]): T | undefined {
  for (const name of names) {
    const value = mod[name];
    if (typeof value === 'function') return value as T;
  }
  if (typeof mod.default === 'function') return mod.default as T;
  return undefined;
}

export async function resolveServerHandlers(options: ServerOptions): Promise<ResolvedServerHandlers> {
  const servicesMod = options.services ? await options.services() : undefined;
  const cronMod = options.cron ? await options.cron() : undefined;
  const permissionsMod = options.permissions ? await options.permissions() : undefined;

  const registerServices =
    pickExport<RegisterServices>(servicesMod ?? {}, ['registerServices']) ?? noopRegisterServices;

  const registerCron = pickExport<RegisterCronJobs>(cronMod ?? {}, ['registerCron']);

  const resolvePermissions = pickExport<PermissionResolver>(permissionsMod ?? {}, [
    'resolvePermissions',
  ]);

  const createApiRouter = async (config: DunetaServerConfig) => {
    if (!options.routes) return emptyApiRouter();
    return buildApiRouter(normalizeRoutes(await options.routes()), config);
  };

  return {
    createApiRouter,
    registerServices,
    registerCron,
    resolvePermissions,
  };
}
