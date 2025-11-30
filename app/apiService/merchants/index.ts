// import { useUserProfile } from "@/app/queryHandler/auth";
// import { API_MERCHANT_URL } from "@/config";
// import { MerchantFilters, UserFilters } from "@/lib/filter";
// import axios from "@/utils/axios";

// const { merchantId } = useUserProfile();

// export const getMerchantUsers = async (id: string, filters?: UserFilters) => {
//   const response = await axios(API_MERCHANT_URL).get(`/${merchantId}/users`, {
//     params: filters,
//   });
//   return response;
// };

// export const getMerchantUserById = async (
//   // merchantId: string,
//   userId: string
// ) => {
//   const response = await axios(API_MERCHANT_URL).get(
//     `/${merchantId}/users/${userId}`
//   );
//   return response;
// };

// export const createMerchantUser = async (data: any) => {
//   const response = await axios(API_MERCHANT_URL).post(
//     `/${merchantId}/users`,
//     data
//   );
//   return response;
// };

// export const updateMerchantUser = async (
//   data: any,
//   // merchantId: string,
//   userId: string
// ) => {
//   const response = await axios(API_MERCHANT_URL).put(
//     `/${merchantId}/users/${userId}`,
//     data
//   );
//   return response;
// };

// export const assignPermissionToMerchantUser = async (
//   data: any,
//   // merchantId: string,
//   userId: string
// ) => {
//   const response = await axios(API_MERCHANT_URL).post(
//     `/${merchantId}/users/${userId}/permissions/assign`,
//     data
//   );
//   return response;
// };

// export const removePermissionFromMerchantUser = async (
//   data: any,
//   // merchantId: string,
//   userId: string
// ) => {
//   const response = await axios(API_MERCHANT_URL).post(
//     `/${merchantId}/users/${userId}/permissions/remove`,
//     data
//   );
//   return response;
// };

// export const activateMerchantUser = async (
//   // merchantId: string,
//   userId: string
// ) => {
//   const response = await axios(API_MERCHANT_URL).post(
//     `/${merchantId}/users/${userId}/activate`
//   );
//   return response;
// };

// export const deactivateMerchantUser = async (
//   // merchantId: string,
//   userId: string
// ) => {
//   const response = await axios(API_MERCHANT_URL).post(
//     `/${merchantId}/users/${userId}/deactivate`
//   );
//   return response;
// };

// export const suspendMerchantUser = async (
//   // merchantId: string,
//   userId: string
// ) => {
//   const response = await axios(API_MERCHANT_URL).post(
//     `/${merchantId}/users/${userId}/suspend`
//   );
//   return response;
// };

// export const getAllMerchants = async (filters?: MerchantFilters) => {
//   const response = await axios(API_MERCHANT_URL).get("", { params: filters });
//   return response;
// };

// export const getMerchantById = async (id: string) => {
//   const response = await axios(API_MERCHANT_URL).get(`/${id}`);
//   return response;
// };

// export const createMerchant = async (data: any) => {
//   const response = await axios(API_MERCHANT_URL).post("", data);
//   return response;
// };
// app/apiService/merchants.ts
"use client";

import { useUserProfile } from "@/app/queryHandler/auth";
import { API_MERCHANT_URL } from "@/config";
import { MerchantFilters, UserFilters } from "@/lib/filter";
import axios from "@/utils/axios";

export const useMerchantApi = () => {
  const { merchantId } = useUserProfile();

  const resolveMerchantId = (providedId?: string): string => {
    if (providedId) return providedId;
    if (!merchantId) throw new Error("Merchant ID not found in user profile.");
    return merchantId;
  };

  /* ---------- Merchant ---------- */
  const getAllMerchants = async (filters?: MerchantFilters) =>
    axios(API_MERCHANT_URL).get("", { params: filters });

  const getMerchantById = async (id: string) =>
    axios(API_MERCHANT_URL).get(`/${id}`);

  const createMerchant = async (data: any) =>
    axios(API_MERCHANT_URL).post("", data);

  /* ---------- Merchant Users ---------- */
  const getMerchantUsers = async (filters?: UserFilters) =>
    axios(API_MERCHANT_URL).get(`/${merchantId}/users`, { params: filters });

  const getMerchantUserById = async (userId: string) =>
    axios(API_MERCHANT_URL).get(`/${merchantId}/users/${userId}`);

  const createMerchantUser = async (data: any) =>
    axios(API_MERCHANT_URL).post(`/${merchantId}/users`, data);

  const updateMerchantUser = async (userId: string, data: any) =>
    axios(API_MERCHANT_URL).patch(`/${merchantId}/users/${userId}`, data);

  const getMerchantUserPermissions = async (userId: string) =>
    axios(API_MERCHANT_URL).get(`/${merchantId}/users/${userId}/permissions`);

  const assignPermissionToMerchantUser = async (userId: string, data: any) =>
    axios(API_MERCHANT_URL).post(
      `/${merchantId}/users/${userId}/permissions/assign`,
      data
    );

  const removePermissionFromMerchantUser = async (userId: string, data: any) =>
    axios(API_MERCHANT_URL).post(
      `/${merchantId}/users/${userId}/permissions/remove`,
      data
    );

  const activateMerchantUser = async (userId: string) =>
    axios(API_MERCHANT_URL).post(`/${merchantId}/users/${userId}/activate`);

  const deactivateMerchantUser = async (userId: string) =>
    axios(API_MERCHANT_URL).post(`/${merchantId}/users/${userId}/deactivate`);

  const suspendMerchantUser = async (userId: string) =>
    axios(API_MERCHANT_URL).post(`/${merchantId}/users/${userId}/suspend`);

  /* ---------- Merchant Roles ---------- */

  // const getMerchantPermissions = async (merchantId?: string) => {
  //   axios(API_MERCHANT_URL).get(`/${merchantId}/permissions`);
  // };

  const getMerchantPermissions = async (providedMerchantId?: string) =>
    axios(API_MERCHANT_URL).get(
      `/${resolveMerchantId(providedMerchantId)}/permissions`
    );

  const getMerchantRoles = async () =>
    axios(API_MERCHANT_URL).get(`/${merchantId}/roles`);

  const createMerchantRole = async (data: any) =>
    axios(API_MERCHANT_URL).post(`/${merchantId}/roles`, data);

  const updateMerchantRole = async (roleId: string, data: any) =>
    axios(API_MERCHANT_URL).patch(`/${merchantId}/roles/${roleId}`, data);

  const deleteMerchantRole = async (roleId: string) =>
    axios(API_MERCHANT_URL).delete(`/${merchantId}/roles/${roleId}`);

  const getMerchantRolePermissions = async (roleId: string) =>
    axios(API_MERCHANT_URL).get(`/${merchantId}/roles/${roleId}/permissions`);

  return {
    getAllMerchants,
    getMerchantById,
    createMerchant,
    getMerchantUsers,
    getMerchantUserById,
    createMerchantUser,
    updateMerchantUser,
    assignPermissionToMerchantUser,
    removePermissionFromMerchantUser,
    activateMerchantUser,
    deactivateMerchantUser,
    suspendMerchantUser,
    getMerchantPermissions,
    getMerchantRoles,
    createMerchantRole,
    updateMerchantRole,
    deleteMerchantRole,
    getMerchantUserPermissions,
    getMerchantRolePermissions,
  };
};
