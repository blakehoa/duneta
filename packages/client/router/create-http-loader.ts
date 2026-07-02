import { http } from '../http/http-service.js';
import type { BaseHttpService } from '../http/base-http-service.js';
import type { HttpRequestOptions } from '../http/types.js';

/** Factory for a React Router `loader` that fetches JSON via `duneta/client/http`. */
export function createHttpLoader<T = unknown>(
  path: string,
  options: Omit<HttpRequestOptions, 'path' | 'responseType'> & { client?: BaseHttpService } = {},
) {
  const { client = http, ...requestOptions } = options;
  return () => client.json<T>(path, requestOptions);
}
