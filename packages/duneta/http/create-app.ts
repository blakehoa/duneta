import { Hono } from 'hono';
import type { Auth } from '../auth/types.js';
import { setGlobalCache } from './cache/facade.js';
import { resolveCache, type Cache } from './cache/index.js';
import {
  isCsrfEnabled,
  isCacheEnabled,
  isLoggingEnabled,
  isRateLimitEnabled,
} from '../config/server/features.js';
import type { DunetaServerConfig } from '../config/server/types.js';
import {
  activeRateLimitRules,
  requiresRateLimitStore,
} from '../config/server/rate-limit.js';
import type { ControllerContainer } from './container/controller-container.js';
import type { RepositoryContainer } from './container/repository-container.js';
import { createLogger } from './logging/index.js';
import {
  createCoreMiddleware,
  createCorsMiddleware,
  createCsrfMiddleware,
  createErrorHandler,
  createRateLimitMiddleware,
  type RequestContext,
} from '../middleware/http/index.js';
import { attachRequestServices } from './attach-request-services.js';
import type { PermissionResolver } from '../permission/types.js';

export type CreateHttpAppOptions = {
  router: Hono<RequestContext>;
  config: DunetaServerConfig;
  auth: Auth | null;
  cache: Cache;
  caches?: Record<string, Cache>;
  controllers: ControllerContainer;
  repositories: RepositoryContainer;
  permissionResolver?: PermissionResolver;
};

export function createHttpApp({
  router,
  config,
  auth,
  cache,
  caches = {},
  controllers,
  repositories,
  permissionResolver,
}: CreateHttpAppOptions) {
  const app = new Hono<RequestContext>().basePath('/api');

  app.use('*', createCorsMiddleware(config.security.cors));
  app.use('*', createCoreMiddleware(config));

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

  const rateLimitEnabled = isRateLimitEnabled(config);
  const rateLimitRules = rateLimitEnabled
    ? activeRateLimitRules(config.security.rateLimit)
    : [];
  const hasPostAuthRateLimit = rateLimitRules.some(
    (rule) => rule.key === 'user' || rule.key === 'ip+user',
  );
  const hasPreAuthRateLimit = rateLimitRules.some(
    (rule) => rule.key !== 'user' && rule.key !== 'ip+user',
  );
  const rateLimitCache = rateLimitEnabled
    ? isCacheEnabled(config)
      ? resolveCache(caches, config.security.rateLimit.store, cache)
      : null
    : null;

  if (rateLimitEnabled) {
    if (
      config.app.env === 'production' &&
      requiresRateLimitStore(config.security.rateLimit) &&
      (!rateLimitCache || rateLimitCache.driver === 'memory')
    ) {
      throw new Error(
        '[duneta] production rate limiting requires a distributed cache store (Redis HTTP or custom).',
      );
    }
    if (hasPreAuthRateLimit) {
      app.use(
        '*',
        createRateLimitMiddleware(
          config.security.rateLimit,
          rateLimitCache,
          'pre-auth',
        ),
      );
    }
  }

  if (isCsrfEnabled(config)) {
    app.use('*', createCsrfMiddleware(config));
  } else if (config.security?.csrf?.enabled === true) {
    throw new Error(
      '[duneta] security.csrf.enabled requires CSRF_SECRET (wrangler secret put CSRF_SECRET)',
    );
  }

  app.onError(createErrorHandler(config));

  setGlobalCache(cache, caches);

  attachRequestServices(app, config, {
    auth,
    cache,
    controllers,
    repositories,
    permissionResolver,
  });

  if (hasPostAuthRateLimit) {
    app.use(
      '*',
      createRateLimitMiddleware(
        config.security.rateLimit,
        rateLimitCache,
        'post-auth',
      ),
    );
  }

  app.route('/', router);
  return app;
}
