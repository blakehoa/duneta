import { createMiddleware } from 'hono/factory';
import type { Hono } from 'hono';
import type { Auth } from '../auth/types.js';
import type { Cache } from './cache/index.js';
import {
  isAuthEnabled,
  isCacheEnabled,
  isLoggingEnabled,
  resolveAuthMountPath,
} from '../config/server/features.js';
import type { DunetaServerConfig } from '../config/server/types.js';
import type { ControllerContainer } from './container/controller-container.js';
import type { RepositoryContainer } from './container/repository-container.js';
import type { Database } from './database/types.js';
import { createLogger } from './logging/index.js';
import type { RequestContext } from '../middleware/http/request-context.js';

export type AttachRequestServicesOptions = {
  db: Database | null;
  auth: Auth | null;
  cache: Cache;
  controllers: ControllerContainer;
  repositories: RepositoryContainer;
};

/** Attach db, auth, cache, and DI containers to each request. */
export function attachRequestServices(
  app: Hono<RequestContext>,
  config: DunetaServerConfig,
  { db, auth, cache, controllers, repositories }: AttachRequestServicesOptions,
) {
  app.use('*', createMiddleware(async (c, next) => {
    c.set('controllers', controllers);
    c.set('repositories', repositories);
    await next();
  }));

  if (db) {
    app.use('*', createMiddleware(async (c, next) => {
      c.set('db', db);
      await next();
    }));
  }

  if (isAuthEnabled(config) && auth) {
    const authPath = resolveAuthMountPath(config.auth.basePath);

    app.use('*', createMiddleware(async (c, next) => {
      c.set('auth', auth);
      await next();
    }));

    app.all(`${authPath}/*`, (c) => auth.handler(c.req.raw));
  }

  if (isCacheEnabled(config)) {
    app.use('*', createMiddleware(async (c, next) => {
      c.set('cache', cache);
      await next();
    }));
  }

  if (isLoggingEnabled(config)) {
    const logger = createLogger(config);
    app.use('*', async (c, next) => {
      const start = Date.now();
      await next();
      logger.request({
        requestId: c.get('requestId'),
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        durationMs: Date.now() - start,
      });
    });
  }
}
