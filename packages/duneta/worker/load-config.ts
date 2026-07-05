import {
  createDefaultConfig,
  mergeConfig,
  type DeepPartial,
  type DunetaServerConfig,
} from '../config/server/index.js';
import { commitConfig } from '../config/server/registry.js';

const SERVER_KEYS = [
  'runtime',
  'app',
  'database',
  'auth',
  'locale',
  'timezone',
  'request',
  'headers',
  'cache',
  'storage',
  'security',
  'logging',
  'cron',
  'image',
  'debug',
] as const satisfies readonly (keyof DunetaServerConfig)[];

function pickServerPatch(source: Record<string, unknown>): DeepPartial<DunetaServerConfig> {
  const patch: Record<string, unknown> = {};
  for (const key of SERVER_KEYS) {
    const value = source[key];
    if (value !== undefined) patch[key] = value;
  }
  return patch as DeepPartial<DunetaServerConfig>;
}

function runtimeAppEnv(): 'development' | 'production' {
  return process.env.NODE_ENV === 'production' ? 'production' : 'development';
}

function applyRuntimeAppDefaults(
  patch: DeepPartial<DunetaServerConfig>,
): DeepPartial<DunetaServerConfig> {
  if (patch.app?.env !== undefined) return patch;
  return { ...patch, app: { ...patch.app, env: runtimeAppEnv() } };
}

/**
 * Load `./config/server.ts` (or `.js`) from the project root,
 * merge defaults, commit — secrets from `process.env`.
 */
export async function loadServerConfig(): Promise<DunetaServerConfig> {
  // @ts-expect-error — Vite virtual module (dunetaWorkerPlugin → ./config/server)
  const mod = (await import('virtual:duneta/server-config')) as {
    default?: DeepPartial<DunetaServerConfig>;
  };
  const patch = applyRuntimeAppDefaults(pickServerPatch(mod.default ?? {}));
  return commitConfig(
    mergeConfig(createDefaultConfig(), { ...patch, runtime: { target: 'worker' } }),
  );
}
