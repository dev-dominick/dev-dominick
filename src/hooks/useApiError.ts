"use client";

import { useCallback } from "react";
import toast from "react-hot-toast";

export interface ApiErrorDetails {
  status: number;
  message: string;
  type:
    | "unauthorized"
    | "forbidden"
    | "payment_required"
    | "server_error"
    | "network_error"
    | "unknown";
}

export function useApiError() {
  const handleError = useCallback((error: unknown): ApiErrorDetails => {
    if (error instanceof Response) {
      const status = error.status;
      let type: ApiErrorDetails["type"] = "unknown";
      let message = "An unexpected error occurred";

      if (status === 401) {
        type = "unauthorized";
        message = "Your session has expired. Please sign in again.";
      } else if (status === 403) {
        type = "forbidden";
        message =
          "You do not have access to this feature. Please upgrade your plan.";
      } else if (status === 402) {
        type = "payment_required";
        message =
          "Your subscription payment failed. Please update your billing information.";
      } else if (status >= 500) {
        type = "server_error";
        message = "Server error. Please try again later.";
      }

      return { status, message, type };
    }

    if (error instanceof TypeError) {
      return {
        status: 0,
        message: "Network error. Please check your connection.",
        type: "network_error",
      };
    }

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { status: 0, message, type: "unknown" };
  }, []);

  const showError = useCallback(
    (error: unknown) => {
      const details = handleError(error);
      toast.error(details.message);
      return details;
    },
    [handleError]
  );

  return { handleError, showError };
}
