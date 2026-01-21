/**
 * useBusinessData Hook
 * Handles fetching and managing business data from API
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../api-client";
import { getErrorMessage } from "../errors";

interface UseBusinessDataOptions {
  endpoint: string;
  dataKey?: string;
  requireAuth?: boolean;
  refetchInterval?: number;
  enabled?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to fetch and manage business data
 * Handles loading, error states, and automatic refetching
 */
export function useBusinessData<T = unknown>({
  endpoint,
  dataKey,
  requireAuth = true,
  refetchInterval = 0,
  enabled = true,
  onSuccess,
  onError,
}: UseBusinessDataOptions) {
  const router = useRouter();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (requireAuth) {
      const auth = localStorage.getItem("admin_auth");
      if (!auth) {
        router.push("/admin");
        return;
      }
    }

    if (!enabled) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    let interval: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        setError("");
        setLoading(true);

        const response = await apiClient.get<unknown>(endpoint);

        if (!isMounted) return;

        const result = dataKey
          ? (response as Record<string, unknown>)[dataKey]
          : response;
        setData(result as T);
        onSuccess?.(result);
      } catch (err) {
        if (!isMounted) return;

        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Setup refetch interval if specified
    if (refetchInterval > 0) {
      interval = setInterval(fetchData, refetchInterval);
    }

    // Cleanup
    return () => {
      isMounted = false;
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [
    endpoint,
    dataKey,
    requireAuth,
    refetchInterval,
    enabled,
    router,
    onSuccess,
    onError,
  ]);

  const refetch = async () => {
    try {
      setError("");
      setLoading(true);

      const response = await apiClient.get<unknown>(endpoint);
      const result = dataKey
        ? (response as Record<string, unknown>)[dataKey]
        : response;
      setData(result as T);
      onSuccess?.(result);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}
