import { dehydrate, QueryClientProvider, type DehydratedState, type QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { injectScriptBeforeBodyEnd, serializeDehydratedStateScript, DUNETA_SSR_QUERY_META } from './ssr-state.js';

export { DUNETA_SSR_QUERY_META };

export function DunetaServerQueryProvider({
  client,
  children,
}: {
  client: QueryClient;
  children: ReactNode;
}) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export function hasDehydratedQueries(queryClient: QueryClient): boolean {
  return dehydrate(queryClient).queries.length > 0;
}

export function queryClientHasSsrQueries(queryClient: QueryClient): boolean {
  return queryClient
    .getQueryCache()
    .getAll()
    .some((query) => query.meta?.[DUNETA_SSR_QUERY_META] === true);
}

export function finalizeSsrQueryResponse(
  body: ReadableStream<Uint8Array>,
  queryClient: QueryClient,
): ReadableStream<Uint8Array> | null {
  const state: DehydratedState = dehydrate(queryClient);
  if (state.queries.length === 0) {
    return null;
  }

  const script = serializeDehydratedStateScript(state);
  return injectScriptBeforeBodyEnd(body, script);
}
