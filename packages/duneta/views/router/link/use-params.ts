import { useParams as useRouterParams } from 'react-router';

/** Dynamic route params (Next.js `useParams`). */
export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>() {
  return useRouterParams() as T;
}
