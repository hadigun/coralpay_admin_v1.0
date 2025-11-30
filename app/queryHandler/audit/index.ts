import {
  // AuditFilters,
  getMerchantAuditLogs,
  getSystemAuditLogs,
} from "@/app/apiService/audit";
import { useHandledQuery } from "@/hooks/useHandledQuery";
import { AuditFilters } from "@/lib/filter";

export const useSystemAuditLogsQuery = (filters?: AuditFilters) =>
  useHandledQuery(
    ["systemAuditLogs", filters],
    () => getSystemAuditLogs(filters),
    {
      refetchOnWindowFocus: false,
    }
  );

export const useGetMerchantAuditLogsQuery = (
  merchantId: string,
  filters?: AuditFilters
) =>
  useHandledQuery(
    ["merchantAuditLogs", merchantId, filters],
    () => getMerchantAuditLogs(merchantId, filters),
    {
      enabled: !!merchantId,
      refetchOnWindowFocus: false,
    }
  );
