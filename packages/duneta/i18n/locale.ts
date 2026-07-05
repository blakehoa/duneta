import {
  DUNETA_LOCALE_COOKIE,
  DUNETA_LOCALE_QUERY,
} from './constants.js';
import { getDefaultLocale, getSupportedLocales, type DunetaLocale } from './config.js';
import { readBrowserCookie, writeBrowserCookie } from '../helpers/cookie.js';

function normalizeLocale(value: string) {
  return value.trim().toLowerCase();
}

function pickLocale(candidate: string | undefined, fallback?: string): DunetaLocale {
  const supported = getSupportedLocales();
  const defaultLocale = fallback ?? getDefaultLocale();

  if (!candidate) return defaultLocale;

  const normalized = normalizeLocale(candidate);
  const exact = supported.find((item) => normalizeLocale(item) === normalized);
  if (exact) return exact;

  const base = normalized.split('-')[0];
  const partial = supported.find((item) => normalizeLocale(item).startsWith(base));
  return partial ?? defaultLocale;
}

export function resolveClientLocale(): DunetaLocale {
  if (typeof window !== 'undefined') {
    const fromQuery = new URLSearchParams(window.location.search).get(DUNETA_LOCALE_QUERY);
    if (fromQuery) return pickLocale(fromQuery);

    const fromCookie = readBrowserCookie(DUNETA_LOCALE_COOKIE);
    if (fromCookie) return pickLocale(fromCookie);
  }

  if (typeof navigator !== 'undefined') {
    const supported = getSupportedLocales();

    for (const tag of navigator.languages ?? []) {
      const normalized = normalizeLocale(tag);
      const exact = supported.find((item) => normalizeLocale(item) === normalized);
      if (exact) return exact;

      const base = normalized.split('-')[0];
      const partial = supported.find((item) => normalizeLocale(item).startsWith(base));
      if (partial) return partial;
    }
  }

  return getDefaultLocale();
}

export function setClientLocale(locale: DunetaLocale) {
  const supported = getSupportedLocales();
  if (!supported.includes(locale)) {
    throw new Error(`Locale "${locale}" is not supported. Allowed: ${supported.join(', ')}`);
  }

  writeBrowserCookie(DUNETA_LOCALE_COOKIE, locale, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'Lax',
  });

  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
  }
}
