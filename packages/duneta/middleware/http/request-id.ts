import { createMiddleware } from 'hono/factory';
import type { DunetaServerConfig } from '../../config/server/types.js';
import type { RequestContext } from './request-context.js';

export function createRequestIdMiddleware(config: DunetaServerConfig) {
  const { header } = config.request.id;

  return createMiddleware<RequestContext>(async (c, next) => {
    const incoming = c.req.header(header)?.trim();
    const requestId = incoming && incoming.length > 0 ? incoming : crypto.randomUUID();

    c.set('requestId', requestId);
    c.header(header, requestId);
    await next();
  });
}
