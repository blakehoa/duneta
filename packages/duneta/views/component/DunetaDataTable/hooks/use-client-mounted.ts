import { useSyncExternalStore } from 'react';

/** True after the first client paint — defers browser-only APIs (e.g. dnd-kit). */
export function useClientMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
