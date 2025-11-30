import { getMerchantStats } from "@/app/apiService/stats";
import { useHandledQuery } from "@/hooks/useHandledQuery";

export const useGetMerchantStatsQuery = () =>
  useHandledQuery(["merchant-stats"], () => getMerchantStats(), {
    enabled: true,
  });
