// import Axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
// import { API_BASE_URL, sessionStorageName } from "../config";

// interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
//   requiresAuth?: boolean;
// }

// const axiosInstance: AxiosInstance = Axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 60000,
// });

// axiosInstance.interceptors.request.use(
//   (config: CustomAxiosRequestConfig) => {
//     if (typeof window !== "undefined" && config.requiresAuth !== false) {
//       const storedSession = sessionStorage.getItem(sessionStorageName);
//       if (storedSession) {
//         try {
//           const { accessToken } = JSON.parse(storedSession);
//           if (accessToken) {
//             config.headers.Authorization = `Bearer ${accessToken}`;
//           }
//         } catch (err) {
//           console.error("Invalid session token format in sessionStorage");
//         }
//       }
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// const axios = (url?: string): AxiosInstance => {
//   if (url) {
//     axiosInstance.defaults.baseURL = `${API_BASE_URL}${url}`;
//   }
//   return axiosInstance;
// };

// export const AxiosObject = axiosInstance;
// export default axios;

import { store } from "@/store"; // Import your Redux store
import {
  logoutUser,
  updateTokens,
} from "@/store/slice/userService/userService";
import Axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, sessionStorageName } from "../config";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  requiresAuth?: boolean;
}

const axiosInstance: AxiosInstance = Axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

// Helper to get token from Redux or sessionStorage
const getAccessToken = (): string | null => {
  // Try Redux store first
  const state = store.getState();
  const token = state.userService.user.accessToken;

  if (token) return token;

  // Fallback to sessionStorage
  if (typeof window !== "undefined") {
    const storedSession = sessionStorage.getItem(sessionStorageName);
    if (storedSession) {
      try {
        const { accessToken } = JSON.parse(storedSession);
        return accessToken || null;
      } catch (err) {
        console.error("Invalid session token format in sessionStorage");
      }
    }
  }

  return null;
};

// Helper to get refresh token
const getRefreshToken = (): string | null => {
  const state = store.getState();
  const token = state.userService.user.refreshToken;

  if (token) return token;

  if (typeof window !== "undefined") {
    const storedSession = sessionStorage.getItem(sessionStorageName);
    if (storedSession) {
      try {
        const { refreshToken } = JSON.parse(storedSession);
        return refreshToken || null;
      } catch (err) {
        console.error("Invalid session token format");
      }
    }
  }

  return null;
};

// Request interceptor - Add token
axiosInstance.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    if (config.requiresAuth !== false) {
      const accessToken = getAccessToken();

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle 401 & refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();

      if (refreshToken) {
        try {
          // Call your refresh token endpoint
          const response = await Axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const {
            accessToken: newAccess,
            refreshToken: newRefresh,
            expiresIn,
          } = response.data.data;

          // Update tokens in Redux store
          store.dispatch(
            updateTokens({
              accessToken: newAccess,
              refreshToken: newRefresh,
              expiresIn: expiresIn,
            })
          );

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          store.dispatch(logoutUser());

          // Redirect to login
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }

          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, logout
        store.dispatch(logoutUser());
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

const axios = (url?: string): AxiosInstance => {
  if (url) {
    axiosInstance.defaults.baseURL = `${API_BASE_URL}${url}`;
  }
  return axiosInstance;
};

export const AxiosObject = axiosInstance;
export default axios;
