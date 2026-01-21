/**
 * useBusinessForm Hook
 * Manages form state, submission, and validation
 */

import { useState, useCallback, useRef } from "react";
import { apiClient } from "../api-client";
import { getErrorMessage } from "../errors";

interface UseBusinessFormOptions<T> {
  endpoint: string;
  initialValues: T;
  onSuccess?: (data: unknown, formData: T) => void;
  onError?: (error: Error) => void;
  method?: "POST" | "PUT" | "PATCH";
  dataTransform?: (data: T) => Record<string, unknown>;
}

/**
 * Hook to manage form state and submission
 */
export function useBusinessForm<T extends Record<string, unknown>>({
  endpoint,
  initialValues,
  onSuccess,
  onError,
  method = "POST",
  dataTransform,
}: UseBusinessFormOptions<T>) {
  const [formData, setFormData] = useState<T>(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const submitAbortController = useRef<AbortController | null>(null);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value, type } = e.target;
      const target = e.target as
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement;

      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox" && target instanceof HTMLInputElement
            ? target.checked
            : value,
      }));

      // Clear field error when user starts typing
      if (fieldErrors[name]) {
        setFieldErrors((prev) => {
          const updated = { ...prev };
          delete updated[name];
          return updated;
        });
      }
    },
    [fieldErrors]
  );

  const reset = useCallback(() => {
    setFormData(initialValues);
    setError("");
    setFieldErrors({});
  }, [initialValues]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError("");
      setFieldErrors({});

      // Cancel previous request if still pending
      if (submitAbortController.current) {
        submitAbortController.current.abort();
      }
      submitAbortController.current = new AbortController();

      try {
        setLoading(true);

        const dataToSubmit = dataTransform ? dataTransform(formData) : formData;

        let response;
        switch (method) {
          case "PUT":
            response = await apiClient.put(endpoint, dataToSubmit);
            break;
          case "PATCH":
            response = await apiClient.patch(endpoint, dataToSubmit);
            break;
          case "POST":
          default:
            response = await apiClient.post(endpoint, dataToSubmit);
        }

        onSuccess?.(response, formData);
        reset();
        return response;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, formData, method, dataTransform, onSuccess, onError, reset]
  );

  const setFieldError = useCallback((field: string, message: string) => {
    setFieldErrors((prev) => ({
      ...prev,
      [field]: message,
    }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  }, []);

  const setValues = useCallback((values: Partial<T>) => {
    setFormData((prev) => ({
      ...prev,
      ...values,
    }));
  }, []);

  const getValue = useCallback(
    (field: keyof T) => {
      return formData[field];
    },
    [formData]
  );

  return {
    formData,
    handleChange,
    handleSubmit,
    loading,
    error,
    fieldErrors,
    reset,
    setFieldError,
    clearFieldError,
    setValues,
    getValue,
  };
}
