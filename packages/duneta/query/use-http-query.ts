import {
  useQuery,
  useSuspenseQuery,
  type UseQueryOptions,
  type UseQueryResult,
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
} from '@tanstack/react-query';
import { http } from '../http/client/http-service.js';
import type { BaseHttpService } from '../http/client/base-http-service.js';
import type { HttpRequestOptions } from '../http/client/types.js';
import { createHttpQueryDefinition } from './http-query-definition.js';
import { DUNETA_SSR_QUERY_META } from './ssr-state.js';
import type { httpQueryKey } from './client.js';

type HttpQueryKey = ReturnType<typeof httpQueryKey>;

type SharedHttpQueryOptions = {
  client?: BaseHttpService;
  request?: Omit<HttpRequestOptions, 'path' | 'responseType'>;
  /** Prefetch on the server during SSR and hydrate on the client (requires `<Suspense>`). */
  ssr?: boolean;
};

export type UseHttpQueryOptions<T> = SharedHttpQueryOptions &
  Omit<UseQueryOptions<T, Error, T, HttpQueryKey>, 'queryKey' | 'queryFn'>;

export type UseHttpSuspenseQueryOptions<T> = SharedHttpQueryOptions &
  Omit<UseSuspenseQueryOptions<T, Error, T, HttpQueryKey>, 'queryKey' | 'queryFn'>;

export function useHttpQuery<T = unknown>(
  path: string,
  options: UseHttpQueryOptions<T> & { ssr?: false },
): UseQueryResult<T, Error>;

export function useHttpQuery<T = unknown>(
  path: string,
  options: UseHttpSuspenseQueryOptions<T> & { ssr: true },
): UseSuspenseQueryResult<T, Error>;

export function useHttpQuery<T = unknown>(
  path: string,
  options: UseHttpQueryOptions<T> | UseHttpSuspenseQueryOptions<T> = {},
) {
  const { client = http, request, ssr = false, ...queryOptions } = options;
  const definition = createHttpQueryDefinition<T>(path, { client, request });

  if (ssr) {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- overload selects suspense vs non-suspense mode.
    return useSuspenseQuery({
      ...queryOptions,
      ...definition,
      meta: { [DUNETA_SSR_QUERY_META]: true, ...queryOptions.meta },
    });
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks -- overload selects suspense vs non-suspense mode.
  return useQuery({
    ...queryOptions,
    ...definition,
  });
}
