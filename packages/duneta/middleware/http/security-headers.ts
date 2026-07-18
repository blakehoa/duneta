import { createMiddleware } from 'hono/factory';
import type { Context } from 'hono';
import type { DunetaServerConfig } from '../../config/server/types.js';
import type { RequestContext } from './request-context.js';

export function applySecurityHeaders(
  c: Context<RequestContext>,
  config: DunetaServerConfig,
) {
  const headers = config.headers;
  c.header('X-Frame-Options', headers.frameOptions);

  if (headers.contentTypeOptions) {
    c.header('X-Content-Type-Options', 'nosniff');
  }

  c.header('Referrer-Policy', headers.referrerPolicy);
  c.header('Permissions-Policy', headers.permissionsPolicy);
}

export function createSecurityHeadersMiddleware(config: DunetaServerConfig) {
  return createMiddleware<RequestContext>(async (c, next) => {
    applySecurityHeaders(c, config);
    await next();
  });
}
