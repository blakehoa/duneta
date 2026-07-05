export type ToolbarLabeledOption = {
  label: string;
};

export function filterToolbarOptions<T extends ToolbarLabeledOption>(
  options: T[],
  query: string,
): T[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return options;

  return options.filter((option) =>
    option.label.toLowerCase().includes(normalized),
  );
}
