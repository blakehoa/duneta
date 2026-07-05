import type { Hono } from 'hono';
import { createAuth } from '../auth/index.js';
import { createHttpApp } from '../http/create-app.js';
import { createCache } from '../http/cache/index.js';
import { connectionUrl } from '../config/server/database.js';
import { createControllerContainer } from '../http/container/controller-container.js';
import { createRepositoryContainer } from '../http/container/repository-container.js';
import { createDatabase } from '../http/database/index.js';
import { BaseRepository } from '../http/repositories/base-repository.js';
import { getConfig } from '../config/server/index.js';
import type { DunetaServerConfig } from '../config/server/types.js';
import type { RequestContext } from '../middleware/http/request-context.js';
import { registerPermissionResolver } from '../permission/context.js';
import {
  resolveServerHandlers,
  type ResolvedServerHandlers,
  type ServerOptions,
} from './types.js';
import type { RegisterCronJobs } from '../http/cron/index.js';

let cachedRuntime: RuntimeServices | undefined;
let cachedAppKey: string | undefined;

function appCacheKey(config: DunetaServerConfig): string {
  return `${connectionUrl(config.database) ?? ''}:${config.auth?.secret ?? ''}`;
}

export type RuntimeServices = {
  app: Hono<RequestContext>;
  config: DunetaServerConfig;
  db: ReturnType<typeof createDatabase>;
  auth: ReturnType<typeof createAuth>;
  cache: ReturnType<typeof createCache>;
  controllers: ReturnType<typeof createControllerContainer>;
  repositories: ReturnType<typeof createRepositoryContainer>;
  registerCron?: RegisterCronJobs;
};

export async function loadRuntimeServices(options: ServerOptions): Promise<RuntimeServices> {
  const handlers: ResolvedServerHandlers = await resolveServerHandlers(options);

  if (handlers.resolvePermissions) {
    registerPermissionResolver(handlers.resolvePermissions);
  }

  const config = getConfig();
  const cacheKey = appCacheKey(config);

  if (cachedRuntime && cachedAppKey === cacheKey) return cachedRuntime;

  const controllers = createControllerContainer();
  const repositories = createRepositoryContainer();
  const db = createDatabase(config);
  BaseRepository.bindDb(db);
  const auth = createAuth(config, db);

  handlers.registerServices({ controllers, repositories, db, config });

  const cache = createCache(config.cache);
  const router = await handlers.createApiRouter(config);

  const app = createHttpApp({
    router,
    config,
    db,
    auth,
    cache,
    controllers,
    repositories,
  });
  cachedRuntime = {
    app,
    config,
    db,
    auth,
    cache,
    controllers,
    repositories,
    registerCron: handlers.registerCron,
  };
  cachedAppKey = cacheKey;

  return cachedRuntime;
}

export async function loadApp(options: ServerOptions) {
  return (await loadRuntimeServices(options)).app;
}
