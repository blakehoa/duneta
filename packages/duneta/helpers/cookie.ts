export function readBrowserCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;

  const encoded = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split('; ');

  for (const part of parts) {
    if (part.startsWith(encoded)) {
      return decodeURIComponent(part.slice(encoded.length));
    }
  }

  return undefined;
}

export function writeBrowserCookie(
  name: string,
  value: string,
  options: { maxAge?: number; path?: string; sameSite?: 'Lax' | 'Strict' | 'None' } = {},
) {
  if (typeof document === 'undefined') return;

  const segments = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`, `path=${options.path ?? '/'}`];

  if (options.maxAge !== undefined) segments.push(`max-age=${options.maxAge}`);
  if (options.sameSite) segments.push(`SameSite=${options.sameSite}`);

  document.cookie = segments.join('; ');
}
