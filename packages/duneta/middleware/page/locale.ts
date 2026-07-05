import type { DunetaPageMiddleware } from './types.js';

export type LocaleCookieMiddlewareOptions = {
  supported: string[];
  defaultLocale: string;
  cookieName?: string;
  headerName?: string;
  maxAge?: number;
};

function readCookie(request: Request, name: string) {
  const cookie = request.headers.get('Cookie');
  if (!cookie) return undefined;

  const encoded = `${encodeURIComponent(name)}=`;
  const part = cookie
    .split(';')
    .map((value) => value.trim())
    .find((value) => value.startsWith(encoded));

  return part ? decodeURIComponent(part.slice(encoded.length)) : undefined;
}

function appendCookie(headers: Headers, name: string, value: string, maxAge: number) {
  headers.append(
    'Set-Cookie',
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`,
  );
}

function resolveAcceptedLocale(header: string | null, supported: string[]) {
  if (!header) return undefined;

  const accepted = header
    .split(',')
    .map((part) => part.split(';')[0]?.trim().toLowerCase())
    .filter(Boolean);

  return accepted.find((locale) => supported.includes(locale));
}

export function createLocaleCookieMiddleware({
  supported,
  defaultLocale,
  cookieName = 'locale',
  headerName = 'X-Locale',
  maxAge = 60 * 60 * 24 * 365,
}: LocaleCookieMiddlewareOptions): DunetaPageMiddleware {
  return async (context, next) => {
    const normalized = supported.map((locale) => locale.toLowerCase());
    const cookieLocale = readCookie(context.request, cookieName)?.toLowerCase();
    const acceptedLocale = resolveAcceptedLocale(
      context.request.headers.get('Accept-Language'),
      normalized,
    );
    const fallbackLocale = defaultLocale.toLowerCase();
    const locale: string =
      cookieLocale && normalized.includes(cookieLocale)
        ? cookieLocale
        : acceptedLocale ?? fallbackLocale;

    context.locals.locale = locale;
    context.responseHeaders.set(headerName, locale);

    const response = await next();
    const headers = new Headers(response.headers);
    headers.set(headerName, locale);

    if (cookieLocale !== locale) appendCookie(headers, cookieName, locale, maxAge);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}
