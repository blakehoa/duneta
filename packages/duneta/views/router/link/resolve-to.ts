import type { To } from 'react-router';

export type ResolvedTo = {
  pathname: string;
  search: string;
  hash: string;
};

type LocationSlice = {
  pathname: string;
  search: string;
  hash: string;
};

export function resolveTo(to: To, location: LocationSlice): ResolvedTo {
  if (typeof to === 'string') {
    if (to.startsWith('?')) {
      return { pathname: location.pathname, search: to, hash: location.hash };
    }
    if (to.startsWith('#')) {
      return { pathname: location.pathname, search: location.search, hash: to };
    }

    const url = new URL(to, `http://local${location.pathname}${location.search}`);
    return { pathname: url.pathname, search: url.search, hash: url.hash };
  }

  let search = location.search;
  if (to.search !== undefined) {
    if (typeof to.search === 'string') {
      search = to.search ? (to.search.startsWith('?') ? to.search : `?${to.search}`) : '';
    } else {
      const params = new URLSearchParams(to.search);
      const serialized = params.toString();
      search = serialized ? `?${serialized}` : '';
    }
  }

  let hash = location.hash;
  if (to.hash !== undefined) {
    hash = to.hash ? (to.hash.startsWith('#') ? to.hash : `#${to.hash}`) : '';
  }

  return {
    pathname: to.pathname ?? location.pathname,
    search,
    hash,
  };
}

export function isSamePathname(target: ResolvedTo, location: LocationSlice) {
  return target.pathname === location.pathname;
}
