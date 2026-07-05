import type { DunetaServerConfig } from './types';

let cachedConfig: DunetaServerConfig | undefined;

/** Internal — set by Worker boot via `loadServerConfig`, not re-exported from the package barrel. */
export function commitConfig<T extends DunetaServerConfig>(config: T): T {
  cachedConfig = config;
  return config;
}

export function getConfig<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- default: no app-specific config extensions
  TExtra extends Record<string, unknown> = {},
  TDatabase extends DunetaServerConfig['database'] = DunetaServerConfig['database'],
>(): DunetaServerConfig<TExtra, TDatabase> {
  if (!cachedConfig) {
    throw new Error(
      'Server config is not loaded. Add config/server.ts at the project root.',
    );
  }
  return cachedConfig as unknown as DunetaServerConfig<TExtra, TDatabase>;
}

export const config = new Proxy({} as DunetaServerConfig, {
  get(_target, prop) {
    return getConfig()[prop as keyof DunetaServerConfig];
  },
});
