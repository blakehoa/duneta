
import debounce from 'lodash/debounce';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DunetaButton } from '../DunetaButton';
import { DunetaInput } from './DunetaInput';

// Search input with cancellable lodash debounce.

export type DunetaInputSearchProps = {
  initialValue?: string;
  onDebouncedChange: (value: string) => void;
  onRefresh?: () => void;
  debounceMs?: number;
  isRefreshing?: boolean;
  placeholder?: string;
  ariaLabel: string;
  refreshAria?: string;
  clearAria?: string;
  className?: string;
};

export function DunetaInputSearch({
  initialValue = '',
  onDebouncedChange,
  onRefresh,
  debounceMs = 300,
  isRefreshing = false,
  placeholder,
  ariaLabel,
  refreshAria = 'Refresh search',
  clearAria = 'Clear search',
  className = '',
}: DunetaInputSearchProps) {
  const [search, setSearch] = useState(initialValue);
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue);

  if (initialValue !== prevInitialValue) {
    setPrevInitialValue(initialValue);
    setSearch(initialValue);
  }

  const debouncedChange = useMemo(
    () => debounce((next: string) => onDebouncedChange(next), debounceMs),
    [debounceMs, onDebouncedChange],
  );

  useEffect(() => {
    debouncedChange(search);
    return () => debouncedChange.cancel();
  }, [debouncedChange, search]);

  const refresh = useCallback(() => {
    debouncedChange.cancel();
    onDebouncedChange(search);
    onRefresh?.();
  }, [debouncedChange, onDebouncedChange, onRefresh, search]);

  const hasValue = search.trim().length > 0;
  return (
    <div className={`relative min-w-0 flex-1 sm:max-w-md ${className}`}>
      <DunetaInput aria-label={ariaLabel} className={`w-full ${hasValue ? 'pr-[4.25rem]' : 'pr-11'}`} placeholder={placeholder} value={search} onChange={(event) => setSearch(event.target.value)} />
      <div className="absolute inset-y-0 right-1 z-10 flex items-center gap-0.5">
        {hasValue ? <DunetaButton type="button" isIconOnly size="sm" variant="ghost" aria-label={clearAria} onPress={() => setSearch('')}>×</DunetaButton> : null}
        {onRefresh ? <DunetaButton type="button" isIconOnly size="sm" variant="ghost" isDisabled={isRefreshing} aria-label={refreshAria} onPress={refresh}>{isRefreshing ? '◌' : '↻'}</DunetaButton> : null}
      </div>
    </div>
  );
}
