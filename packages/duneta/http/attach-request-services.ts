import { createMiddleware } from 'hono/factory';
import type { Context, Hono } from 'hono';
import type { Auth } from '../auth/types.js';
import type { Cache } from './cache/index.js';
import {
  isAuthEnabled,
  isCacheEnabled,
  isDatabaseEnabled,
  resolveAuthMountPath,
} from '../config/server/features.js';
import type { DunetaServerConfig } from '../config/server/types.js';
import type { ControllerContainer } from './container/controller-container.js';
import type { RepositoryContainer } from './container/repository-container.js';
import { createDatabaseScope } from './database/create-database.js';
import {
  runWithDatabaseScope,
  type InvocationDatabaseScope,
} from './database/invocation-context.js';
import type { RequestContext } from '../middleware/http/request-context.js';
import type { PermissionResolver } from '../permission/types.js';

export type AttachRequestServicesOptions = {
  auth: Auth | null;
  cache: Cache;
  controllers: ControllerContainer;
  repositories: RepositoryContainer;
  permissionResolver?: PermissionResolver;
};

/** Check whether an app-relative API path is the Better Auth mount or a child. */
function isAuthPath(path: string, authPath: string): boolean {
  const stripped = path.startsWith('/api') ? path.slice(4) || '/' : path;
  const normalized = stripped.startsWith('/') ? stripped : `/${stripped}`;
  return normalized === authPath || normalized.startsWith(`${authPath}/`);
}

type WaitUntil = (promise: Promise<unknown>) => void;

/**
 * Patch `executionCtx.waitUntil` so DB-backed background work keeps the scope
 * open. Returns the original `waitUntil` for teardown (must not re-enter retain).
 */
function retainWaitUntilDatabaseAccess(
  c: Context<RequestContext>,
  scope: InvocationDatabaseScope,
): WaitUntil | null {
  try {
    const executionCtx = c.executionCtx;
    const originalWaitUntil = executionCtx.waitUntil.bind(executionCtx);
    executionCtx.waitUntil = (promise: Promise<unknown>) => {
      scope.retain(promise);
      originalWaitUntil(promise);
    };
    return originalWaitUntil;
  } catch {
    console.warn(
      '[duneta] could not patch executionCtx.waitUntil; DB access inside waitUntil may fail after the response. Call scope.retain(promise) explicitly if needed.',
    );
    return null;
  }
}

/** Schedule edge-client teardown without retaining the close promise on the scope. */
async function closeDatabaseScope(
  c: Context<RequestContext>,
  scope: InvocationDatabaseScope,
  originalWaitUntil: WaitUntil | null,
): Promise<void> {
  const closing = scope.close();
  if (originalWaitUntil) {
    originalWaitUntil(closing);
    return;
  }
  try {
    c.executionCtx.waitUntil(closing);
  } catch {
    await closing;
  }
}

/** Attach auth, cache, and DI containers to each request. */
export function attachRequestServices(
  app: Hono<RequestContext>,
  config: DunetaServerConfig,
  {
    auth,
    cache,
    controllers,
    repositories,
    permissionResolver,
  }: AttachRequestServicesOptions,
) {
  const requestAuth = isAuthEnabled(config) ? auth : null;
  const requestCache = isCacheEnabled(config) ? cache : null;
  const authPath = requestAuth
    ? resolveAuthMountPath(config.auth.basePath)
    : null;

  app.use(
    '*',
    createMiddleware(async (c, next) => {
      c.set('controllers', controllers);
      c.set('repositories', repositories);
      if (permissionResolver) c.set('permissionResolver', permissionResolver);
      if (requestAuth) c.set('auth', requestAuth);
      if (requestCache) c.set('cache', requestCache);
      await next();
    }),
  );

  if (isDatabaseEnabled(config)) {
    app.use(
      '*',
      createMiddleware(async (c, next) => {
        const scope = createDatabaseScope(config, c.env);
        const originalWaitUntil = retainWaitUntilDatabaseAccess(c, scope);

        // Better Auth reaches the client through the boot facade
        // synchronously, so its connection must be open before the handler.
        if (authPath && isAuthPath(c.req.path, authPath)) {
          await scope.getOrOpen(scope.authName);
        }

        try {
          await runWithDatabaseScope(scope, next);
        } finally {
          await closeDatabaseScope(c, scope, originalWaitUntil);
        }
      }),
    );
  }

  if (requestAuth && authPath) {
    app.all(`${authPath}/*`, (c) => requestAuth.handler(c.req.raw));
  }
}
