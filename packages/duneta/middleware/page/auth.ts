import { matchesAnyDunetaPath } from './path.js';
import type {
  DunetaPageMiddleware,
  DunetaPageMiddlewareContext,
  DunetaPathMatcher,
} from './types.js';

export type AuthRedirectMiddlewareOptions = {
  isAuthenticated: (context: DunetaPageMiddlewareContext) => boolean | Promise<boolean>;
  loginPath?: string;
  publicPaths?: DunetaPathMatcher[];
  redirectParam?: string;
  status?: 302 | 303 | 307;
};

export function createAuthRedirectMiddleware({
  isAuthenticated,
  loginPath = '/login',
  publicPaths = [loginPath],
  redirectParam = 'redirect',
  status = 302,
}: AuthRedirectMiddlewareOptions): DunetaPageMiddleware {
  return async (context, next) => {
    if (matchesAnyDunetaPath(publicPaths, context.url.pathname, context)) {
      return next();
    }

    if (await isAuthenticated(context)) return next();

    const url = new URL(loginPath, context.url);
    url.searchParams.set(redirectParam, `${context.url.pathname}${context.url.search}`);

    return new Response(null, {
      status,
      headers: {
        Location: `${url.pathname}${url.search}`,
      },
    });
  };
}
