import type { BaseHttpService } from '../http/client/base-http-service.js';
import type { HttpRequestOptions } from '../http/client/types.js';
import { httpQueryKey } from './client.js';

export type HttpQueryDefinition<T> = {
  queryKey: ReturnType<typeof httpQueryKey>;
  queryFn: () => Promise<T>;
};

export function createHttpQueryDefinition<T>(
  path: string,
  {
    client,
    request,
  }: {
    client: BaseHttpService;
    request?: Omit<HttpRequestOptions, 'path' | 'responseType'>;
  },
): HttpQueryDefinition<T> {
  return {
    queryKey: httpQueryKey(path, request?.params),
    queryFn: () => client.json<T>(path, request),
  };
}
