import { createRequestId, DUNETA_REQUEST_ID_HEADER } from '../../http/client/default-headers.js';
import type { DunetaPageMiddleware } from './types.js';

export type SecurityHeadersMiddlewareOptions = {
  frameAncestors?: string;
  referrerPolicy?: string;
  contentTypeOptions?: boolean;
  crossOriginOpenerPolicy?: string;
  permissionsPolicy?: string;
};

export function createPageSecurityHeadersMiddleware({
  frameAncestors = "'self'",
  referrerPolicy = 'strict-origin-when-cross-origin',
  contentTypeOptions = true,
  crossOriginOpenerPolicy = 'same-origin',
  permissionsPolicy = 'camera=(), microphone=(), geolocation=()',
}: SecurityHeadersMiddlewareOptions = {}): DunetaPageMiddleware {
  return async (context, next) => {
    const response = await next();
    const headers = new Headers(response.headers);

    if (!headers.has('Content-Security-Policy')) {
      headers.set('Content-Security-Policy', `frame-ancestors ${frameAncestors}`);
    }
    if (!headers.has('Referrer-Policy')) headers.set('Referrer-Policy', referrerPolicy);
    if (contentTypeOptions && !headers.has('X-Content-Type-Options')) {
      headers.set('X-Content-Type-Options', 'nosniff');
    }
    if (!headers.has('Cross-Origin-Opener-Policy')) {
      headers.set('Cross-Origin-Opener-Policy', crossOriginOpenerPolicy);
    }
    if (!headers.has('Permissions-Policy')) headers.set('Permissions-Policy', permissionsPolicy);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}

export function createPageRequestIdMiddleware(
  headerName = DUNETA_REQUEST_ID_HEADER,
): DunetaPageMiddleware {
  return async (context, next) => {
    const incoming = context.request.headers.get(headerName);
    const requestId = incoming || createRequestId();
    context.locals.requestId = requestId;
    context.responseHeaders.set(headerName, requestId);

    const response = await next();
    const headers = new Headers(response.headers);
    if (!headers.has(headerName)) headers.set(headerName, requestId);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}
