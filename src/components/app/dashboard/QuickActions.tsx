"use client";

import Link from "next/link";
import { ArrowUpRight, Download, FilePlus, Play, Receipt, Wallet } from "lucide-react";

interface QuickAction {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    tone?: "primary" | "neutral";
}

const defaultActions: QuickAction[] = [
    { label: "View balances", href: "/app/business-ops", icon: Wallet },
    { label: "Create invoice", href: "/app/invoices", icon: Receipt },
    { label: "New expense", href: "/app/business-ops/expenses", icon: FilePlus },
];

export function QuickActions({ actions = defaultActions }: { actions?: QuickAction[] }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {actions.map((action) => {
                const Icon = action.icon;
                return (
                    <Link
                        key={action.href}
                        href={action.href}
                        className={`
              group flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-sm font-medium
              ${action.tone === "primary"
                                ? "border-blue-500/40 bg-blue-500/10 text-blue-50 hover:bg-blue-500/15"
                                : "border-slate-800 bg-slate-900/60 text-slate-100 hover:bg-slate-800/60"
                            }
            `}
                    >
                        <div className="flex items-center gap-2 truncate">
                            <Icon className="w-4 h-4" />
                            <span className="truncate">{action.label}</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
                    </Link>
                );
            })}
        </div>
    );
}
