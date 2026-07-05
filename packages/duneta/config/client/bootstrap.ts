import { createDefaultConfig } from './defaults.js';
import { mergeConfig, type DeepPartial } from './merge.js';
import { commitConfig } from './registry.js';
import type { DunetaWebConfig } from './types.js';

/** Browser-safe — apply `duneta.client.config.ts` web patch without Node loaders. */
export function bootstrapConfig(patch: DeepPartial<DunetaWebConfig>): DunetaWebConfig {
  return commitConfig(mergeConfig(createDefaultConfig(), patch));
}
