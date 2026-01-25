/**
 * AppShellClient
 * Client-side wrapper for app layout
 * Manages mobile drawer state, integrates Sidebar + Topbar
 */

"use client";

import { useState } from "react";
import { Sidebar, Topbar } from "@/components/app-shell";

interface AppShellClientProps {
  children: React.ReactNode;
  userEmail?: string;
  userRole?: "user" | "admin";
}

export function AppShellClient({ children, userEmail, userRole = "user" }: AppShellClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--surface-sunken)]">
      <Topbar onMenuClick={() => setIsSidebarOpen(true)} isAdmin={userRole === "admin"} userEmail={userEmail} />

      <div className="flex h-[calc(100vh-56px)]" style={{ paddingLeft: "var(--app-sidebar-width, 0px)" }}>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isAdmin={userRole === "admin"}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
