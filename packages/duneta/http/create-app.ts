import { Hono } from 'hono';
import type { Auth } from '../auth/types.js';
import { setGlobalCache } from './cache/facade.js';
import type { Cache } from './cache/index.js';
import { isCsrfEnabled, isCacheEnabled, isRateLimitEnabled } from '../config/server/features.js';
import type { DunetaServerConfig } from '../config/server/types.js';
import type { ControllerContainer } from './container/controller-container.js';
import type { RepositoryContainer } from './container/repository-container.js';
import type { Database } from './database/types.js';
import {
  createContextDefaultsMiddleware,
  createCoreMiddleware,
  createCorsMiddleware,
  createCsrfMiddleware,
  createErrorHandler,
  createRateLimitMiddleware,
  type RequestContext,
} from '../middleware/http/index.js';
import { attachRequestServices } from './attach-request-services.js';

export type CreateHttpAppOptions = {
  router: Hono<RequestContext>;
  config: DunetaServerConfig;
  db: Database | null;
  auth: Auth | null;
  cache: Cache;
  controllers: ControllerContainer;
  repositories: RepositoryContainer;
};

export function createHttpApp({
  router,
  config,
  db,
  auth,
  cache,
  controllers,
  repositories,
}: CreateHttpAppOptions) {
  const app = new Hono<RequestContext>().basePath('/api');

  app.use('*', createCorsMiddleware());
  app.use('*', createContextDefaultsMiddleware(config));
  app.use('*', createCoreMiddleware(config));

  if (isRateLimitEnabled(config)) {
    app.use('*', createRateLimitMiddleware(config.security.rateLimit, isCacheEnabled(config) ? cache : null));
  }

  if (isCsrfEnabled(config)) {
    app.use('*', createCsrfMiddleware(config));
  } else if (config.security?.csrf?.enabled === true) {
    throw new Error('[duneta] security.csrf.enabled requires CSRF_SECRET (wrangler secret put CSRF_SECRET)');
  }

  app.onError(createErrorHandler(config));

  setGlobalCache(cache);

  attachRequestServices(app, config, { db, auth, cache, controllers, repositories });

  app.route('/', router);
  return app;
}
