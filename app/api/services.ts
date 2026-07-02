import { defineServices } from 'duneta/server/container';
import { HealthController, MeController, UserController } from 'duneta/server/http';
import { UserRepository } from 'duneta/server/repositories';
import { ImageMediaStorageController } from './Controllers/MediaStorage/index.js';

export const registerServices = defineServices({
  repositories: {
    UserRepository,
  },
  controllers: {
    HealthController,
    MeController,
    UserController: ({ repositories }) =>
      new UserController(repositories.resolve(UserRepository)),
    ImageMediaStorageController: ({ config }) =>
      new ImageMediaStorageController(config.storage),
  },
});
