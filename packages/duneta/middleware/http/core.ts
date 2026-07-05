import { createMiddleware } from 'hono/factory';
import type { DunetaServerConfig } from '../../config/server/types.js';
import type { RequestContext } from './request-context.js';
import { createLocaleMiddleware } from './locale.js';
import { createRequestIdMiddleware } from './request-id.js';
import { createSecurityHeadersMiddleware } from './security-headers.js';
import { createTimezoneMiddleware } from './timezone.js';

export function createCoreMiddleware(config: DunetaServerConfig) {
  const requestIdMw = createRequestIdMiddleware(config);
  const securityHeadersMw = createSecurityHeadersMiddleware(config);
  const localeMw = createLocaleMiddleware(config);
  const timezoneMw = createTimezoneMiddleware(config);

  return createMiddleware<RequestContext>(async (c, next) => {
    await requestIdMw(c, async () => {
      await securityHeadersMw(c, async () => {
        await localeMw(c, async () => {
          await timezoneMw(c, next);
        });
      });
    });
  });
}
