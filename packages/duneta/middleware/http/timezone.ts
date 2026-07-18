import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import type { Context } from 'hono';
import type { DunetaServerConfig } from '../../config/server/types.js';
import type { RequestContext } from './request-context.js';

function isValidTimezone(value: string) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function createTimezoneResolver(config: DunetaServerConfig) {
  const { timezone } = config;
  const { resolve } = timezone;
  const supported =
    timezone.supported.length > 0
      ? new Set(timezone.supported.filter(isValidTimezone))
      : null;
  const validity = new Map<string, boolean>();

  return (c: Context<RequestContext>) => {
    const fromQuery = resolve.query ? c.req.query(resolve.query) : undefined;
    const fromHeader = c.req.header(resolve.header);
    const fromCookie = resolve.cookie
      ? getCookie(c, resolve.cookie)
      : undefined;
    const candidate = fromQuery ?? fromHeader ?? fromCookie;

    if (!candidate) return timezone.default;
    if (supported) {
      return supported.has(candidate) ? candidate : timezone.default;
    }

    let valid = validity.get(candidate);
    if (valid === undefined) {
      valid = isValidTimezone(candidate);
      if (validity.size >= 128) validity.clear();
      validity.set(candidate, valid);
    }
    return valid ? candidate : timezone.default;
  };
}

export function applyTimezone(
  c: Context<RequestContext>,
  config: DunetaServerConfig,
  resolve: ReturnType<typeof createTimezoneResolver>,
) {
  const timezone = resolve(c);
  c.set('timezone', timezone);
  c.header(config.timezone.resolve.header, timezone);
}

export function createTimezoneMiddleware(config: DunetaServerConfig) {
  const resolve = createTimezoneResolver(config);

  return createMiddleware<RequestContext>(async (c, next) => {
    applyTimezone(c, config, resolve);
    await next();
  });
}
