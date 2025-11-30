import {
  activateUser,
  assigPermissionToUser,
  deactivateUser,
  getAllUsers,
  getUserById,
  getUserPermissions,
  registerUser,
  removePermissionFromUser,
  suspendUser,
  updateUser,
} from "@/app/apiService/users";
import { useHandledMutation } from "@/hooks/useHandledMutation";
import { useHandledQuery } from "@/hooks/useHandledQuery";
import { UserFilters } from "@/lib/filter";

export const useGetUsersQuery = (filters?: UserFilters) =>
  useHandledQuery(["users", filters], () => getAllUsers(filters), {
    refetchOnWindowFocus: false,
  });

export const useRegisterUserMutation = () =>
  useHandledMutation(
    (data: {
      email: string;
      firstName: string;
      lastName: string;
      roleId: string;
      mobile: string;
      [k: string]: any;
    }) => registerUser(data),
    "User created",
    () => {},
    true
  );

export const useUpdateUserMutation = () =>
  useHandledMutation(
    (payload: { id: string; data: Record<string, any> }) =>
      updateUser(payload.data, payload.id),
    "User updated",
    () => {},
    true
  );

export const useUserByIdQuery = (id?: string) =>
  useHandledQuery(["user", id], () => getUserById(id as string), {
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

export const useAssignPermissionToUserMutation = () =>
  useHandledMutation(
    (payload: { id: string; permissionIds: string[] }) =>
      assigPermissionToUser(payload.permissionIds, payload.id),
    "Permissions assigned",
    () => {},
    false
  );

export const useRemovePermissionFromUserMutation = () =>
  useHandledMutation(
    (payload: { id: string; permissionIds: string[] }) =>
      removePermissionFromUser(payload.permissionIds, payload.id),
    "Permissions removed",
    () => {},
    false
  );

export const useGetUserPermissionsQuery = (id?: string) =>
  useHandledQuery(
    ["user-permissions", id],
    () => getUserPermissions(id as string),
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
    }
  );

export const useSuspendUserMutation = () =>
  useHandledMutation(
    (id: string) => suspendUser(id),
    "User suspended",
    () => {},
    false
  );

export const useActivateUserMutation = () =>
  useHandledMutation(
    (id: string) => activateUser(id),
    "User activated",
    () => {},
    false
  );

export const useDeactivateUserMutation = () =>
  useHandledMutation(
    (id: string) => deactivateUser(id),
    "User deactivated",
    () => {},
    false
  );
