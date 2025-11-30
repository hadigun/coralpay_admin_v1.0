"use client";

import { useMerchantApi } from "@/app/apiService/merchants";
import {
  assignRolePermissionToMerchant,
  createMerchantRole,
  getMerchantRoleById,
  removeRolePermissionFromMerchant,
} from "@/app/apiService/permissions";
import { useHandledMutation } from "@/hooks/useHandledMutation";
import { useHandledQuery } from "@/hooks/useHandledQuery";
import { MerchantFilters, UserFilters } from "@/lib/filter";

/* ---------- Merchant Queries ---------- */
export const useGetMerchantsQuery = (filters?: MerchantFilters) => {
  const { getAllMerchants } = useMerchantApi();
  return useHandledQuery(
    ["merchants", filters],
    () => getAllMerchants(filters),
    {
      refetchOnWindowFocus: false,
    }
  );
};

export const useGetMerchantByIdQuery = (merchantId?: string) => {
  const { getMerchantById } = useMerchantApi();
  return useHandledQuery(
    ["merchant", merchantId],
    () => getMerchantById(merchantId!),
    {
      enabled: !!merchantId,
      refetchOnWindowFocus: false,
    }
  );
};

export const useCreateMerchantMutation = () => {
  const { createMerchant } = useMerchantApi();
  return useHandledMutation(
    (data: Record<string, any>) => createMerchant(data),
    "Merchant created",
    () => {},
    false
  );
};

/* ---------- Merchant Users ---------- */
export const useGetMerchantUsersQuery = (filters?: UserFilters) => {
  const { getMerchantUsers } = useMerchantApi();
  return useHandledQuery(
    ["merchant-users", filters],
    () => getMerchantUsers(filters),
    {
      refetchOnWindowFocus: false,
    },
    false
  );
};

export const useGetMerchantUserByIdQuery = (userId?: string) => {
  const { getMerchantUserById } = useMerchantApi();
  return useHandledQuery(
    ["merchant-user", userId],
    () => getMerchantUserById(userId!),
    {
      enabled: !!userId,
      refetchOnWindowFocus: false,
    }
  );
};

export const useCreateMerchantUserMutation = () => {
  const { createMerchantUser } = useMerchantApi();
  return useHandledMutation(
    (data: Record<string, any>) => createMerchantUser(data),
    "Merchant user created",
    () => {},
    false
  );
};

export const useUpdateMerchantUserMutation = (userId: string) => {
  const { updateMerchantUser } = useMerchantApi();
  return useHandledMutation(
    (data: Record<string, any>) => updateMerchantUser(userId, data),
    "Merchant user updated",
    () => {},
    false
  );
};

export const useGetMerchantUserPermissionsQuery = (userId: string) => {
  const { getMerchantUserPermissions } = useMerchantApi();

  return useHandledQuery(
    ["merchant-user-permissions", userId],
    () => getMerchantUserPermissions(userId as string),
    {
      enabled: !!userId,
      refetchOnWindowFocus: false,
    }
  );
};

export const useAssignPermissionToMerchantUserMutation = (userId: string) => {
  const { assignPermissionToMerchantUser } = useMerchantApi();
  return useHandledMutation(
    (data: any) => assignPermissionToMerchantUser(userId, data),
    "Permissions assigned",
    () => {},
    true
  );
};

export const useRemovePermissionFromMerchantUserMutation = (userId: string) => {
  const { removePermissionFromMerchantUser } = useMerchantApi();
  return useHandledMutation(
    (data: any) => removePermissionFromMerchantUser(userId, data),
    "Permissions removed",
    () => {},
    true
  );
};

export const useActivateMerchantUserMutation = () => {
  const { activateMerchantUser } = useMerchantApi();
  return useHandledMutation(
    (userId: string) => activateMerchantUser(userId),
    "Merchant user activated",
    () => {},
    true,
    () => {},
    ["merchant-users"]
  );
};

export const useDeactivateMerchantUserMutation = () => {
  const { deactivateMerchantUser } = useMerchantApi();
  return useHandledMutation(
    (userId: string) => deactivateMerchantUser(userId),
    "Merchant user deactivated",
    () => {},
    true,
    () => {},
    ["merchant-users"]
  );
};

export const useSuspendMerchantUserMutation = () => {
  const { suspendMerchantUser } = useMerchantApi();
  return useHandledMutation(
    (userId: string) => suspendMerchantUser(userId),
    "Merchant user suspended",
    () => {},
    true,
    () => {},
    ["merchant-users"]
  );
};

export const useGetMerchantPermissionsQuery = (merchantId?: string) => {
  const { getMerchantPermissions } = useMerchantApi();
  return useHandledQuery(
    ["merchant-permissions"],
    () => getMerchantPermissions(merchantId),
    {
      refetchOnWindowFocus: false,
    }
  );
};

export const useGetMerchantRolePermissionsQuery = (roleId: string) => {
  const { getMerchantRolePermissions } = useMerchantApi();

  return useHandledQuery(
    ["merchant-role-permissions", roleId],
    () => getMerchantRolePermissions(roleId as string),
    {
      enabled: !!roleId,
      refetchOnWindowFocus: false,
    }
  );
};

export const useUpdateMerchantRoleMutation = (roleId: string) => {
  const { updateMerchantRole } = useMerchantApi();

  return useHandledMutation(
    (data: any) => updateMerchantRole(roleId, data),
    "Merchant user suspended",
    () => {},
    true,
    () => {},
    ["merchant-users"]
  );
};

export const useDeleteMerchantRoleMutation = () => {
  const { deleteMerchantRole } = useMerchantApi();

  return useHandledMutation(
    (roleId: string) => deleteMerchantRole(roleId),
    "Merchant role deleted",
    () => {},
    false
  );
};

export const useGetMerchantRolesQuery = (merchantId?: string) => {
  const { getMerchantRoles } = useMerchantApi();
  return useHandledQuery(
    ["merchant-roles", merchantId],
    () => getMerchantRoles(),
    {
      refetchOnWindowFocus: false,
    }
  );
};

export const useGetMerchantRoleByIdQuery = (
  merchantId?: string,
  roleId?: string
) =>
  useHandledQuery(
    ["merchant-role", merchantId, roleId],
    () => getMerchantRoleById(merchantId as string, roleId as string),
    { enabled: !!merchantId && !!roleId, refetchOnWindowFocus: false }
  );

export const useCreateMerchantRoleMutation = (merchantId: string) =>
  useHandledMutation(
    (data: Record<string, any>) => createMerchantRole(merchantId, data),
    "Merchant role created",
    () => {},
    false
  );

export const useAssignPermissionToMerchantRoleMutation = (
  merchantId: string,
  roleId: string
) =>
  useHandledMutation(
    (data: { permissionIds: string[] } & Record<string, any>) =>
      assignRolePermissionToMerchant(merchantId, roleId, data),
    "Permissions assigned",
    () => {},
    false
  );

export const useRemovePermissionFromMerchantRoleMutation = (
  merchantId: string,
  roleId: string
) =>
  useHandledMutation(
    (data: { permissionIds: string[] } & Record<string, any>) =>
      removeRolePermissionFromMerchant(merchantId, roleId, data),
    "Permissions removed",
    () => {},
    false
  );

// export const useGetMerchantRolePermissionsQuery = (
//   merchantId?: string,
//   roleId?: string
// ) =>
//   useHandledQuery(
//     ["merchant-role-permissions", merchantId, roleId],
//     () => getMerchantRolePermissions(merchantId as string, roleId as string),
//     { enabled: !!merchantId && !!roleId, refetchOnWindowFocus: false }
//   );
