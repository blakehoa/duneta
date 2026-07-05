export type HttpTransport = (url: string, init: RequestInit) => Promise<Response>;

export function createFetchTransport(fetcher: typeof fetch = fetch): HttpTransport {
  return (url, init) => fetcher(url, init);
}
