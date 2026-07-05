import type { DeepPartial } from './merge';
import type { DunetaThemeConfig, DunetaWebConfig } from './types';
import { DUNETA_THEME_MODES_DEFAULT } from './types';

export const CLIENT_CONFIG_FILENAME = 'config/client.ts';

const WEB_KEYS = ['app', 'api', 'theme', 'locale', 'router', 'image'] as const satisfies readonly (keyof DunetaWebConfig)[];

/** Web sections — `config/client.ts` (Vite / React Router only). */
export type DunetaClientConfig<
  TModes extends readonly string[] = typeof DUNETA_THEME_MODES_DEFAULT,
> = DeepPartial<Omit<DunetaWebConfig, 'theme'>> & {
  theme?: Partial<DunetaThemeConfig<TModes>>;
};

export function defineClientConfig<
  const TModes extends readonly string[] = typeof DUNETA_THEME_MODES_DEFAULT,
>(config?: DunetaClientConfig<TModes>): DunetaClientConfig<TModes> {
  return (config ?? {}) as DunetaClientConfig<TModes>;
}

function pickKeys<T extends object, const K extends readonly (keyof T)[]>(
  source: Record<string, unknown>,
  keys: K,
): DeepPartial<T> {
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    const value = source[key as string];
    if (value !== undefined) result[key as string] = value;
  }
  return result as DeepPartial<T>;
}

export function toWebConfig(config: DunetaClientConfig): DeepPartial<DunetaWebConfig> {
  return pickKeys<DunetaWebConfig, typeof WEB_KEYS>(config, WEB_KEYS);
}
