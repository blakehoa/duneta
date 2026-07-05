import type { Location, NavigateFunction, SetURLSearchParams, To } from 'react-router';
import { isSamePathname, resolveTo } from './resolve-to';

export type ShallowUrlOptions = {
  replace?: boolean;
  preventScrollReset?: boolean;
};

/**
 * Update the URL on the current pathname without a full route change.
 * Query updates use `setSearchParams`; hash updates use a lightweight navigate.
 */
export function navigateShallow(
  href: To,
  location: Location,
  navigate: NavigateFunction,
  setSearchParams: SetURLSearchParams,
  options: ShallowUrlOptions = {},
) {
  const resolved = resolveTo(href, location);
  const { replace = false, preventScrollReset = true } = options;

  if (!isSamePathname(resolved, location)) {
    navigate(
      { pathname: resolved.pathname, search: resolved.search, hash: resolved.hash },
      { replace, preventScrollReset },
    );
    return;
  }

  const searchChanged = resolved.search !== location.search;
  const hashChanged = resolved.hash !== location.hash;

  if (searchChanged) {
    const query = resolved.search.startsWith('?') ? resolved.search.slice(1) : resolved.search;
    setSearchParams(new URLSearchParams(query), { replace, preventScrollReset });
  }

  if (hashChanged) {
    navigate(
      {
        pathname: resolved.pathname,
        search: searchChanged ? resolved.search : location.search,
        hash: resolved.hash,
      },
      { replace, preventScrollReset, state: { __shallow: true } },
    );
  }
}
