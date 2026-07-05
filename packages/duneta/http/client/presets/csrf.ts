import { HttpService } from '../http-service.js';
import type { HttpServiceOptions } from '../types.js';
import { readBrowserCookie } from '../../../helpers/cookie.js';

export const DUNETA_CSRF_COOKIE = 'duneta_csrf';
export const DUNETA_CSRF_HEADER = 'X-CSRF-Token';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export class CsrfHttpService extends HttpService {
  protected async onRequest(url: string, init: RequestInit): Promise<RequestInit> {
    const next = await super.onRequest(url, init);
    const method = (next.method ?? 'GET').toUpperCase();

    if (!MUTATING_METHODS.has(method)) return next;

    const cookieName = this.options.csrf?.cookie ?? DUNETA_CSRF_COOKIE;
    const headerName = this.options.csrf?.header ?? DUNETA_CSRF_HEADER;
    const token = readBrowserCookie(cookieName);

    if (!token) return next;

    const headers = new Headers(next.headers);
    headers.set(headerName, token);
    return { ...next, headers };
  }
}

export function createCsrfHttpService(options: HttpServiceOptions = {}) {
  return new CsrfHttpService(options);
}
