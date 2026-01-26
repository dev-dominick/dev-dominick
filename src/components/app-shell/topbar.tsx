/**
 * Topbar Component
 * Compact, MUI-style header with breadcrumbs, search, and user menu
 */

"use client";

import { LogOut, Menu, Search, User as UserIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavActive } from "@/lib/hooks/useNavActive";

type StaffRole = "user" | "admin" | "admin-main" | "lawyer" | "accountant" | "ops";

interface TopbarProps {
  onMenuClick?: () => void;
  isAdmin?: boolean;
  userEmail?: string;
  userRole?: StaffRole;
}

interface Crumb {
  label: string;
  href: string;
}

// Map roles to display labels
const roleLabels: Record<StaffRole, string> = {
  "user": "Member",
  "admin": "Admin",
  "admin-main": "Super Admin",
  "lawyer": "Legal",
  "accountant": "Finance",
  "ops": "Operations",
};

export function Topbar({ onMenuClick, isAdmin = false, userEmail: userEmailProp, userRole = "user" }: TopbarProps) {
  const { data: session } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { activeItem } = useNavActive();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const userEmail = mounted ? userEmailProp || session?.user?.email || "user@example.com" : "user@example.com";
  // Use role from prop to keep SSR/CSR consistent; session role is handled upstream
  const actualRole = userRole as StaffRole;
  const roleLabel = roleLabels[actualRole] || "Member";

  const breadcrumbs: Crumb[] = useMemo(() => {
    const base: Crumb[] = [{ label: "Dashboard", href: "/app" }];
    if (activeItem && activeItem.href !== "/app") {
      base.push({ label: activeItem.label, href: activeItem.href });
    } else if (pathname !== "/app") {
      const segments = pathname.split("/").filter(Boolean);
      const label = segments[segments.length - 1]?.replace(/-/g, " ") ?? "";
      base.push({ label: label.charAt(0).toUpperCase() + label.slice(1), href: pathname });
    }
    return base;
  }, [activeItem, pathname]);

  return (
    <header className="sticky top-0 z-40 bg-[var(--surface-base)]/95 backdrop-blur border-b border-[var(--border-default)]">
      <div className="flex items-center gap-3 h-14 px-3 md:px-6">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-[var(--surface-overlay)] rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-[var(--text-muted)]" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <ol className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.href} className="flex items-center gap-2">
                  {index > 0 && <span className="text-[var(--border-strong)]">/</span>}
                  <Link href={crumb.href} className="hover:text-[var(--text-primary)] truncate">
                    {crumb.label}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Search (non-functional placeholder) */}
        <div className="hidden md:flex items-center bg-[var(--surface-raised)] border border-[var(--border-default)] rounded-lg px-3 py-2 min-w-[220px]">
          <Search className="w-4 h-4 text-[var(--text-muted)] mr-2" />
          <input
            type="search"
            placeholder="Search (coming soon)"
            className="bg-transparent text-sm text-[var(--text-secondary)] placeholder:text-[var(--text-muted)] focus:outline-none flex-1"
            disabled
            aria-label="Global search (coming soon)"
          />
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--surface-overlay)] rounded-lg transition-colors text-sm text-[var(--text-secondary)]"
          >
            <div className="flex flex-col items-end leading-tight" suppressHydrationWarning>
              <span className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-[140px]">
                {userEmail}
              </span>
              <span className="text-[11px] text-[var(--text-muted)]" suppressHydrationWarning>
                {roleLabel}
              </span>
            </div>
            <div className="w-8 h-8 bg-[var(--accent)] rounded-full flex items-center justify-center text-[var(--surface-base)] text-sm font-semibold">
              {(userEmail || "U")[0]?.toUpperCase()}
            </div>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--surface-raised)] border border-[var(--border-default)] rounded-lg shadow-[var(--shadow-lg)] overflow-hidden z-50">
              <Link
                href="/admin/settings"
                className="flex items-center gap-2 px-4 py-3 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)] transition-colors"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <UserIcon className="w-4 h-4" />
                Profile & Settings
              </Link>
              <button
                onClick={async () => {
                  setIsUserMenuOpen(false);
                  await signOut({ redirect: true, callbackUrl: "/" });
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] hover:text-[var(--error)] transition-colors border-t border-[var(--border-default)]"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
