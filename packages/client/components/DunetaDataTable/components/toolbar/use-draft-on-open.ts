import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

/**
 * Panel draft state: copies `applied` into draft whenever the popover opens.
 * Use for Apply-to-commit flows (group, column visibility, …).
 */
export function useDraftOnOpen<T>(
  open: boolean,
  applied: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [draft, setDraft] = useState(applied);
  const wasOpenRef = useRef(open);

  // Sync applied -> draft only when panel transitions from closed to open.
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraft(applied);
    }
    wasOpenRef.current = open;
  }, [open, applied]);

  return [draft, setDraft];
}
