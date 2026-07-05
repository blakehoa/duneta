import { defineServices } from 'duneta/http/container';
import { HealthController, MeController, UserController } from 'duneta/http';
import type { PermissionResolver } from 'duneta/permission';
import { UserRepository } from 'duneta/http/repositories';

export const registerServices = defineServices({
  repositories: {
    UserRepository,
  },
  controllers: {
    HealthController,
    MeController,
    UserController: ({ repositories }) =>
      new UserController(repositories.resolve(UserRepository)),
  },
});

export const resolvePermissions: PermissionResolver = async ({ userId }) => ({
  userId,
  roles: [],
  grants: [],
});
