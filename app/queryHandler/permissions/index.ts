/* ---------- Permissions ---------- */

import {
  createPermission,
  deletePermission,
  getAllPermissions,
  getPermissionById,
} from "@/app/apiService/permissions";
import { useHandledMutation } from "@/hooks/useHandledMutation";
import { useHandledQuery } from "@/hooks/useHandledQuery";

export const useGetPermissionsQuery = () =>
  useHandledQuery(["permissions"], () => getAllPermissions(), {
    refetchOnWindowFocus: false,
  });

export const usePermissionByIdQuery = (id?: string) =>
  useHandledQuery(["permission", id], () => getPermissionById(id as string), {
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

export const useCreatePermissionMutation = () =>
  useHandledMutation(
    (data: Record<string, any>) => createPermission(data),
    "Permission created",
    () => {},
    false
  );

export const useDeletePermissionMutation = () =>
  useHandledMutation(
    (id: string) => deletePermission(id),
    "Permission deleted",
    () => {},
    false
  );
