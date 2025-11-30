// app/apiService/shortCodeService.ts
import {
  API_MERCHANT_URL,
  API_SHORTCODE_REQUEST_URL,
  API_SHORTCODE_URL,
} from "@/config";
import { USSDFilters } from "@/lib/filter";
import { CreateShortCodeInput, DecisionInput } from "@/types";

import axios from "@/utils/axios";

export const getShortCodes = async (params?: USSDFilters) => {
  const response = await axios(API_SHORTCODE_REQUEST_URL).get("", { params });
  return response;
};

export const getShortCodeById = async (id: string) => {
  const response = axios(API_SHORTCODE_URL).get(`/short-codes/${id}`);
  return response;
};

export const createShortCode = async (
  merchantId: string,
  data: CreateShortCodeInput
) => {
  // const form = new FormData();
  // form.append("type", data.type);
  // if (data.authorizationDocumentUrl)
  //   form.append("description", data.authorizationDocumentUrl);
  // if (data.code) form.append("code", data.code);
  // if (data.authorizationLetter)
  //   form.append("authorizationLetter", data.authorizationLetter);
  return axios(API_MERCHANT_URL).post(`/${merchantId}/shortcodes`, data);
};

export const approveShortCode = async (id: string, data?: DecisionInput) => {
  const response = await axios(API_SHORTCODE_REQUEST_URL).post(
    `/${id}/approve`,
    data
  );

  return response;
};

export const declineShortCode = async (id: string, data?: DecisionInput) => {
  const response = await axios(API_SHORTCODE_REQUEST_URL).post(
    `/${id}/decline`,
    data
  );

  return response;
};

export const getMerchantShortCodes = async (
  merchantId: string,
  params?: USSDFilters
) => {
  const response = await axios(API_MERCHANT_URL).get(
    `/${merchantId}/shortcodes`,
    {
      params,
    }
  );
  return response;
};
