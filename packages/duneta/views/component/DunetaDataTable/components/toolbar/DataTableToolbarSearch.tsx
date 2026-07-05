
import debounce from 'lodash/debounce';
import { useEffect, useMemo, useState } from 'react';
import { DunetaSearchField } from '../../../DunetaSearchField';
import type { DunetaDataTableToolbarSearchConfig } from '../../types/toolbar';

type DataTableToolbarSearchProps = {
  config: DunetaDataTableToolbarSearchConfig;
  onDebouncedChange: (query: string) => void;
};

export function DataTableToolbarSearch({
  config,
  onDebouncedChange,
}: DataTableToolbarSearchProps) {
  const { placeholder = 'Search…', initialValue = '', debounceMs = 300 } =
    config;
  const [value, setValue] = useState(initialValue);
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue);

  if (initialValue !== prevInitialValue) {
    setPrevInitialValue(initialValue);
    setValue(initialValue);
  }

  const debouncedChange = useMemo(
    () => debounce((next: string) => onDebouncedChange(next), debounceMs),
    [debounceMs, onDebouncedChange],
  );

  useEffect(() => {
    debouncedChange(value);
    return () => debouncedChange.cancel();
  }, [debouncedChange, value]);

  return (
    <DunetaSearchField
      aria-label="Search table"
      className="min-w-0 flex-1"
      value={value}
      onChange={setValue}
    >
      <DunetaSearchField.Group className="w-full min-w-[12rem] max-w-md">
        <DunetaSearchField.SearchIcon />
        <DunetaSearchField.Input placeholder={placeholder} />
        <DunetaSearchField.ClearButton />
      </DunetaSearchField.Group>
    </DunetaSearchField>
  );
}
