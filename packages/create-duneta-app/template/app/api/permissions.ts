import type { PermissionResolver } from 'duneta/server/permissions';

export const resolvePermissions: PermissionResolver = async ({ userId }) => ({
  userId,
  roles: [],
  grants: [],
});
