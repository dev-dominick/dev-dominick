import { type HTMLAttributes } from "react";

export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
    title: string;
    subtitle?: string;
}

export function PageHeader({ title, subtitle, className, ...props }: PageHeaderProps) {
    const classes = ["py-12", className || ""].filter(Boolean).join(" ");
    return (
        <div className={classes} {...props}>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50">{title}</h1>
            {subtitle ? (
                <p className="mt-4 text-xl text-slate-600 dark:text-slate-400">{subtitle}</p>
            ) : null}
        </div>
    );
}
