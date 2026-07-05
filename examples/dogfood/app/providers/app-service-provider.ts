import { defineServices } from 'duneta/http/container';
import { HealthController, MeController, UserController } from 'duneta/http';
import type { PermissionResolver } from 'duneta/permission';
import { UserRepository } from 'duneta/http/repositories';
import { ImageMediaStorageController } from '../http/controllers/media-storage/index.js';

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

const ROLE_GRANTS: Record<string, readonly string[]> = {
  admin: ['*'],
  member: ['users.read:self'],
  viewer: ['users.read'],
};

async function resolveRoles(userId: string) {
  void userId;
  // TODO: load from DB when roles are persisted.
  return ['member'] as const;
}

export const resolvePermissions: PermissionResolver = async ({ userId }) => {
  const roles = await resolveRoles(userId);
  const grants = [...new Set(roles.flatMap((role) => ROLE_GRANTS[role] ?? []))];

  return { userId, roles: [...roles], grants };
};
