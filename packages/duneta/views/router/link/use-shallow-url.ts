import { useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams, type To } from 'react-router';
import { navigateShallow } from './shallow-url';

/** Shallow URL updates on the active route (query/hash) without changing the page. */
export function useShallowUrl() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const push = useCallback(
    (href: To) => navigateShallow(href, location, navigate, setSearchParams),
    [location, navigate, setSearchParams],
  );

  const replace = useCallback(
    (href: To) => navigateShallow(href, location, navigate, setSearchParams, { replace: true }),
    [location, navigate, setSearchParams],
  );

  return {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    searchParams,
    push,
    replace,
  };
}
