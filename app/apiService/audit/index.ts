import { API_AUDIT_URL, API_MERCHANT_URL } from "@/config";
import { AuditFilters } from "@/lib/filter";
import axios from "@/utils/axios";

export const getSystemAuditLogs = async (filters?: AuditFilters) => {
  const res = await axios(API_AUDIT_URL).get("", {
    params: filters,
  });
  return res;
};

export const getMerchantAuditLogs = async (
  merchantId: string,
  filters?: AuditFilters
) => {
  const res = await axios(API_MERCHANT_URL).get(`/${merchantId}/audit-logs`, {
    params: filters,
  });
  return res;
};
