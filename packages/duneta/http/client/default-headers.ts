export const DUNETA_TIMEZONE_HEADER = 'X-Duneta-Timezone';
export const DUNETA_REQUEST_ID_HEADER = 'X-Request-Id';

export function createRequestId(): string {
  return crypto.randomUUID();
}

export function resolveClientTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function createDefaultRequestHeaders(): HeadersInit {
  return {
    Accept: 'application/json',
    [DUNETA_TIMEZONE_HEADER]: resolveClientTimezone(),
    [DUNETA_REQUEST_ID_HEADER]: createRequestId(),
  };
}
