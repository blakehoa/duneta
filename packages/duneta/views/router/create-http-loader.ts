import { http } from '../../http/client/http-service.js';
import type { BaseHttpService } from '../../http/client/base-http-service.js';
import type { HttpRequestOptions } from '../../http/client/types.js';

/** Factory for a React Router `loader` that fetches JSON via `duneta/http`. */
export function createHttpLoader<T = unknown>(
  path: string,
  options: Omit<HttpRequestOptions, 'path' | 'responseType'> & { client?: BaseHttpService } = {},
) {
  const { client = http, ...requestOptions } = options;
  return () => client.json<T>(path, requestOptions);
}
