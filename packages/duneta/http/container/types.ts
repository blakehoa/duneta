import type { ControllerContainer } from './controller-container.js';
import type { RepositoryContainer } from './repository-container.js';
import type { Database } from '../database/types.js';
import type { DunetaServerConfig } from '../../config/server/types.js';

export type ServiceRegistryContext = {
  controllers: ControllerContainer;
  repositories: RepositoryContainer;
  db: Database | null;
  config: DunetaServerConfig;
};

export type RegisterServices = (ctx: ServiceRegistryContext) => void;
