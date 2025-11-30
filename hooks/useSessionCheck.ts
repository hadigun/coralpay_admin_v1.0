// "use client";

// import {
//   useLogoutMutation,
//   useRefreshTokenMutation,
// } from "@/app/queryHandler/auth";
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import { logoutUser, setUser } from "@/store/slice/userService/userService";
// import { getTokenExpiry } from "@/utils/tokenHelpers";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";
// import { toast } from "sonner";

// export const useSessionCheck = () => {
//   const router = useRouter();
//   const dispatch = useAppDispatch();

//   const { user } = useAppSelector((s) => s.userService);
//   const { isAuthenticated, accessToken, refreshToken, expiresIn } = user || {};

//   const { mutateAsync: refresh } = useRefreshTokenMutation();
//   const { mutateAsync: apiLogout } = useLogoutMutation();

//   useEffect(() => {
//     if (!isAuthenticated || !expiresIn) return;

//     const now = Date.now();
//     const ttlMs = new Date(expiresIn).getTime();
//     const jwtExpMs = accessToken ? getTokenExpiry(accessToken) : null;

//     // Hard stop if ttl already elapsed
//     if (ttlMs <= now) {
//       (async () => {
//         try {
//           if (refreshToken) await apiLogout({ refreshToken });
//         } finally {
//           dispatch(logoutUser());
//           toast.warning("Session expired. Please log in.");
//           router.push("/login");
//         }
//       })();
//       return;
//     }

//     // Compute the next refresh moment: 2 minutes before the earlier of (jwtExp, ttl)
//     const candidateExp = jwtExpMs ?? ttlMs; // if no JWT exp, fall back to ttl
//     const refreshAt = Math.min(candidateExp, ttlMs) - 2 * 60 * 1000;
//     const refreshDelay = refreshAt - now;

//     let refreshTimer: ReturnType<typeof setTimeout> | null = null;
//     let ttlTimer: ReturnType<typeof setTimeout> | null = null;

//     if (refreshToken && refreshDelay > 0) {
//       refreshTimer = setTimeout(async () => {
//         try {
//           const res = await refresh({ refreshToken });
//           const { accessToken: newAccess, refreshToken: newRefresh } = res.data;

//           // Recompute exp; ttl remains the hard cap unless your backend extends it
//           const newExp = getTokenExpiry(newAccess);

//           dispatch(
//             setUser({
//               ...user,
//               isAuthenticated: true,
//               accessToken: newAccess,
//               refreshToken: newRefresh,
//               // keep ttl as-is if your session is fixed-length;
//               // if backend returns a new ttl, update it here instead.
//             })
//           );

//           toast.success("Session refreshed.");
//         } catch {
//           try {
//             if (refreshToken) await apiLogout({ refreshToken });
//           } finally {
//             dispatch(logoutUser());
//             toast.warning("Session expired. Please log in.");
//             router.push("/login");
//           }
//         }
//       }, refreshDelay);
//     }

//     // Enforce hard session end at ttl
//     const ttlDelay = ttlMs - now;
//     ttlTimer = setTimeout(async () => {
//       try {
//         if (refreshToken) await apiLogout({ refreshToken });
//       } finally {
//         dispatch(logoutUser());
//         toast.warning("Session expired. Please log in.");
//         router.push("/login");
//       }
//     }, ttlDelay);

//     return () => {
//       if (refreshTimer) clearTimeout(refreshTimer);
//       if (ttlTimer) clearTimeout(ttlTimer);
//     };
//   }, [
//     isAuthenticated,
//     accessToken,
//     refreshToken,
//     expiresIn,
//     refresh,
//     apiLogout,
//     dispatch,
//     router,
//   ]);
// };
"use client";

import {
  useLogoutMutation,
  useRefreshTokenMutation,
} from "@/app/queryHandler/auth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser, setUser } from "@/store/slice/userService/userService";
import { getTokenExpiry } from "@/utils/tokenHelpers";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

export const useSessionCheck = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((s) => s.userService);
  const { isAuthenticated, accessToken, refreshToken, expiresIn } = user || {};

  const { mutateAsync: refresh, data: refreshData } = useRefreshTokenMutation();
  const { mutate: apiLogout } = useLogoutMutation();

  const isRefreshing = useRef(false);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ttlTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoggedOut = useRef(false);

  const isDuration = (value: number) => value < 100000000000;

  const performLogout = useCallback(
    async (token?: string) => {
      if (hasLoggedOut.current) return;
      hasLoggedOut.current = true;

      try {
        if (token) apiLogout({ refreshToken: token });
      } catch (error) {
        console.error("Logout failed:", error);
      } finally {
        dispatch(logoutUser());
        toast.warning("Session expired. Please log in.");
        // router.push("/login");
      }
    },
    [apiLogout, dispatch, router]
  );

  // Stable refresh function that uses current state
  const performRefresh = useCallback(
    async (currentRefreshToken: string) => {
      if (isRefreshing.current) {
        console.log("Already refreshing, skipping...");
        return;
      }

      isRefreshing.current = true;
      console.log("Attempting token refresh...");

      try {
        const response = await refresh({ refreshToken: currentRefreshToken });
        const refreshTokenData = response?.data?.data;

        if (!refreshTokenData) {
          console.error("No data returned from refresh");
          return;
        }

        const {
          accessToken: newAccess,
          refreshToken: newRefresh,
          expiresIn: newExpiresIn,
        } = refreshTokenData;

        // Get the latest user state from Redux
        dispatch((dispatch, getState) => {
          const currentUser = getState().userService.user;

          dispatch(
            setUser({
              ...currentUser,
              isAuthenticated: true,
              accessToken: newAccess,
              refreshToken: newRefresh,
              expiresIn: newExpiresIn,
            })
          );
        });

        toast.success("Session refreshed.");
      } catch (error) {
        console.error("Token refresh failed:", error);
        await performLogout(currentRefreshToken);
      } finally {
        isRefreshing.current = false;
      }
    },
    [refresh, dispatch, performLogout]
  );

  useEffect(() => {
    // Clear any existing timers when effect runs
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (ttlTimerRef.current) {
      clearTimeout(ttlTimerRef.current);
      ttlTimerRef.current = null;
    }

    // Reset logout flag when starting new session
    hasLoggedOut.current = false;

    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting to login");
      // router.push("/login");
      return;
    }

    if (!expiresIn || !refreshToken) {
      console.log("Missing expiresIn or refreshToken");
      return;
    }

    const now = Date.now();
    let ttlMs;

    try {
      const expiresInNumber = Number(expiresIn);

      if (isDuration(expiresInNumber)) {
        ttlMs = now + expiresInNumber * 1000;
        console.warn(
          "ExpiresIn was a duration; calculated absolute expiry time in ms."
        );

        dispatch(
          setUser({
            ...user,
            expiresIn: ttlMs,
          })
        );
        return; // Exit and let the effect re-run with the updated expiresIn
      } else {
        ttlMs = new Date(expiresIn).getTime();
      }
    } catch (e) {
      console.error("Failed to parse expiresIn:", e);
      return;
    }

    const jwtExpMs = accessToken ? getTokenExpiry(accessToken) : null;

    console.log("=== Session Check ===");
    console.log("Current time:", new Date(now).toISOString());
    console.log("TTL Expiry:", new Date(ttlMs).toISOString(), `(${ttlMs}ms)`);
    console.log(
      "JWT Expiry:",
      jwtExpMs ? new Date(jwtExpMs).toISOString() : "N/A",
      jwtExpMs ? `(${jwtExpMs}ms)` : ""
    );

    // If already expired, logout immediately
    if (ttlMs <= now) {
      console.log("Session already expired, logging out immediately");
      performLogout(refreshToken);
      return;
    }

    // Calculate when to refresh (2 minutes before expiry, or earlier if needed)
    const candidateExp = jwtExpMs ?? ttlMs;
    const REFRESH_BUFFER = 2 * 60 * 1000; // 2 minutes
    const refreshAt = Math.min(candidateExp, ttlMs) - REFRESH_BUFFER;
    const refreshDelay = Math.max(0, refreshAt - now); // Ensure non-negative

    // Set refresh timer
    if (refreshDelay > 0) {
      const refreshTime = new Date(now + refreshDelay).toISOString();
      console.log(
        `Setting refresh timer for ${Math.round(
          refreshDelay / 1000
        )}s (at ${refreshTime})`
      );

      refreshTimerRef.current = setTimeout(() => {
        console.log("Refresh timer triggered");
        performRefresh(refreshToken);
      }, refreshDelay);
    } else {
      // Token is about to expire or already in refresh window
      console.log(
        "Token needs immediate refresh (refreshDelay:",
        refreshDelay,
        "ms)"
      );
      performRefresh(refreshToken);
    }

    // Set TTL (hard expiry) timer
    const ttlDelay = ttlMs - now;
    if (ttlDelay > 0) {
      const ttlTime = new Date(ttlMs).toISOString();
      console.log(
        `Setting TTL timer for ${Math.round(ttlDelay / 1000)}s (at ${ttlTime})`
      );

      ttlTimerRef.current = setTimeout(() => {
        console.log("TTL timer triggered - session expired");
        performLogout(refreshToken);
      }, ttlDelay);
    }

    // Cleanup function
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      if (ttlTimerRef.current) {
        clearTimeout(ttlTimerRef.current);
        ttlTimerRef.current = null;
      }
    };
  }, [
    isAuthenticated,
    accessToken,
    refreshToken,
    expiresIn,
    performRefresh,
    performLogout,
    router,
    dispatch,
    user,
  ]);
};
