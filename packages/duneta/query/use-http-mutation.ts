import { useMutation, type UseMutationOptions, type UseMutationResult } from '@tanstack/react-query';
import { http } from '../http/client/http-service.js';
import type { BaseHttpService } from '../http/client/base-http-service.js';
import type { HttpRequestOptions } from '../http/client/types.js';

export type HttpMutationMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type UseHttpMutationOptions<TData = unknown, TVariables = unknown> = Omit<
  UseMutationOptions<TData, Error, TVariables>,
  'mutationFn'
> & {
  client?: BaseHttpService;
  method?: HttpMutationMethod;
  path: string | ((variables: TVariables) => string);
  mapVariables?: (variables: TVariables) => Omit<HttpRequestOptions, 'path' | 'method' | 'responseType'>;
};

export function useHttpMutation<TData = unknown, TVariables = unknown>(
  options: UseHttpMutationOptions<TData, TVariables>,
): UseMutationResult<TData, Error, TVariables> {
  const { client = http, method = 'POST', path, mapVariables, ...mutationOptions } = options;

  return useMutation({
    ...mutationOptions,
    mutationFn: async (variables) => {
      const resolvedPath = typeof path === 'function' ? path(variables) : path;
      const requestOptions = mapVariables?.(variables) ?? ({ json: variables } as HttpRequestOptions);

      switch (method) {
        case 'PUT':
          return client.json<TData>(resolvedPath, { ...requestOptions, method: 'PUT' });
        case 'PATCH':
          return client.json<TData>(resolvedPath, { ...requestOptions, method: 'PATCH' });
        case 'DELETE':
          return client.json<TData>(resolvedPath, { ...requestOptions, method: 'DELETE' });
        default:
          return client.json<TData>(resolvedPath, { ...requestOptions, method: 'POST' });
      }
    },
  });
}
