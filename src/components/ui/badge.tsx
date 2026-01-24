import { type HTMLAttributes } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {}

export function Badge({ className, ...props }: BadgeProps) {
    const classes = [
        "inline-flex items-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-100",
        "px-3 py-1 text-sm font-medium",
        className || "",
    ]
        .filter(Boolean)
        .join(" ");
    return <span className={classes} {...props} />;
}
