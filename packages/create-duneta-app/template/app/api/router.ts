import { composeRouter, healthRoutes } from 'duneta/server/routers';
import type { DunetaServerConfig } from 'duneta/server/configs';

export function createAppRouter(config: DunetaServerConfig) {
  void config;
  return composeRouter([healthRoutes]);
}
