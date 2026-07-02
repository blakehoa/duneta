import { composeRouter, createUsersRoutes, healthRoutes, meRoutes } from 'duneta/server/routers';
import type { DunetaServerConfig } from 'duneta/server/configs';
import { imageMediaStorageRoutes } from './Controllers/MediaStorage/index.js';

export function createAppRouter(config: DunetaServerConfig) {
  void config;
  return composeRouter([
    healthRoutes,
    meRoutes,
    createUsersRoutes(),
    imageMediaStorageRoutes,
  ]);
}
