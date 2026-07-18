import { createMiddleware } from 'hono/factory';
import type { DunetaServerConfig } from '../../config/server/types.js';
import type { RequestContext } from './request-context.js';
import { applyLocale, createLocaleResolver } from './locale.js';
import { applyRequestId } from './request-id.js';
import { applySecurityHeaders } from './security-headers.js';
import { applyTimezone, createTimezoneResolver } from './timezone.js';

export function createCoreMiddleware(config: DunetaServerConfig) {
  const resolveLocale = createLocaleResolver(config);
  const resolveTimezone = createTimezoneResolver(config);

  return createMiddleware<RequestContext>(async (c, next) => {
    applyRequestId(c, config);
    applySecurityHeaders(c, config);
    applyLocale(c, resolveLocale);
    applyTimezone(c, config, resolveTimezone);
    await next();
  });
}
