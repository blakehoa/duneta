import { useSearchParams as useRouterSearchParams } from 'react-router';

/** Current URL search params (Next.js `useSearchParams`). */
export function useSearchParams() {
  const [searchParams] = useRouterSearchParams();
  return searchParams;
}
