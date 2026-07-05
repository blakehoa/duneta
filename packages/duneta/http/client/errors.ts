export type HttpErrorBody = {
  error?: string;
  message?: string;
  code?: string;
  [key: string]: unknown;
};

export class HttpError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly body: HttpErrorBody | string | null;

  constructor(
    message: string,
    options: {
      status: number;
      statusText: string;
      url: string;
      body?: HttpErrorBody | string | null;
    },
  ) {
    super(message);
    this.name = 'HttpError';
    this.status = options.status;
    this.statusText = options.statusText;
    this.url = options.url;
    this.body = options.body ?? null;
  }

  static async fromResponse(response: Response): Promise<HttpError> {
    const contentType = response.headers.get('content-type') ?? '';
    let body: HttpErrorBody | string | null = null;

    if (contentType.includes('application/json')) {
      try {
        body = (await response.clone().json()) as HttpErrorBody;
      } catch {
        body = null;
      }
    } else {
      try {
        const text = await response.clone().text();
        body = text || null;
      } catch {
        body = null;
      }
    }

    const apiMessage =
      body && typeof body === 'object'
        ? (body.error ?? body.message)
        : typeof body === 'string'
          ? body
          : undefined;

    return new HttpError(apiMessage ?? `Request failed: ${response.status} ${response.statusText}`, {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      body,
    });
  }

  static network(url: string, cause?: unknown): HttpError {
    const message =
      cause instanceof Error && cause.name === 'AbortError'
        ? 'Request timed out or was aborted'
        : 'Network request failed';

    return new HttpError(message, {
      status: 0,
      statusText: 'Network Error',
      url,
      body: cause instanceof Error ? cause.message : null,
    });
  }
}
