import { API_USER_URL } from "@/config";
import { UserFilters } from "@/lib/filter";
import axios from "@/utils/axios";

export const getAllUsers = async (filters?: UserFilters) => {
  const response = await axios(API_USER_URL).get("", { params: filters });
  return response;
};

export const registerUser = async (data: any) => {
  const response = await axios(API_USER_URL).post("", data);
  return response;
};

export const updateUser = async (data: any, id: string) => {
  const response = await axios(API_USER_URL).put(`/${id}`, data);
  return response;
};

export const getUserById = async (id: string) => {
  const response = await axios(API_USER_URL).get(`/${id}`);
  return response;
};

export const assigPermissionToUser = async (
  permissionIds: string[],
  id: string
) => {
  const response = await axios(API_USER_URL).put(`/${id}/permissions/assign`, {
    permissionIds,
  });
  return response;
};

export const removePermissionFromUser = async (
  permissionIds: string[],
  id: string
) => {
  const response = await axios(API_USER_URL).put(`/${id}/permissions/remove`, {
    permissionIds,
  });
  return response;
};

export const getUserPermissions = async (id: string) => {
  const response = await axios(API_USER_URL).get(`/${id}/permissions`);
  return response;
};

export const suspendUser = async (id: string) => {
  const response = await axios(API_USER_URL).post(`/${id}/suspend`);
  return response;
};

export const activateUser = async (id: string) => {
  const response = await axios(API_USER_URL).post(`/${id}/activate`);
  return response;
};

export const deactivateUser = async (id: string) => {
  const response = await axios(API_USER_URL).post(`/${id}/deactivate`);
  return response;
};
