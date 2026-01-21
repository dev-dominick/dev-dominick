/**
 * useAdminAuth Hook
 * Handles admin authentication checks
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface UseAdminAuthOptions {
  redirectTo?: string;
  onAuthFail?: () => void;
}

/**
 * Hook to protect admin pages with authentication
 * Redirects to login if user is not authenticated
 */
export function useAdminAuth({
  redirectTo = "/admin",
  onAuthFail,
}: UseAdminAuthOptions = {}) {
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");

    if (!auth) {
      onAuthFail?.();
      router.push(redirectTo);
    }
  }, [router, redirectTo, onAuthFail]);

  const logout = () => {
    localStorage.removeItem("admin_auth");
    router.push(redirectTo);
  };

  return { logout };
}
