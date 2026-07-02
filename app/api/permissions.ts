import type { PermissionResolver } from 'duneta/server/permissions';

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
