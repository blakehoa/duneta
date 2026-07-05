import { useLocation, useParams as useRouterParams, useSearchParams as useRouterSearchParams } from 'react-router';

/** Read-only snapshot of the active route (pathname, params, query, hash). */
export function useRoute<T extends Record<string, string | undefined> = Record<string, string | undefined>>() {
  const location = useLocation();
  const params = useRouterParams() as T;
  const [searchParams] = useRouterSearchParams();

  return {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    params,
    searchParams,
    state: location.state,
  };
}
