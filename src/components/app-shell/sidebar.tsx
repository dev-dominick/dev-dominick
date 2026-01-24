/**
 * Sidebar Component
 * Desktop navigation sidebar + mobile drawer
 *
 * Desktop: fixed left sidebar (collapsible, persisted)
 * Mobile: drawer overlay with backdrop
 *
 * UX: dense, icon-forward, clear active highlight
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getNavItemsForUser } from "@/lib/config/nav-config";
import { useNavActive } from "@/lib/hooks/useNavActive";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isAdmin?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const STORAGE_KEY = "app-shell:sidebar-collapsed";

export function Sidebar({ isAdmin = false, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { activeItem } = useNavActive();
  const [collapsed, setCollapsed] = useState(false);

  // Load collapsed state from localStorage (client-only, in effect)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(stored === "1");
    }
  }, []);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  };

  // Update CSS variable for sidebar width
  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth >= 1024
        ? collapsed
          ? "76px"
          : "240px"
        : "0px";
      document.documentElement.style.setProperty("--app-sidebar-width", width);
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [collapsed]);

  const visibleSections = useMemo(() => getNavItemsForUser(isAdmin), [isAdmin]);

  const isHrefActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 border-r border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-semibold">
            CC
          </div>
          {!collapsed && <span className="text-sm font-semibold text-white">App Workspace</span>}
        </div>
        <button
          onClick={toggleCollapse}
          className="hidden lg:inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-slate-800 text-slate-300"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {visibleSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <h3 className="px-3 mb-2 text-[11px] uppercase tracking-wide text-slate-500 font-semibold">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = isHrefActive(item.href, item.exact) || activeItem?.href === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                        transition-all duration-150
                        ${isActive
                          ? "bg-blue-600/15 border border-blue-600/40 text-blue-100"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent"
                        }
                        ${collapsed ? "justify-center" : ""}
                      `}
                      onClick={onClose}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                      {!collapsed && item.badge && (
                        <span
                          className="px-2 py-0.5 text-[11px] rounded-full bg-slate-800 text-slate-200 border border-slate-700"
                        >
                          {item.badge}
                        </span>
                      )}
                      {collapsed && item.badge && (
                        <span className="sr-only">{item.badge}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 h-screen flex-col z-40 transition-[width] duration-200 ${collapsed ? "w-[76px]" : "w-[240px]"}`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <div
        className={`
          fixed inset-0 z-40 lg:hidden
          transition-opacity duration-200
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Drawer panel */}
        <div
          className={`
            fixed left-0 top-0 h-screen w-64 bg-slate-950
            transition-transform duration-300
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
