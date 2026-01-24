"use client";

import React, { type ButtonHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger" | "success" | "warning";
    size?: "sm" | "md" | "lg" | "xl";
    loading?: boolean;
    fullWidth?: boolean;
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
    asChild?: boolean;
}

function baseClasses(variant: ButtonProps["variant"], size: ButtonProps["size"]) {
    const common = twMerge(
        "inline-flex items-center justify-center rounded-lg font-semibold",
        "transition-all duration-200",
        "active:scale-98",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-950",
        "gap-2"
    );

    const variants = {
        primary: "bg-sky-500 dark:bg-sky-500 text-white hover:bg-sky-600 dark:hover:bg-sky-600 active:bg-sky-700 dark:active:bg-sky-700 focus:ring-sky-500/30 shadow-sm hover:shadow-base",
        secondary: "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 active:bg-neutral-300 dark:active:bg-neutral-600 focus:ring-neutral-400/30",
        ghost: "bg-transparent text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-200 dark:active:bg-neutral-800 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 focus:ring-neutral-400/30",
        danger: "bg-danger-500 dark:bg-danger-600 text-white hover:bg-danger-600 dark:hover:bg-danger-700 active:bg-danger-700 dark:active:bg-danger-800 focus:ring-danger-500/30 shadow-sm hover:shadow-base",
        success: "bg-success-500 dark:bg-success-600 text-white hover:bg-success-600 dark:hover:bg-success-700 active:bg-success-700 dark:active:bg-success-800 focus:ring-success-500/30 shadow-sm hover:shadow-base",
        warning: "bg-warning-500 dark:bg-warning-600 text-white hover:bg-warning-600 dark:hover:bg-warning-700 active:bg-warning-700 dark:active:bg-warning-800 focus:ring-warning-500/30 shadow-sm hover:shadow-base",
    } as const;

    const sizes = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-base",
        xl: "h-12 px-6 text-base",
    } as const;

    return twMerge(common, variants[variant || "primary"], sizes[size || "md"]);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant,
            size,
            loading,
            fullWidth,
            icon,
            iconPosition = "left",
            className,
            children,
            disabled,
            asChild,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                className={twMerge(
                    baseClasses(variant, size),
                    fullWidth && "w-full",
                    className
                )}
                disabled={loading || disabled}
                {...props}
            >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}

                {icon && iconPosition === "left" && !loading && (
                    <span className="flex items-center">{icon}</span>
                )}

                {children && <span>{children}</span>}

                {icon && iconPosition === "right" && !loading && (
                    <span className="flex items-center">{icon}</span>
                )}
            </button>
        );
    }
);

Button.displayName = "Button";
