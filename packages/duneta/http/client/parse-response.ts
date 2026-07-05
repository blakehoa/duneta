import type { HttpResponseType } from './types.js';

export function inferResponseType(response: Response): HttpResponseType {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) return 'json';
  if (contentType.startsWith('text/')) return 'text';
  if (contentType.includes('multipart/form-data')) return 'formData';
  if (contentType.includes('application/x-www-form-urlencoded')) return 'formData';

  return 'blob';
}

export async function parseResponseBody<T>(
  response: Response,
  responseType: HttpResponseType,
): Promise<T> {
  switch (responseType) {
    case 'json':
      return (await response.json()) as T;
    case 'text':
      return (await response.text()) as T;
    case 'blob':
      return (await response.blob()) as T;
    case 'arrayBuffer':
      return (await response.arrayBuffer()) as T;
    case 'formData':
      return (await response.formData()) as T;
    case 'stream':
      if (!response.body) {
        throw new Error('Response has no body stream');
      }
      return response.body as T;
    default:
      return (await response.json()) as T;
  }
}

export function parseContentDisposition(header: string | null): string | undefined {
  if (!header) return undefined;

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const asciiMatch = header.match(/filename="?([^";]+)"?/i);
  return asciiMatch?.[1];
}
