import type { ControllerContainer } from './controller-container.js';
import type { RepositoryContainer } from './repository-container.js';
import type { Database } from '../database/types.js';
import type { DunetaServerConfig } from '../../config/server/types.js';

export type ServiceRegistryContext = {
  controllers: ControllerContainer;
  repositories: RepositoryContainer;
  db: Database | null;
  /** All Hyperdrive-backed connections keyed by config name. */
  databases: Record<string, Database>;
  config: DunetaServerConfig;
};

export type RegisterServices = (ctx: ServiceRegistryContext) => void;
