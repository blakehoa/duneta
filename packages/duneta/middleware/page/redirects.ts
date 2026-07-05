import type { DunetaPageMiddleware } from './types.js';

export type TrailingSlashMode = 'append' | 'remove';

export type TrailingSlashMiddlewareOptions = {
  mode?: TrailingSlashMode;
  status?: 301 | 302 | 307 | 308;
  ignore?: RegExp;
};

function createRedirect(location: string, status: number) {
  return new Response(null, {
    status,
    headers: {
      Location: location,
    },
  });
}

export function createTrailingSlashMiddleware({
  mode = 'remove',
  status = 308,
  ignore = /\.[^/]+$/,
}: TrailingSlashMiddlewareOptions = {}): DunetaPageMiddleware {
  return (context, next) => {
    const { pathname } = context.url;
    if (pathname === '/' || ignore.test(pathname)) return next();

    const hasSlash = pathname.endsWith('/');
    if ((mode === 'remove' && !hasSlash) || (mode === 'append' && hasSlash)) {
      return next();
    }

    const url = new URL(context.url);
    url.pathname =
      mode === 'remove' ? pathname.replace(/\/+$/, '') : `${pathname}/`;

    return createRedirect(`${url.pathname}${url.search}`, status);
  };
}
