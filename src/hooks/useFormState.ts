"use client";

import { useState, ChangeEvent } from "react";

export function useFormState<T extends Record<string, unknown>>(
  initialState: T
) {
  const [formData, setFormData] = useState<T>(initialState);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const reset = () => setFormData(initialState);

  const setField = (name: keyof T, value: T[keyof T]) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return {
    formData,
    handleChange,
    reset,
    setField,
    setFormData,
  };
}
