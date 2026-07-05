import { HydrationBoundary, QueryClientProvider } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { createDunetaQueryClient } from '../../query/client.js';
import { readClientDehydratedState } from '../../query/ssr-state.js';

export type DunetaQueryProviderProps = {
  children: ReactNode;
  client?: QueryClient;
};

function isDevEnvironment() {
  return process.env.NODE_ENV !== 'production';
}

/** Client-only QueryClient + hydration from SSR dehydrate script. */
export function DunetaQueryProvider({ children, client }: DunetaQueryProviderProps) {
  const [queryClient] = useState(() => client ?? createDunetaQueryClient());
  const [dehydratedState] = useState(() => readClientDehydratedState());

  return (
    <QueryClientProvider client={queryClient}>
      {dehydratedState ? (
        <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
      ) : (
        children
      )}
      {isDevEnvironment() ? <DunetaQueryDevtools /> : null}
    </QueryClientProvider>
  );
}

function DunetaQueryDevtools() {
  const [Devtools, setDevtools] = useState<ComponentType<{ initialIsOpen?: boolean }> | null>(null);

  useEffect(() => {
    void import('@tanstack/react-query-devtools').then((mod) => {
      setDevtools(() => mod.ReactQueryDevtools);
    });
  }, []);

  if (!Devtools) return null;
  return <Devtools initialIsOpen={false} />;
}
