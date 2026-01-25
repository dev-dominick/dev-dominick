import { type HTMLAttributes } from "react";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "error" | "outline";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
    default: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-100",
    secondary: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    success: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-100",
    warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-100",
    error: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-100",
    outline: "bg-transparent border border-current",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const classes = [
        "inline-flex items-center rounded-full",
        "px-3 py-1 text-sm font-medium",
        variantClasses[variant],
        className || "",
    ]
        .filter(Boolean)
        .join(" ");
    return <span className={classes} {...props} />;
}
