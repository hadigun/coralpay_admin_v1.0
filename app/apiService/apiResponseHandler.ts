import { toast } from "sonner";

export interface ApiResponse {
  data?: any;
}

export const HandleApiSuccess = (data?: ApiResponse, message?: string) => {
  toast.success("Successful!", {
    style: { color: "black", backgroundColor: "white" },
    description: data?.data?.description || message,
    richColors: true,
    closeButton: true,
  });
};

export const HandleApiError = (
  error: Error | ApiResponse | undefined,
  retry?: () => void
) => {
  const apiError = error as any;
  console.log("apiError", apiError);

  toast.error("Uh oh! Something went wrong.", {
    style: { color: "white", backgroundColor: "red" },
    description:
      apiError?.response?.data?.error.message ||
      "An error occurred, please try again.",
    // action: {
    //   label: 'Retry',
    //   onClick: retry!
    // },
    richColors: true,
    closeButton: true,
  });
};
