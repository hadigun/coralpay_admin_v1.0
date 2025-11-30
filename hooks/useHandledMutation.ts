"use client";

import {
  ApiResponse,
  HandleApiError,
  HandleApiSuccess,
} from "@/app/apiService/apiResponseHandler";
import type { QueryKey } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useHandledMutation = <TData extends ApiResponse, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  successMessage?: string,
  onSuccessCallback?: (data: TData, variables: TVariables) => void,
  showSuccessNotification = true,
  onErrorCallback?: (error: any, variables: TVariables) => void,
  invalidateQueryKey?: QueryKey
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<TData, any, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const response = await mutationFn(variables);

      const responseData = response.data as any;

      if (
        responseData &&
        responseData.statusCode &&
        responseData.statusCode >= 400
      ) {
        const apiError = {
          response: {
            data: responseData,
            status: responseData.statusCode,
            statusText: responseData.description || "API Error",
          },
          message: responseData.description || "An error occurred",
          status: responseData.statusCode,
        };

        throw apiError;
      }

      return response;
    },
    onSuccess: (data, variables) => {
      if (invalidateQueryKey) {
        queryClient.invalidateQueries({ queryKey: invalidateQueryKey });
      }

      if (showSuccessNotification) {
        HandleApiSuccess(data, successMessage);
      }

      onSuccessCallback?.(data, variables);
    },
    onError: (error, variables) => {
      if (showSuccessNotification) {
        HandleApiError(error, () => mutation.mutate(variables));
      }

      onErrorCallback?.(error, variables);
    },
  });

  return mutation;
};
