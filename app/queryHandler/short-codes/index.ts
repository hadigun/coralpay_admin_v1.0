// hooks/useShortCodeHooks.ts
import {
  approveShortCode,
  createShortCode,
  declineShortCode,
  getMerchantShortCodes,
  getShortCodeById,
  getShortCodes,
} from "@/app/apiService/short-codes";
import { useHandledMutation } from "@/hooks/useHandledMutation";
import { useHandledQuery } from "@/hooks/useHandledQuery";
import { USSDFilters } from "@/lib/filter";
import { CreateShortCodeInput, DecisionInput } from "@/types";

export const useGetShortCodesQuery = (params?: USSDFilters) =>
  useHandledQuery(["short-codes", params], () => getShortCodes(params), {
    refetchOnWindowFocus: false,
  });

export const useShortCodeByIdQuery = (id?: string) =>
  useHandledQuery(["short-code", id], () => getShortCodeById(id as string), {
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

export const useCreateShortCodeMutation = (merchantId: string) =>
  useHandledMutation(
    (data: CreateShortCodeInput) => createShortCode(merchantId as string, data),
    "Short code created",
    () => {},
    true,
    () => {},
    ["merchant-short-codes"]
  );

export const useApproveShortCodeMutation = () =>
  useHandledMutation(
    (p: { id: string; data?: DecisionInput }) => approveShortCode(p.id, p.data),
    "Short code approved",
    () => {},
    false,
    () => {},
    ["short-codes"] // ⬅️ Query change: Invalidate the short codes list
  );

export const useDeclineShortCodeMutation = () =>
  useHandledMutation(
    (p: { id: string; data?: DecisionInput }) => declineShortCode(p.id, p.data),
    "Short code declined",
    () => {},
    false,
    () => {},
    ["short-codes"] // ⬅️ Query change: Invalidate the short codes list
  );

export const useGetMerchantShortCodesQuery = (
  merchantId?: string,
  params?: USSDFilters
) =>
  useHandledQuery(
    ["merchant-short-codes", merchantId, params],
    () => getMerchantShortCodes(merchantId as string, params),
    { enabled: !!merchantId, refetchOnWindowFocus: false }
  );
