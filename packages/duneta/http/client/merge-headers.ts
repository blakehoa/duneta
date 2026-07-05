export function mergeHeaders(...sources: Array<HeadersInit | undefined>): Headers {
  const headers = new Headers();

  for (const source of sources) {
    if (!source) continue;
    new Headers(source).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
}

export function setHeaderIfMissing(headers: Headers, name: string, value: string) {
  if (!headers.has(name)) {
    headers.set(name, value);
  }
}
