import { createMiddleware } from 'hono/factory';
import type { Context } from 'hono';
import type { DunetaServerConfig } from '../../config/server/types.js';
import type { RequestContext } from './request-context.js';

export function applyRequestId(
  c: Context<RequestContext>,
  config: DunetaServerConfig,
) {
  const { header } = config.request.id;
  const incoming = c.req.header(header)?.trim();
  const requestId = incoming || crypto.randomUUID();

  c.set('requestId', requestId);
  c.header(header, requestId);
}

export function createRequestIdMiddleware(config: DunetaServerConfig) {
  return createMiddleware<RequestContext>(async (c, next) => {
    applyRequestId(c, config);
    await next();
  });
}
