"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export interface BreadcrumbItem {
    label: string;
    href: string;
}

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    breadcrumbs?: BreadcrumbItem[];
    actions?: ReactNode;
    kicker?: string;
}

export function PageHeader({ title, subtitle, breadcrumbs, actions, kicker }: PageHeaderProps) {
    return (
        <div className="mb-6 space-y-3">
            {breadcrumbs && breadcrumbs.length > 0 && (
                <ol className="flex items-center gap-2 text-xs text-slate-500">
                    {breadcrumbs.map((crumb, index) => (
                        <li key={crumb.href} className="flex items-center gap-2">
                            {index > 0 && <span className="text-slate-700">/</span>}
                            <Link href={crumb.href} className="hover:text-white transition-colors">
                                {crumb.label}
                            </Link>
                        </li>
                    ))}
                </ol>
            )}

            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                    {kicker && <p className="text-[11px] uppercase tracking-wide text-blue-300">{kicker}</p>}
                    <h1 className="text-2xl font-semibold text-white leading-tight">{title}</h1>
                    {subtitle && <p className="text-sm text-slate-400 max-w-3xl">{subtitle}</p>}
                </div>

                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
        </div>
    );
}
