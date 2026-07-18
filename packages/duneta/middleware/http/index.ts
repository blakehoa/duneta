import { createMiddleware } from 'hono/factory';
import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type {
  CorsConfig,
  DunetaServerConfig,
} from '../../config/server/types.js';
import { createLogger } from '../../http/logging/index.js';
import { HttpError } from '../../permission/errors.js';
import { createCsrfMiddleware } from './csrf.js';
import type { RequestContext } from './request-context.js';
import { createLocaleMiddleware } from './locale.js';
import { createRateLimitMiddleware } from './rate-limit.js';
import { createRequestIdMiddleware } from './request-id.js';
import { createSecurityHeadersMiddleware } from './security-headers.js';
import { createTimezoneMiddleware } from './timezone.js';

export type { RequestContext } from './request-context.js';

export { createCoreMiddleware } from './core.js';
export { requireSession } from './session.js';
export {
  createCsrfMiddleware,
  createLocaleMiddleware,
  createRateLimitMiddleware,
  createRequestIdMiddleware,
  createSecurityHeadersMiddleware,
  createTimezoneMiddleware,
};
export type { AuthSession, AuthUser } from './types.js';

const DEFAULT_CORS_ALLOW_HEADERS = [
  'Content-Type',
  'Authorization',
  'Accept-Language',
  'X-Duneta-Timezone',
  'X-Duneta-Locale',
  'X-Request-Id',
  'X-CSRF-Token',
];

export function createCorsMiddleware(
  cors: CorsConfig = { origins: ['*'], credentials: false },
) {
  const origins = cors.origins.length > 0 ? cors.origins : ['*'];
  const allowAll = origins.includes('*');
  const allowHeaders = [
    ...DEFAULT_CORS_ALLOW_HEADERS,
    ...(cors.allowHeaders ?? []),
  ];
  const uniqueHeaders = [...new Set(allowHeaders)];

  if (allowAll && cors.credentials) {
    console.warn(
      '[duneta] security.cors.credentials is ignored when origins includes "*"',
    );
  }

  return createMiddleware<RequestContext>(async (c, next) => {
    const origin = c.req.header('Origin');
    const allowed = origin ? allowAll || origins.includes(origin) : false;

    if (allowed && origin) {
      c.header('Access-Control-Allow-Origin', allowAll ? '*' : origin);
      c.header(
        'Access-Control-Allow-Methods',
        'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      );
      c.header('Access-Control-Allow-Headers', uniqueHeaders.join(', '));
      c.header(
        'Access-Control-Expose-Headers',
        'X-Request-Id, Content-Language, X-Duneta-Timezone',
      );
      if (cors.maxAge !== undefined) {
        c.header('Access-Control-Max-Age', String(cors.maxAge));
      }
      if (!allowAll) {
        c.header('Vary', 'Origin');
        if (cors.credentials) {
          c.header('Access-Control-Allow-Credentials', 'true');
        }
      }
    }

    if (c.req.method === 'OPTIONS') {
      return c.body(null, 204);
    }

    await next();
  });
}

export function createErrorHandler(config: DunetaServerConfig) {
  const logger = createLogger(config);
  const debug = config.app.debug || config.debug.enabled;

  return (error: Error, c: Context<RequestContext>) => {
    logger.error(error.message, {
      requestId: c.get('requestId'),
      method: c.req.method,
      path: c.req.path,
      ...(debug && error.stack ? { stack: error.stack } : {}),
    });

    if (error instanceof HttpError) {
      const message =
        debug || error.status < 500 ? error.message : 'Internal Server Error';
      return c.json(
        { error: message, code: error.code },
        error.status as ContentfulStatusCode,
      );
    }

    const status = (
      'status' in error ? Number(error.status) : 500
    ) as ContentfulStatusCode;
    const message = debug ? error.message : 'Internal Server Error';
    return c.json(
      { error: message, code: 'INTERNAL_ERROR' },
      status >= 400 && status < 600 ? status : 500,
    );
  };
}
