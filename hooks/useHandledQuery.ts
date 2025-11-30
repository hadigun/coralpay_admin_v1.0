"use client";

import {
  ApiResponse,
  HandleApiError,
  HandleApiSuccess,
} from "@/app/apiService/apiResponseHandler";
import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useEffect } from "react";

export const useHandledQuery = <T extends ApiResponse | undefined>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">,
  showSuccessNotification = true
) => {
  const queryResult = useQuery({
    queryKey,
    queryFn: async () => {
      const response = (await queryFn()) as any;

      if (response && "statusCode" in response && response.statusCode >= 400) {
        throw response;
      }

      return response;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    ...options,
  });

  const { data, status, error, refetch, pagination } = queryResult as any;

  useEffect(() => {
    if (status === "success" && data) {
      if (
        showSuccessNotification &&
        (!("statusCode" in data) || data.statusCode < 400)
      ) {
        HandleApiSuccess(data);
      }
    }
    if (status === "error") {
      HandleApiError(error as ApiResponse, refetch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, data, error]);

  return queryResult;
};
