
import uFuzzy from '@leeoniya/ufuzzy';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Input, ListBox, Select } from '@heroui/react';
import debounce from 'lodash/debounce';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Key,
} from 'react';
import type {
  DunetaSelectSingleOption,
  DunetaSelectSingleProps,
  DunetaSelectSingleSearchRule,
  DunetaSelectSingleVirtualConfig,
} from './types';

function textForOption<T extends string>(
  option: DunetaSelectSingleOption<T>,
): string {
  return typeof option.label === 'string'
    ? option.label
    : (option.searchText?.trim() ?? '');
}

function matchesRule<T extends string>(
  option: DunetaSelectSingleOption<T>,
  query: string,
  rule: DunetaSelectSingleSearchRule,
): boolean {
  const source =
    rule.key === 'label'
      ? textForOption(option)
      : rule.key === 'value'
        ? option.value
        : String((option as Record<string, unknown>)[rule.key] ?? '');
  const value = source.toLocaleLowerCase();
  if (rule.pattern instanceof RegExp) {
    rule.pattern.lastIndex = 0;
    return rule.pattern.test(value);
  }
  if (rule.pattern === 'exact') return value === query;
  if (rule.pattern === 'startsWith') return value.startsWith(query);
  return value.includes(query);
}

function resolveVirtualConfig(
  virtual: DunetaSelectSingleProps['virtual'],
): Required<DunetaSelectSingleVirtualConfig> | null {
  if (!virtual) return null;
  if (virtual === true)
    return { estimatedItemSize: 36, maxHeight: 288, overscan: 8 };
  return {
    estimatedItemSize: virtual.estimatedItemSize ?? 36,
    maxHeight: virtual.maxHeight ?? 288,
    overscan: virtual.overscan ?? 8,
  };
}

export function DunetaSelectSingle<T extends string = string>({
  ariaLabel,
  'aria-label': nativeAriaLabel,
  options,
  value,
  onChange,
  placeholder = '',
  isDisabled = false,
  className,
  fullWidth = true,
  allowClear = true,
  search = {},
  virtual = false,
}: DunetaSelectSingleProps<T>) {
  const [inputQuery, setInputQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const accessibleName = (ariaLabel ?? nativeAriaLabel ?? placeholder) || 'Select';
  const normalizedValue = value == null || value === '' ? '' : String(value);
  const valueExists = options.some(
    (option) => option.value === normalizedValue,
  );
  const selectedKey = valueExists ? normalizedValue : null;
  const enabledSearch = search !== false;
  const rules = search === false ? undefined : search.rules;
  const searchPlaceholder = search === false ? '' : (search.placeholder ?? '');
  const searchDebounceMs = search === false ? 0 : (search.debounceMs ?? 150);
  const virtualConfig = resolveVirtualConfig(virtual);
  const fuzzy = useMemo(() => new uFuzzy({ unicode: true }), []);
  const setDebouncedSearchQuery = useMemo(
    () => debounce(setSearchQuery, searchDebounceMs),
    [searchDebounceMs],
  );

  useEffect(
    () => () => setDebouncedSearchQuery.cancel(),
    [setDebouncedSearchQuery],
  );

  const setQuery = useCallback(
    (next: string) => {
      setInputQuery(next);
      setDebouncedSearchQuery(next);
    },
    [setDebouncedSearchQuery],
  );

  const filteredOptions = useMemo(() => {
    const query = searchQuery.trim();
    if (!enabledSearch || !query) return [...options];
    if (rules?.length) {
      const normalizedQuery = query.toLocaleLowerCase();
      return options.filter((option) =>
        rules.every((rule) => matchesRule(option, normalizedQuery, rule)),
      );
    }

    const haystack = options.map(
      (option) => `${textForOption(option)} ${option.value}`,
    );
    const [indexes, info, order] = fuzzy.search(haystack, query);
    if (!indexes) return [];
    if (info && order)
      return order
        .map((orderIndex) => options[info.idx[orderIndex]])
        .filter((option): option is DunetaSelectSingleOption<T> =>
          Boolean(option),
        );
    return indexes
      .map((index) => options[index])
      .filter((option): option is DunetaSelectSingleOption<T> =>
        Boolean(option),
      );
  }, [enabledSearch, fuzzy, options, rules, searchQuery]);

  const rowVirtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => virtualConfig?.estimatedItemSize ?? 36,
    overscan: virtualConfig?.overscan ?? 8,
    enabled: Boolean(virtualConfig),
  });

  const clearSearch = useCallback(() => {
    setDebouncedSearchQuery.cancel();
    setInputQuery('');
    setSearchQuery('');
  }, [setDebouncedSearchQuery]);

  const commit = (key: Key | null) => {
    const next = key == null ? '' : (String(key) as T);
    if (next === '' && normalizedValue && !valueExists) return;
    if (next !== normalizedValue) onChange(next);
    clearSearch();
  };

  const renderItem = (
    option: DunetaSelectSingleOption<T>,
    style?: CSSProperties,
  ) => (
    <ListBox.Item
      key={option.value}
      id={option.value}
      isDisabled={option.isDisabled}
      textValue={textForOption(option) || option.value}
      className="min-w-0"
      style={style}
    >
      <span className="block min-w-0 truncate">{option.label}</span>
    </ListBox.Item>
  );

  return (
    <Select
      aria-label={accessibleName}
      className={[
        'min-w-0',
        fullWidth ? 'w-full' : 'w-fit max-w-full shrink-0',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      fullWidth={fullWidth}
      isDisabled={isDisabled}
      selectedKey={selectedKey}
      onSelectionChange={commit}
    >
      <Select.Trigger
        className={[
          'items-center gap-1.5',
          fullWidth ? 'min-w-0 w-full' : 'min-w-0 w-fit max-w-full',
        ].join(' ')}
      >
        <Select.Value
          className={['min-w-0 truncate text-start', fullWidth ? 'flex-1' : '']
            .filter(Boolean)
            .join(' ')}
        >
          {({ selectedText }) => selectedText || placeholder}
        </Select.Value>
        {allowClear ? (
          <span
            className="flex shrink-0 items-center justify-center"
            onPointerDown={(event) => event.stopPropagation()}
          >
            {selectedKey && !isDisabled ? (
              <span
                role="button"
                tabIndex={0}
                aria-label="Clear selection"
                className="inline-flex cursor-pointer rounded-md px-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  commit(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.stopPropagation();
                    commit(null);
                  }
                }}
              >
                ×
              </span>
            ) : (
              <span className="block w-5" aria-hidden />
            )}
          </span>
        ) : null}
        <Select.Indicator className="shrink-0" />
      </Select.Trigger>
      <Select.Popover className="min-w-[var(--trigger-width)] overflow-hidden rounded-lg">
        {enabledSearch ? (
          <div className="border-b border-zinc-200/70 p-2 dark:border-zinc-700/70">
            <Input
              aria-label={`Search ${accessibleName}`}
              placeholder={searchPlaceholder}
              value={inputQuery}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full"
            />
          </div>
        ) : null}
        {virtualConfig ? (
          <div
            ref={scrollRef}
            className="overflow-auto p-1"
            style={{ maxHeight: virtualConfig.maxHeight }}
          >
            <ListBox
              aria-label={accessibleName}
              className="relative w-full"
              style={{ height: rowVirtualizer.getTotalSize() }}
            >
              {rowVirtualizer.getVirtualItems().map((item) => {
                const option = filteredOptions[item.index];
                return option
                  ? renderItem(option, {
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${item.start}px)`,
                    })
                  : null;
              })}
            </ListBox>
          </div>
        ) : (
          <ListBox
            aria-label={accessibleName}
            className="max-h-72 overflow-auto p-1"
          >
            {filteredOptions.map((option) => renderItem(option))}
          </ListBox>
        )}
      </Select.Popover>
    </Select>
  );
}
