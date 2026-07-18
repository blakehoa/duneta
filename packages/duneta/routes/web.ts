import { matchesAnyDunetaPath } from '../middleware/page/path.js';
import type {
  DunetaPageMiddleware,
  DunetaPageMiddlewareContext,
  DunetaPathMatcher,
} from '../middleware/page/types.js';

export type WebRoute<TLoadContext = unknown> = {
  path: DunetaPathMatcher;
  middleware?:
    | DunetaPageMiddleware<TLoadContext>
    | DunetaPageMiddleware<TLoadContext>[];
  layout?: string;
  page?: string;
  children?: WebRoute<TLoadContext>[];
};

export type WebRouter<TLoadContext = unknown> = {
  routes: WebRoute<TLoadContext>[];
};

export type WebRoutes<TLoadContext = unknown> = {
  pages?: WebRoute<TLoadContext>[];
};

/** Web routes module from `routes/web.ts` (page middleware + React Router manifest). */
export type DunetaWebRoutes<TLoadContext = unknown> = WebRoutes<TLoadContext>;

export function WebRoute<TLoadContext = unknown>(
  route: WebRoute<TLoadContext>,
): WebRoute<TLoadContext> {
  return route;
}

// eslint-disable-next-line @typescript-eslint/no-namespace -- public type/value API: WebRoute.define + WebRoute.Config
export namespace WebRoute {
  export type Definition<TLoadContext = unknown> = WebRoute<TLoadContext>;
  export type Router<TLoadContext = unknown> = WebRouter<TLoadContext>;
  export type Config<TLoadContext = unknown> = WebRoutes<TLoadContext>;

  export function define<TLoadContext = unknown>(
    route: WebRoute<TLoadContext>,
  ): WebRoute<TLoadContext> {
    return route;
  }

  export function defineMany<TLoadContext = unknown>(
    routes: WebRoute<TLoadContext>[],
  ): WebRoute<TLoadContext>[] {
    return routes;
  }

  export function compose<TLoadContext = unknown>(
    routes: WebRoute<TLoadContext>[],
  ): WebRouter<TLoadContext> {
    return composeWebRoutes(routes);
  }
}

export function composeWebRoutes<TLoadContext = unknown>(
  routes: WebRoute<TLoadContext>[],
): WebRouter<TLoadContext> {
  return { routes };
}

/** Build a page router from `routes/web.ts` page definitions. */
export function buildWebRouter<TLoadContext = unknown>(
  routes: WebRoute<TLoadContext>[],
): WebRouter<TLoadContext> {
  return composeWebRoutes(routes);
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function joinRoutePath(
  parentPath: string,
  childPath: DunetaPathMatcher,
): DunetaPathMatcher {
  if (typeof childPath !== 'string') return childPath;
  if (!parentPath || childPath.startsWith('/')) return childPath;
  return `${parentPath.replace(/\/$/, '')}/${childPath.replace(/^\//, '')}`;
}

export function collectWebRouteMiddlewares<TLoadContext = unknown>(
  routes: WebRoute<TLoadContext>[] | WebRouter<TLoadContext>,
  context: DunetaPageMiddlewareContext<TLoadContext>,
): DunetaPageMiddleware<TLoadContext>[] {
  const routeList = Array.isArray(routes) ? routes : routes.routes;
  const middlewares: DunetaPageMiddleware<TLoadContext>[] = [];

  function visit(route: WebRoute<TLoadContext>, parentPath = '') {
    const routePath = joinRoutePath(parentPath, route.path);
    if (!matchesAnyDunetaPath([routePath], context.url.pathname, context))
      return;

    middlewares.push(...toArray(route.middleware));

    for (const child of route.children ?? []) {
      visit(child, typeof routePath === 'string' ? routePath : parentPath);
    }
  }

  for (const route of routeList) visit(route);

  return middlewares;
}
