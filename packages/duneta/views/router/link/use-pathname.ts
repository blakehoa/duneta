import { useLocation } from 'react-router';

/** Current pathname without the query string (Next.js `usePathname`). */
export function usePathname() {
  const { pathname } = useLocation();
  return pathname;
}
