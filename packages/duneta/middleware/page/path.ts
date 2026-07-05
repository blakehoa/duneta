import type { DunetaPageMiddlewareContext, DunetaPathMatcher } from './types.js';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchPathPattern(pattern: string, pathname: string) {
  const normalized = pattern.startsWith('/') ? pattern : `/${pattern}`;
  const source = normalized
    .split('/')
    .map((segment) => {
      if (!segment) return '';
      if (segment.startsWith(':')) return '[^/]+';
      if (segment === '*') return '.*';
      return escapeRegExp(segment);
    })
    .join('/');

  return new RegExp(`^${source}(?:/|$)`).test(pathname);
}

export function matchDunetaPath(
  matcher: DunetaPathMatcher,
  pathname: string,
  context: DunetaPageMiddlewareContext,
) {
  if (typeof matcher === 'string') {
    return matchPathPattern(matcher, pathname);
  }

  if (matcher instanceof RegExp) return matcher.test(pathname);

  return matcher(pathname, context);
}

export function matchesAnyDunetaPath(
  matchers: DunetaPathMatcher[] | undefined,
  pathname: string,
  context: DunetaPageMiddlewareContext,
) {
  return (matchers ?? []).some((matcher) => matchDunetaPath(matcher, pathname, context));
}
