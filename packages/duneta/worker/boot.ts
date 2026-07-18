import type { Hono } from 'hono';
import { createAuth } from '../auth/index.js';
import { createHttpApp } from '../http/create-app.js';
import { createCaches, defaultCache, type Cache } from '../http/cache/index.js';
import { createControllerContainer } from '../http/container/controller-container.js';
import { createRepositoryContainer } from '../http/container/repository-container.js';
import { createDatabases } from '../http/database/index.js';
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
import type { Database } from '../http/database/types.js';

let cachedRuntime: RuntimeServices | undefined;
let cachedAppKey: string | undefined;

function appCacheKey(config: DunetaServerConfig): string {
  const bindings = Object.values(config.database.connections)
    .map((c) => (c as { hyperdrive?: string } | undefined)?.hyperdrive)
    .filter(Boolean)
    .sort()
    .join(',');
  return `${bindings}:${config.auth?.secret ?? ''}`;
}

async function endPool(db: Database | null | undefined) {
  const pool = (db as { $client?: { end?: () => Promise<void> } } | null | undefined)?.$client;
  if (pool?.end) await pool.end().catch(() => {});
}

export async function disposeRuntime() {
  const runtime = cachedRuntime;
  cachedRuntime = undefined;
  cachedAppKey = undefined;
  if (!runtime) return;
  const seen = new Set<object>();
  for (const db of Object.values(runtime.databases)) {
    if (!db || seen.has(db)) continue;
    seen.add(db);
    await endPool(db);
  }
}

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

export async function loadRuntimeServices(options: ServerOptions): Promise<RuntimeServices> {
  const handlers: ResolvedServerHandlers = await resolveServerHandlers(options);

  if (handlers.resolvePermissions) {
    registerPermissionResolver(handlers.resolvePermissions);
  }

  const config = getConfig();
  const cacheKey = appCacheKey(config);

  if (cachedRuntime && cachedAppKey === cacheKey) return cachedRuntime;
  if (cachedRuntime) await disposeRuntime();

  const controllers = createControllerContainer();
  const repositories = createRepositoryContainer();
  const databases = createDatabases(config);
  const db = databases[config.database.default] ?? null;
  BaseRepository.bindDb(db);

  const caches = createCaches(config.cache);
  const cache = defaultCache(config.cache, caches);
  const auth = createAuth(config, db, caches);

  handlers.registerServices({ controllers, repositories, db, databases, config });

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
  cachedAppKey = cacheKey;
  return cachedRuntime;
}

export async function loadApp(options: ServerOptions) {
  return (await loadRuntimeServices(options)).app;
}
