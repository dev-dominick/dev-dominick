/**
 * Lightweight custom hooks
 */

'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

// Check admin auth
export function useAdminAuth() {
  const { data: session } = useSession();
  return { isAuthenticated: !!session };
}

// Business data
export function useBusinessData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async (endpoint: string) => {
    setLoading(true);
    try {
      const res = await global.fetch(endpoint);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, fetch };
}

// Form state
export function useBusinessForm(initialValues: Record<string, any>) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setValues,
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
