import axiosClient from '@api/axiosClient';

/**
 * Admin roles & permissions API (`/api/v1/admin/roles`, `/admin/permissions`).
 */
export const rolesService = {
  /**
   * Lists all platform roles with permissions and user counts.
   */
  listRoles: async () => {
    const response = await axiosClient.get('/admin/roles');
    return response.data;
  },

  /**
   * Fetches a single role by numeric Spatie role id.
   * @param roleId - Integer role id (see Postman variable `role_id`)
   */
  getRole: async (roleId: number | string) => {
    const response = await axiosClient.get(`/admin/roles/${roleId}`);
    return response.data;
  },

  /**
   * Replaces all permissions on a role (super-admin only).
   * @param roleId - Spatie role id
   * @param permissions - Permission name strings e.g. `users.view`
   */
  syncRolePermissions: async (roleId: number | string, permissions: string[]) => {
    const response = await axiosClient.put(`/admin/roles/${roleId}/permissions`, { permissions });
    return response.data;
  },

  /**
   * Lists all permissions grouped by domain.
   */
  listPermissions: async () => {
    const response = await axiosClient.get('/admin/permissions');
    return response.data;
  },
};
