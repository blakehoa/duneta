import { matchesAnyDunetaPath } from './path.js';
import type {
  DunetaPageMiddleware,
  DunetaPageMiddlewareContext,
  DunetaPageRouter,
  DunetaPageRoute,
  DunetaPathMatcher,
} from './types.js';

export function definePageRoute<TLoadContext = unknown>(
  route: DunetaPageRoute<TLoadContext>,
) {
  return route;
}

export function definePageRoutes<TLoadContext = unknown>(routes: DunetaPageRoute<TLoadContext>[]) {
  return routes;
}

export function composePageRouter<TLoadContext = unknown>(
  routes: DunetaPageRoute<TLoadContext>[],
): DunetaPageRouter<TLoadContext> {
  return { routes };
}

export function createPageRouter<TLoadContext = unknown>(
  routes: DunetaPageRoute<TLoadContext>[],
) {
  return composePageRouter(routes);
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function joinRoutePath(parentPath: string, childPath: DunetaPathMatcher): DunetaPathMatcher {
  if (typeof childPath !== 'string') return childPath;
  if (!parentPath || childPath.startsWith('/')) return childPath;
  return `${parentPath.replace(/\/$/, '')}/${childPath.replace(/^\//, '')}`;
}

export function collectPageRouteMiddlewares<TLoadContext = unknown>(
  routes: DunetaPageRoute<TLoadContext>[] | DunetaPageRouter<TLoadContext>,
  context: DunetaPageMiddlewareContext<TLoadContext>,
): DunetaPageMiddleware<TLoadContext>[] {
  const routeList = Array.isArray(routes) ? routes : routes.routes;
  const middlewares: DunetaPageMiddleware<TLoadContext>[] = [];

  function visit(route: DunetaPageRoute<TLoadContext>, parentPath = '') {
    const routePath = joinRoutePath(parentPath, route.path);
    if (!matchesAnyDunetaPath([routePath], context.url.pathname, context)) return;

    middlewares.push(...toArray(route.middleware));

    for (const child of route.children ?? []) {
      visit(child, typeof routePath === 'string' ? routePath : parentPath);
    }
  }

  for (const route of routeList) visit(route);

  return middlewares;
}
