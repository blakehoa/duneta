import { access } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  CLIENT_CONFIG_FILENAME,
  toWebConfig,
  type DunetaClientConfig,
} from './duneta';
import { createDefaultConfig } from './defaults';
import { mergeConfig, type DeepPartial } from './merge';
import { commitConfig } from './registry';
import type { DunetaWebConfig } from './types';

export { CLIENT_CONFIG_FILENAME, defineClientConfig, toWebConfig } from './duneta';
export type { DunetaClientConfig } from './duneta';

async function loadClientConfigFile(cwd: string): Promise<DunetaClientConfig> {
  const configPath = join(cwd, CLIENT_CONFIG_FILENAME);

  try {
    await access(configPath);
  } catch {
    return {};
  }

  const configModule = await import(
    /* @vite-ignore */ pathToFileURL(configPath).href
  );
  return configModule.default ?? {};
}

/** Merge `config/client.ts` onto web defaults (Vite / sync only — no server secrets). */
export async function loadConfig(
  cwd: string,
  overrides?: DeepPartial<DunetaWebConfig>,
): Promise<DunetaWebConfig> {
  const file = await loadClientConfigFile(cwd);
  const patch = overrides ?? toWebConfig(file);
  return commitConfig(mergeConfig(createDefaultConfig(), patch));
}
