import type { Hono } from 'hono';
import { createAuth } from '../auth/index.js';
import { createHttpApp } from '../http/create-app.js';
import { createCaches, defaultCache, type Cache } from '../http/cache/index.js';
import { createControllerContainer } from '../http/container/controller-container.js';
import { createRepositoryContainer } from '../http/container/repository-container.js';
import { createDatabases } from '../http/database/index.js';
import { getConfig } from '../config/server/index.js';
import type { DunetaServerConfig } from '../config/server/types.js';
import type { RequestContext } from '../middleware/http/request-context.js';
import {
  resolveServerHandlers,
  type ResolvedServerHandlers,
  type ServerOptions,
} from './types.js';
import type { RegisterCronJobs } from '../http/cron/index.js';
import type { Database } from '../http/database/types.js';

let cachedRuntime: RuntimeServices | undefined;
let runtimeLoad: Promise<RuntimeServices> | undefined;

export type RuntimeServices = {
  app: Hono<RequestContext>;
  config: DunetaServerConfig;
  db: Database | null;
  databases: Record<string, Database>;
  auth: ReturnType<typeof createAuth>;
  cache: Cache;
  caches: Record<string, Cache>;
  controllers: ReturnType<typeof createControllerContainer>;
  repositories: ReturnType<typeof createRepositoryContainer>;
  registerCron?: RegisterCronJobs;
};

async function createRuntimeServices(
  options: ServerOptions,
): Promise<RuntimeServices> {
  const handlers: ResolvedServerHandlers = await resolveServerHandlers(options);

  const config = getConfig();

  const controllers = createControllerContainer();
  const repositories = createRepositoryContainer();
  const databases = createDatabases(config);
  const db = databases[config.database.default] ?? null;
  const caches = createCaches(config.cache);
  const cache = defaultCache(config.cache, caches);
  const auth = createAuth(config, db, caches);

  handlers.registerServices({
    controllers,
    repositories,
    db,
    databases,
    config,
  });

  const router = await handlers.createApiRouter(config);
  const app = createHttpApp({
    router,
    config,
    db,
    auth,
    cache,
    caches,
    controllers,
    repositories,
    permissionResolver: handlers.resolvePermissions,
  });

  cachedRuntime = {
    app,
    config,
    db,
    databases,
    auth,
    cache,
    caches,
    controllers,
    repositories,
    registerCron: handlers.registerCron,
  };
  return cachedRuntime;
}

export async function loadRuntimeServices(
  options: ServerOptions,
): Promise<RuntimeServices> {
  if (cachedRuntime) return cachedRuntime;
  if (!runtimeLoad) runtimeLoad = createRuntimeServices(options);

  try {
    return await runtimeLoad;
  } catch (error) {
    runtimeLoad = undefined;
    throw error;
  }
}

export async function loadApp(options: ServerOptions) {
  return (await loadRuntimeServices(options)).app;
}
