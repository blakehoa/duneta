import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import type { DunetaServerConfig } from '../../config/server/types.js';
import type { RequestContext } from './request-context.js';

function normalizeLocale(value: string) {
  return value.trim().toLowerCase();
}

function pickLocale(candidate: string | undefined, supported: string[], fallback: string) {
  if (!candidate) return fallback;
  const normalized = normalizeLocale(candidate);
  const exact = supported.find((item) => normalizeLocale(item) === normalized);
  if (exact) return exact;

  const base = normalized.split('-')[0];
  const partial = supported.find((item) => normalizeLocale(item).startsWith(base));
  return partial ?? fallback;
}

function parseAcceptLanguage(header: string | undefined, supported: string[], fallback: string) {
  if (!header) return fallback;

  for (const part of header.split(',')) {
    const tag = part.split(';')[0]?.trim();
    if (!tag) continue;
    const match = pickLocale(tag, supported, '');
    if (match) return match;
  }

  return fallback;
}

export function createLocaleMiddleware(config: DunetaServerConfig) {
  const { locale } = config;
  const { resolve } = locale;

  return createMiddleware<RequestContext>(async (c, next) => {
    const fromQuery = resolve.query ? c.req.query(resolve.query) : undefined;
    const fromCookie = resolve.cookie ? getCookie(c, resolve.cookie) : undefined;
    const fromHeader = c.req.header(resolve.header);

    let resolved = locale.default;

    if (fromQuery) resolved = pickLocale(fromQuery, locale.supported, locale.default);
    else if (fromCookie) resolved = pickLocale(fromCookie, locale.supported, locale.default);
    else if (fromHeader) resolved = parseAcceptLanguage(fromHeader, locale.supported, locale.default);

    c.set('locale', resolved);
    c.header('Content-Language', resolved);
    await next();
  });
}
