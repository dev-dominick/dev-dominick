/**
 * SSR Safety Hook: useMounted
 *
 * Returns `true` only after client-side hydration is complete.
 * Use this to gate any client-only logic that accesses:
 * - window / document / localStorage / sessionStorage
 * - Date.now() / Math.random() / toLocaleString()
 * - Any browser APIs not available during SSR
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const mounted = useMounted();
 *
 *   if (!mounted) return null; // or return fallback
 *
 *   // Safe to access browser APIs here
 *   const value = localStorage.getItem('key');
 *   return <div>{value}</div>;
 * }
 * ```
 *
 * ⚠️ IMPORTANT: Do NOT access browser APIs during render, even with typeof checks.
 * Always use useEffect for side effects and this hook for conditional rendering.
 */

"use client";

import { useEffect, useState } from "react";

export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return mounted;
}
