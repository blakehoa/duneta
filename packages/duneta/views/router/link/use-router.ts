import { useCallback, useMemo } from 'react';
import {
  useLocation,
  useNavigate,
  useNavigation,
  useSearchParams,
  type NavigateOptions,
  type To,
} from 'react-router';
import { navigateShallow } from './shallow-url';

export type RouterHref = To;

export type DunetaNavigateOptions = NavigateOptions & {
  /** Update URL on the current page without changing the matched route (Next.js shallow). */
  shallow?: boolean;
};

export type AppRouter = {
  push: (href: RouterHref, options?: DunetaNavigateOptions) => void;
  replace: (href: RouterHref, options?: DunetaNavigateOptions) => void;
  back: () => void;
  forward: () => void;
  refresh: () => void;
  prefetch: (href: RouterHref) => void;
  pathname: string;
  search: string;
  hash: string;
  isPending: boolean;
};

function splitNavigateOptions(options?: DunetaNavigateOptions) {
  const { shallow, ...navigateOptions } = options ?? {};
  return { shallow, navigateOptions };
}

/** Programmatic navigation and history (Next.js App Router `useRouter`). */
export function useRouter(): AppRouter {
  const navigate = useNavigate();
  const location = useLocation();
  const navigation = useNavigation();
  const [, setSearchParams] = useSearchParams();

  const push = useCallback(
    (href: RouterHref, options?: DunetaNavigateOptions) => {
      const { shallow, navigateOptions } = splitNavigateOptions(options);

      if (shallow) {
        navigateShallow(href, location, navigate, setSearchParams, {
          replace: false,
          preventScrollReset: navigateOptions.preventScrollReset,
        });
        return;
      }

      navigate(href, navigateOptions);
    },
    [location, navigate, setSearchParams],
  );

  const replace = useCallback(
    (href: RouterHref, options?: DunetaNavigateOptions) => {
      const { shallow, navigateOptions } = splitNavigateOptions(options);

      if (shallow) {
        navigateShallow(href, location, navigate, setSearchParams, {
          replace: true,
          preventScrollReset: navigateOptions.preventScrollReset,
        });
        return;
      }

      navigate(href, { ...navigateOptions, replace: true });
    },
    [location, navigate, setSearchParams],
  );

  const back = useCallback(() => navigate(-1), [navigate]);
  const forward = useCallback(() => navigate(1), [navigate]);
  const refresh = useCallback(() => navigate(0), [navigate]);
  const prefetch = useCallback((href: RouterHref) => {
    void href;
  }, []);

  return useMemo(
    () => ({
      push,
      replace,
      back,
      forward,
      refresh,
      prefetch,
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      isPending: navigation.state !== 'idle',
    }),
    [push, replace, back, forward, refresh, prefetch, location, navigation.state],
  );
}
