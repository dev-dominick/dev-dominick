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

interface TopbarProps {
  onMenuClick?: () => void;
  isAdmin?: boolean;
  userEmail?: string;
}

interface Crumb {
  label: string;
  href: string;
}

export function Topbar({ onMenuClick, isAdmin = false, userEmail: userEmailProp }: TopbarProps) {
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
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800">
      <div className="flex items-center gap-3 h-14 px-3 md:px-6">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-slate-400" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <ol className="flex items-center gap-2 text-xs text-slate-400">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.href} className="flex items-center gap-2">
                  {index > 0 && <span className="text-slate-600">/</span>}
                  <Link href={crumb.href} className="hover:text-white truncate">
                    {crumb.label}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Search (non-functional placeholder) */}
        <div className="hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 mr-2" />
          <input
            type="search"
            placeholder="Search (coming soon)"
            className="bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none flex-1"
            disabled
            aria-label="Global search (coming soon)"
          />
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-slate-800 rounded-lg transition-colors text-sm text-slate-200"
          >
            <div className="flex flex-col items-end leading-tight" suppressHydrationWarning>
              <span className="text-xs font-semibold text-white truncate max-w-[140px]">
                {userEmail}
              </span>
              <span className="text-[11px] text-slate-500">{isAdmin ? "Admin" : "Member"}</span>
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {(userEmail || "U")[0]?.toUpperCase()}
            </div>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-lg overflow-hidden z-50">
              <Link
                href="/app/settings"
                className="flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors"
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
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-red-400 transition-colors border-t border-slate-800"
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
