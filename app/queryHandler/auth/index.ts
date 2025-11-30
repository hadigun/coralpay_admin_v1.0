import {
  getCurrentUser,
  login,
  logoutUser,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  verifyResetToken,
} from "@/app/apiService/auth";
import { useHandledMutation } from "@/hooks/useHandledMutation";
import { useHandledQuery } from "@/hooks/useHandledQuery";
import { useAppSelector } from "@/store/hooks";

// If you have a service for /v1/auth/me, import it.
// Example:
// import { getCurrentUser } from "@/app/apiService/userService";

// ---------------------------
// Types (aligned with OpenAPI)
// ---------------------------

export interface LoginFormData {
  email: string;
  password: string;
}

export interface PasswordResetRequestData {
  email: string;
}

export interface VerifyResetTokenData {
  code: string;
  sessionKey: string;
}

export interface ResetPasswordData {
  password: string;
  passwordResetKey: string;
}

export interface RefreshTokenBody {
  refreshToken: string;
}

export interface LogoutBody {
  refreshToken: string;
}

// ---------------------------
// Mutations
// ---------------------------

export const useLoginMutation = () =>
  useHandledMutation(
    (data: LoginFormData) => login(data),
    "Login successful",
    () => {}
  );

export const usePasswordResetRequestMutation = () =>
  useHandledMutation(
    (data: PasswordResetRequestData) => requestPasswordReset(data),
    "Password reset email sent",
    () => {}
  );

export const useVerifyResetTokenMutation = () =>
  useHandledMutation(
    (data: VerifyResetTokenData) => verifyResetToken(data),
    "Verification successful",
    () => {}
  );

export const useResetPasswordMutation = () =>
  useHandledMutation(
    (data: ResetPasswordData) => resetPassword(data),
    "Password reset successful",
    () => {}
  );

export const useRefreshTokenMutation = () =>
  useHandledMutation(
    (data: RefreshTokenBody) => refreshToken(data),
    "Session refreshed",
    () => {}
  );

export const useLogoutMutation = () =>
  useHandledMutation(
    (data: LogoutBody) => logoutUser(data),
    "Logged out successfully",
    () => {}
  );

// ---------------------------
// Queries
// ---------------------------

// If you expose GET /v1/auth/me as `getCurrentUser`, uncomment:
// export const useCurrentUserQuery = () =>
//   useHandledQuery(["currentUser"], () => getCurrentUser(), {
//     refetchOnWindowFocus: false,
//     staleTime: 5 * 60 * 1000,
//   });
export const useCurrentUser = () => {
  const user = useAppSelector((state) => state.userService.user);

  const { id, isAuthenticated } = user;

  return useHandledQuery(
    ["currentUser"],
    () => getCurrentUser(), // Your API call
    {
      // enabled: isAuthenticated,
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    },
    false
  );
};

// Custom hook with computed values
export const useUserProfile = () => {
  const { data, isLoading, error } = useCurrentUser();

  const user = data?.data.data;
  console.log(user);

  return {
    user,
    isLoading,
    error,

    // Computed values
    id: user?.id,
    firstName: user?.firstName,
    lastName: user?.lastName,
    fullName: user ? `${user.firstName} ${user.lastName}` : "",
    email: user?.email,
    mobile: user?.mobile,

    isMerchant: !!user?.merchant,
    isOwner: !user?.merchant,
    merchantId: user?.merchant?.id,
    merchantName: user?.merchant?.name,
    roleName: user?.role?.name,
    roleId: user?.role?.id,

    // Permissions as a Set for fast lookup
    permissions: new Set(
      [
        ...(user?.rolePermissions || []),
        ...(user?.directPermissions || []),
      ].map((p) => p.name)
    ),

    // Permission checker
    hasPermission: (permission: string) => {
      const allPermissions = [
        ...(user?.rolePermissions || []),
        ...(user?.directPermissions || []),
      ];
      return allPermissions.some((p) => p.name === permission);
    },

    // Check multiple permissions (AND)
    hasAllPermissions: (...permissions: string[]) => {
      const allPermissions = new Set(
        [
          ...(user?.rolePermissions || []),
          ...(user?.directPermissions || []),
        ].map((p) => p.name)
      );
      return permissions.every((p) => allPermissions.has(p));
    },

    // Check multiple permissions (OR)
    hasAnyPermission: (...permissions: string[]) => {
      const allPermissions = new Set(
        [
          ...(user?.rolePermissions || []),
          ...(user?.directPermissions || []),
        ].map((p) => p.name)
      );
      return permissions.some((p) => allPermissions.has(p));
    },
  };
};
