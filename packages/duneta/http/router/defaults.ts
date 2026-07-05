import type { MiddlewareHandler } from 'hono';
import { resolveController } from '../resolve-controller.js';
import { requireSession } from '../../middleware/http/session.js';
import { defineGroup } from './define.js';

export const healthRoutes = defineGroup({
  path: '/health',
  endpoints: [{ method: 'GET', handler: resolveController('HealthController', 'show') }],
});

export const meRoutes = defineGroup({
  path: '/me',
  endpoints: [{ method: 'GET', handler: resolveController('MeController', 'show') }],
});

export function createUsersRoutes(middleware: MiddlewareHandler[] = [requireSession()]) {
  return defineGroup({
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
  return defineGroup({
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

export { composeRouter, defineGroup, type RouteGroup } from './define.js';
