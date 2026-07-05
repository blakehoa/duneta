import type { Config } from '@react-router/dev/config';
import type { DunetaWebConfig } from './types.js';

export function createReactRouterConfig(webConfig: DunetaWebConfig): Config {
  return {
    appDirectory: webConfig.router.appDirectory,
    buildDirectory: webConfig.router.buildDirectory,
    ssr: true,
  };
}
