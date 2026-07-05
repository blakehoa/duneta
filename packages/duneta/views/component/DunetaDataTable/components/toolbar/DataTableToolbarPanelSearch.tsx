
import { useState } from 'react';
import { DunetaSearchField } from '../../../DunetaSearchField';

type DataTableToolbarPanelSearchProps = {
  ariaLabel: string;
  placeholder: string;
  onQueryChange: (query: string) => void;
};

export function DataTableToolbarPanelSearch({
  ariaLabel,
  placeholder,
  onQueryChange,
}: DataTableToolbarPanelSearchProps) {
  const [query, setQuery] = useState('');

  return (
    <DunetaSearchField
      aria-label={ariaLabel}
      className="w-full"
      value={query}
      onChange={(next) => {
        setQuery(next);
        onQueryChange(next);
      }}
    >
      <DunetaSearchField.Group className="w-full">
        <DunetaSearchField.SearchIcon />
        <DunetaSearchField.Input placeholder={placeholder} />
        <DunetaSearchField.ClearButton />
      </DunetaSearchField.Group>
    </DunetaSearchField>
  );
}
