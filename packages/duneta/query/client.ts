import { QueryClient } from '@tanstack/react-query';

export function createDunetaQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export function httpQueryKey(
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>,
) {
  return ['http', path, params ?? null] as const;
}
