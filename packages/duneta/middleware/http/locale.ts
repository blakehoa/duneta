import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import type { Context } from 'hono';
import type { DunetaServerConfig } from '../../config/server/types.js';
import type { RequestContext } from './request-context.js';

function normalizeLocale(value: string) {
  return value.trim().toLowerCase();
}

export function createLocaleResolver(config: DunetaServerConfig) {
  const { locale } = config;
  const { resolve } = locale;
  const exact = new Map<string, string>();
  const base = new Map<string, string>();

  for (const supported of locale.supported) {
    const normalized = normalizeLocale(supported);
    exact.set(normalized, supported);
    const language = normalized.split('-')[0];
    if (language && !base.has(language)) base.set(language, supported);
  }

  const pick = (candidate: string | undefined) => {
    if (!candidate) return undefined;
    const normalized = normalizeLocale(candidate);
    return exact.get(normalized) ?? base.get(normalized.split('-')[0] ?? '');
  };

  return (c: Context<RequestContext>) => {
    const fromQuery = resolve.query ? c.req.query(resolve.query) : undefined;
    const fromCookie = resolve.cookie
      ? getCookie(c, resolve.cookie)
      : undefined;
    const fromHeader = c.req.header(resolve.header);

    if (fromQuery) return pick(fromQuery) ?? locale.default;
    if (fromCookie) return pick(fromCookie) ?? locale.default;

    if (fromHeader) {
      for (const part of fromHeader.split(',')) {
        const matched = pick(part.split(';')[0]?.trim());
        if (matched) return matched;
      }
    }

    return locale.default;
  };
}

export function applyLocale(
  c: Context<RequestContext>,
  resolve: ReturnType<typeof createLocaleResolver>,
) {
  const locale = resolve(c);
  c.set('locale', locale);
  c.header('Content-Language', locale);
}

export function createLocaleMiddleware(config: DunetaServerConfig) {
  const resolve = createLocaleResolver(config);

  return createMiddleware<RequestContext>(async (c, next) => {
    applyLocale(c, resolve);
    await next();
  });
}
