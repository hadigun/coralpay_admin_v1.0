import {
  assignPermissionToRole,
  createRole,
  deleteRole,
  getAllRoles,
  getRoleById,
  getRolePermissions,
  removePermissionFromRole,
  updateRole,
} from "@/app/apiService/roles";
import { useHandledMutation } from "@/hooks/useHandledMutation";
import { useHandledQuery } from "@/hooks/useHandledQuery";

/* ---------- Roles ---------- */

export const useGetAllRolesQuery = () =>
  useHandledQuery(["roles"], () => getAllRoles(), {
    refetchOnWindowFocus: false,
  });

export const useRoleByIdQuery = (id?: string) =>
  useHandledQuery(["role", id], () => getRoleById(id as string), {
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

export const useCreateRoleMutation = () =>
  useHandledMutation(
    (data: Record<string, any>) => createRole(data),
    "Role created",
    () => {},
    false
  );

export const useUpdateRoleMutation = () =>
  useHandledMutation(
    (payload: { id: string; data: Record<string, any> }) =>
      updateRole(payload.data, payload.id),
    "Role updated",
    () => {},
    false,
    () => {},
    ["roles"]
  );

export const useDeleteRoleMutation = () =>
  useHandledMutation(
    (id: string) => deleteRole(id),
    "Role deleted",
    () => {},
    false,
    () => {},
    ["roles"]
  );

export const useAssignPermissionToRoleMutation = () =>
  useHandledMutation(
    (payload: { roleId: string; permissionIds: string[] }) =>
      assignPermissionToRole(payload.permissionIds, payload.roleId),
    "Permissions assigned",
    () => {},
    false
  );

export const useRemovePermissionFromRoleMutation = () =>
  useHandledMutation(
    (payload: { roleId: string; permissionIds: string[] }) =>
      removePermissionFromRole(payload.permissionIds, payload.roleId),
    "Permissions removed",
    () => {},
    false
  );

export const useGetRolePermissionsQuery = (roleId: string) =>
  useHandledQuery(
    ["role-permissions", roleId],
    () => getRolePermissions(roleId as string),
    {
      enabled: !!roleId,
      refetchOnWindowFocus: false,
    }
  );
