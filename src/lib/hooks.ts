/**
 * Lightweight custom hooks
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';

// Check admin auth
export function useAdminAuth() {
  const { data: session } = useSession();
  
  const logout = useCallback(async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  }, []);
  
  return { isAuthenticated: !!session, logout };
}

interface UseBusinessDataOptions {
  endpoint?: string;
  refetchInterval?: number;
}

// Business data fetching with refetch
export function useBusinessData<T = unknown>(options?: UseBusinessDataOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (endpoint: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await global.fetch(`/api/${endpoint}`);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const json = await res.json();
      setData(json);
      return json;
    } catch (err) {
      console.error('Failed to fetch:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    if (options?.endpoint) {
      return fetchData(options.endpoint);
    }
  }, [options?.endpoint, fetchData]);

  useEffect(() => {
    if (options?.endpoint) {
      fetchData(options.endpoint);
      
      // Set up refetch interval if specified
      if (options?.refetchInterval && options.refetchInterval > 0) {
        intervalRef.current = setInterval(() => {
          fetchData(options.endpoint!);
        }, options.refetchInterval);
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [options?.endpoint, options?.refetchInterval, fetchData]);

  return { data, loading, error, fetch: fetchData, refetch };
}

// Form state with submit handling
export function useBusinessForm<T extends Record<string, any>>(options: {
  endpoint?: string;
  initialValues: T;
  dataTransform?: (data: T) => unknown;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const [formData, setFormData] = useState<T>(options.initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!options.endpoint) return;

    setLoading(true);
    setError(null);

    try {
      const payload = options.dataTransform ? options.dataTransform(formData) : formData;
      const res = await fetch(`/api/${options.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed: ${res.status}`);
      }

      options.onSuccess?.();
      setFormData(options.initialValues);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      options.onError?.(err instanceof Error ? err : new Error(errorMsg));
    } finally {
      setLoading(false);
    }
  }, [formData, options]);

  return {
    formData,
    values: formData,
    errors,
    touched,
    loading,
    error,
    handleChange,
    handleBlur,
    handleSubmit,
    setFormData,
    setValues: setFormData,
    setErrors,
  };
}

// Modal state
export function useModal(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(!isOpen),
  };
}
