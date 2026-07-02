export { createDefaultConfig } from './defaults';
export {
  CLIENT_CONFIG_FILENAME,
  defineClientConfig,
  loadConfig,
  toWebConfig,
} from './load';
export { mergeConfig, type DeepPartial } from './merge';
export { config, getConfig } from './registry';
export type { DunetaClientConfig } from './duneta';
export type {
  DunetaWebConfig,
  ImageConfig,
  LocaleConfig,
  DunetaThemeMode,
} from './types';
