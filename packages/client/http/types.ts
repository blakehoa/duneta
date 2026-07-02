export type HttpResponseType =
  | 'json'
  | 'text'
  | 'blob'
  | 'arrayBuffer'
  | 'stream'
  | 'formData';

export type HttpServiceOptions = {
  baseUrl?: string;
  defaultHeaders?: HeadersInit;
  credentials?: RequestCredentials;
  transport?: import('./transport.js').HttpTransport;
  fetch?: typeof fetch;
  csrf?: {
    cookie?: string;
    header?: string;
  };
};

export type HttpRequestOptions = Omit<RequestInit, 'body'> & {
  path: string;
  params?: Record<string, string | number | boolean | null | undefined>;
  responseType?: HttpResponseType | 'auto';
  json?: unknown;
  timeout?: number;
  body?: BodyInit | null;
};

export type HttpUploadOptions = Omit<HttpRequestOptions, 'body' | 'json' | 'method'> & {
  file: Blob;
  fieldName?: string;
  filename?: string;
  data?: Record<string, string | number | boolean>;
};

export type HttpDownloadResult = {
  blob: Blob;
  filename?: string;
  response: Response;
};
