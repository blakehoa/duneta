import type {
  ResolvedDunetaDataTableToolbarConfig,
  DunetaDataTableToolbarConfig,
  DunetaDataTableToolbarFeatureConfig,
} from '../types/toolbar';

function resolveFeature<T extends object>(
  value: DunetaDataTableToolbarFeatureConfig<T> | undefined,
  fallback: T,
): T | null {
  if (value === false) return null;
  if (value === true || value === undefined) return fallback;
  return value;
}

export function resolveToolbarConfig(
  toolbar: boolean | DunetaDataTableToolbarConfig | false | null | undefined,
): ResolvedDunetaDataTableToolbarConfig | null {
  if (toolbar === false || toolbar == null) return null;

  const config = toolbar === true ? {} : toolbar;

  return {
    search: resolveFeature(config.search, {}),
    filter: resolveFeature(config.filter, {}),
    group: resolveFeature(config.group, {}),
    column: resolveFeature(config.column, {}),
  };
}

export function isToolbarEnabled(
  toolbar: ResolvedDunetaDataTableToolbarConfig | null,
): boolean {
  if (!toolbar) return false;
  return Boolean(
    toolbar.search || toolbar.filter || toolbar.group || toolbar.column,
  );
}
