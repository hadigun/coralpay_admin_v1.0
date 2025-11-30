import { API_MERCHANT_URL, API_ROLE_URL } from "@/config";
import axios from "@/utils/axios";

export const getAllRoles = async () => {
  const response = await axios(API_ROLE_URL).get("");
  return response;
};

export const createRole = async (data: any) => {
  const response = await axios(API_ROLE_URL).post("", data);
  return response;
};

export const updateRole = async (data: any, id: string) => {
  const response = await axios(API_ROLE_URL).patch(`/${id}`, data);
  return response;
};

export const deleteRole = async (id: string) => {
  const response = await axios(API_ROLE_URL).delete(`/${id}`);
  return response;
};

export const getRoleById = async (id: string) => {
  const response = await axios(API_ROLE_URL).get(`/${id}`);
  return response;
};

export const assignPermissionToRole = async (
  permissionIds: string[],
  id: string
) => {
  const response = await axios(API_ROLE_URL).post(`/${id}/permissions/assign`, {
    permissionIds,
  });
  return response;
};

export const removePermissionFromRole = async (
  permissionIds: string[],
  id: string
) => {
  const response = await axios(API_ROLE_URL).post(
    // `/${id}/permissions/remove`,
    `/f87e0fcb-27be-45e6-aec1-1df870b9ba89/permissions/remove`,
    {
      permissionIds,
    }
  );
  return response;
};

export const getRolePermissions = async (roleId: string) => {
  // const response = await axios(API_ROLE_URL).get(`/${roleId}/permissions`);
  const response = await axios(API_ROLE_URL).get(
    `/f87e0fcb-27be-45e6-aec1-1df870b9ba89/permissions`
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

export const assignRolePermissioToMerchant = async (
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
