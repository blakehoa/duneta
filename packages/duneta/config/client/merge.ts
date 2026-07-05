export type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Deep-merge `patch` onto `base`. */
export function mergeConfig<T extends object>(base: T, patch?: DeepPartial<T>): T {
  if (!patch) return base;

  const result = { ...base };

  for (const key of Object.keys(patch) as (keyof T)[]) {
    const value = patch[key as keyof DeepPartial<T>];
    if (value === undefined) continue;

    const current = result[key];
    if (isPlainObject(current) && isPlainObject(value)) {
      result[key] = mergeConfig(current, value as DeepPartial<typeof current>);
      continue;
    }

    result[key] = value as T[typeof key];
  }

  return result;
}
