import { type HTMLAttributes } from "react";
import Link from "next/link";

export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
    title: string;
    subtitle?: string;
    backHref?: string;
    backLabel?: string;
}

export function PageHeader({ title, subtitle, backHref, backLabel, className, ...props }: PageHeaderProps) {
    const classes = ["py-12", className || ""].filter(Boolean).join(" ");
    return (
        <div className={classes} {...props}>
            {backHref && (
                <Link 
                    href={backHref} 
                    className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-4"
                >
                    ← {backLabel || "Back"}
                </Link>
            )}
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">{title}</h1>
            {subtitle ? (
                <p className="mt-4 text-xl text-slate-600 dark:text-slate-400">{subtitle}</p>
            ) : null}
        </div>
    );
}
