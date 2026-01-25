/**
 * AppShellClient
 * Client-side wrapper for app layout
 * Right-side chat panel for messaging, topbar navigation
 */

"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/app-shell";
import { ChatPanel } from "@/components/app-shell/chat-panel";

interface AppShellClientProps {
  children: React.ReactNode;
  userEmail?: string;
  userRole?: "user" | "admin" | "admin-main";
}

export function AppShellClient({ children, userEmail, userRole = "user" }: AppShellClientProps) {
  const { data: session } = useSession();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Get role from session if available, fallback to prop
  const actualRole = (session?.user as any)?.role || userRole;
  const isAdminMain = actualRole === "admin-main";
  const isAdmin = actualRole === "admin" || isAdminMain;

  return (
    <div className="min-h-screen bg-[var(--surface-sunken)]">
      <Topbar 
        isAdmin={isAdmin} 
        userEmail={userEmail}
      />

      <main 
        className="min-h-[calc(100vh-56px)] transition-[padding] duration-300"
        style={{ paddingRight: isChatOpen ? "384px" : "0px" }}
      >
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[var(--accent)] hover:brightness-110 text-[var(--surface-base)] rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 z-40"
          aria-label="Open messages"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      <ChatPanel 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        isAdminMain={isAdminMain}
      />
    </div>
  );
}
