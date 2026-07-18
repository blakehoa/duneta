import { getCookie, setCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import type { Context } from 'hono';
import type { DunetaServerConfig } from '../../config/server/types.js';
import type { RequestContext } from './request-context.js';
import {
  createSignedRequestToken,
  isMutatingMethod,
  timingSafeEqual,
} from './utils.js';

function isExcludedPath(path: string, excludePaths: string[]) {
  return excludePaths.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

function apiPath(path: string) {
  const stripped = path.startsWith('/api') ? path.slice(4) || '/' : path;
  return stripped.startsWith('/') ? stripped : `/${stripped}`;
}

function issueCsrfCookie(
  c: Context<RequestContext>,
  config: DunetaServerConfig,
) {
  const { csrf } = config.security;
  const token = createSignedRequestToken(csrf.secret, csrf.tokenLength);

  setCookie(c, csrf.cookie, token, {
    httpOnly: false,
    secure: config.app.env === 'production',
    sameSite: 'Lax',
    path: '/',
    maxAge: Math.floor(csrf.expirationMs / 1000),
  });

  return token;
}

export function createCsrfMiddleware(config: DunetaServerConfig) {
  const { csrf } = config.security;

  return createMiddleware<RequestContext>(async (c, next) => {
    const path = apiPath(c.req.path);
    const isExcluded = isExcludedPath(path, csrf.excludePaths);
    const usesBearer = Boolean(
      c.req.header('Authorization')?.startsWith('Bearer '),
    );

    if (isExcluded || usesBearer) {
      await next();
      return;
    }

    const cookieToken = getCookie(c, csrf.cookie);

    if (!isMutatingMethod(c.req.method)) {
      if (!cookieToken) issueCsrfCookie(c, config);
      await next();
      return;
    }

    const headerToken = c.req.header(csrf.header);
    if (
      !cookieToken ||
      !headerToken ||
      !timingSafeEqual(cookieToken, headerToken)
    ) {
      return c.json({ error: 'Invalid CSRF token' }, 403);
    }

    await next();
  });
}
