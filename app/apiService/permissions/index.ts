import { API_MERCHANT_URL, API_PERMISSION_URL } from "@/config";
import axios from "@/utils/axios";

export const getAllRoles = async () => {
  const response = await axios(API_PERMISSION_URL).get("/roles");
  return response;
};

export const createRole = async (data: any) => {
  const response = await axios(API_PERMISSION_URL).post("/roles", data);
  return response;
};

export const updateRole = async (data: any, id: string) => {
  const response = await axios(API_PERMISSION_URL).put(`/roles/${id}`, data);
  return response;
};

export const deleteRole = async (id: string) => {
  const response = await axios(API_PERMISSION_URL).delete(`/roles/${id}`);
  return response;
};

export const getRoleById = async (id: string) => {
  const response = await axios(API_PERMISSION_URL).get(`/roles/${id}`);
  return response;
};

export const assignPermissionToRole = async (data: any, id: string) => {
  const response = await axios(API_PERMISSION_URL).post(
    `/roles/${id}/permissions/assign`,
    data
  );
  return response;
};

export const removePermissionFromRole = async (data: any, id: string) => {
  const response = await axios(API_PERMISSION_URL).post(
    `/roles/${id}/permissions/remove`,
    data
  );
  return response;
};

export const getRolePermissions = async (id: string) => {
  const response = await axios(API_PERMISSION_URL).get(
    `/roles/${id}/permissions`
  );
  return response;
};

export const getMerchantRoles = async (id: string) => {
  const response = await axios(API_MERCHANT_URL).get(`/${id}/roles`);
  return response;
};

export const createMerchantRole = async (merchantId: string, data: any) => {
  const response = await axios(API_MERCHANT_URL).post(
    `/${merchantId}/roles`,
    data
  );
  return response;
};

export const getMerchantRoleById = async (
  merchantId: string,
  roleId: string
) => {
  const response = await axios(API_MERCHANT_URL).get(
    `/${merchantId}/roles/${roleId}`
  );
  return response;
};

export const updateMerchantRole = async (
  merchantId: string,
  roleId: string,
  data: any
) => {
  const response = await axios(API_MERCHANT_URL).patch(
    `/${merchantId}/roles/${roleId}`,
    data
  );
  return response;
};

export const deleteMerchantRole = async (
  merchantId: string,
  roleId: string
) => {
  const response = await axios(API_MERCHANT_URL).delete(
    `/${merchantId}/roles/${roleId}`
  );
  return response;
};

export const assignRolePermissionToMerchant = async (
  merchantId: string,
  roleId: string,
  data: any
) => {
  const response = await axios(API_MERCHANT_URL).post(
    `/${merchantId}/roles/${roleId}/permissions/assign`,
    data
  );
  return response;
};

export const removeRolePermissionFromMerchant = async (
  merchantId: string,
  roleId: string,
  data: any
) => {
  const response = await axios(API_MERCHANT_URL).post(
    `/${merchantId}/roles/${roleId}/permissions/remove`,
    data
  );
  return response;
};

export const getMerchantRolePermissions = async (
  merchantId: string,
  roleId: string
) => {
  const response = await axios(API_MERCHANT_URL).get(
    `/${merchantId}/roles/${roleId}/permissions`
  );
  return response;
};

export const getAllPermissions = async () => {
  const response = await axios(API_PERMISSION_URL).get("");
  return response;
};

export const getPermissionById = async (id: string) => {
  const response = await axios(API_PERMISSION_URL).get(`/permissions/${id}`);
  return response;
};

export const createPermission = async (data: any) => {
  const response = await axios(API_PERMISSION_URL).post("/permissions", data);
  return response;
};

export const deletePermission = async (id: string) => {
  const response = await axios(API_PERMISSION_URL).delete(`/permissions/${id}`);
  return response;
};
