import { useAppSelector } from "@/store/hooks";

export const usePermissions = () => {
  const user = useAppSelector((state) => state.userService.user);

  const allPermissions = [
    ...(user.rolePermissions || []),
    ...(user.directPermissions || []),
  ];

  const permissionSet = new Set(allPermissions.map((p) => p.name));

  return {
    hasPermission: (permission: string) => permissionSet.has(permission),
    hasAllPermissions: (...permissions: string[]) =>
      permissions.every((p) => permissionSet.has(p)),
    hasAnyPermission: (...permissions: string[]) =>
      permissions.some((p) => permissionSet.has(p)),
    permissions: allPermissions,
  };
};
