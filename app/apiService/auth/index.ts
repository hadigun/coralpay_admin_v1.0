import { API_AUTH_URL } from "@/config";
import { LoginFormData } from "@/types";
import axios from "@/utils/axios";

export const login = async (data: LoginFormData) => {
  const response = await axios(API_AUTH_URL).post("/login", data);
  return response;
};

// export const signUp = async (data: SignUpFormData) => {
//   const response = await axios(API_AUTH_URL).post("/register", data);
//   return response;
// };

export const resetPassword = async (data: any) => {
  const response = await axios(API_AUTH_URL).post("/reset-password", data);
  return response;
};

export const requestPasswordReset = async (data: any) => {
  const response = await axios(API_AUTH_URL).post(
    "/request-password-reset",
    data
  );
  return response;
};

export const verifyResetToken = async (data: any) => {
  const response = await axios(API_AUTH_URL).post(
    "/verify-password-reset-request",
    data
  );
  return response;
};

export const refreshToken = async (data: any) => {
  const response = await axios(API_AUTH_URL).post("/refresh", data);
  return response;
};

export const logoutUser = async (data: any) => {
  const response = await axios(API_AUTH_URL).post("/logout", data);
  return response;
};

export const getCurrentUser = async () => {
  const response = await axios(API_AUTH_URL).get("/me");
  return response;
};
