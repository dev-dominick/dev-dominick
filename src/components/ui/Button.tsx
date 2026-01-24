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

const baseStyles = [
    "inline-flex items-center justify-center gap-2",
    "font-medium",
    "rounded-[var(--radius-md)]",
    "transition-all duration-150 ease-out",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-base)]",
].join(" ");

const variants = {
    primary: [
        "bg-[var(--accent)] text-[#0a0a0a]",
        "hover:bg-[var(--accent-hover)]",
        "active:bg-[var(--accent-active)]",
        "shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
    ].join(" "),
    secondary: [
        "bg-[var(--surface-raised)] text-[var(--text-primary)]",
        "border border-[var(--border-default)]",
        "hover:bg-[var(--surface-overlay)] hover:border-[var(--border-strong)]",
        "active:bg-[var(--surface-base)]",
    ].join(" "),
    ghost: [
        "bg-transparent text-[var(--text-secondary)]",
        "hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]",
        "active:bg-[var(--surface-overlay)]",
    ].join(" "),
    danger: [
        "bg-[var(--error)] text-white",
        "hover:brightness-110",
        "active:brightness-90",
        "shadow-[var(--shadow-sm)]",
    ].join(" "),
    success: [
        "bg-[var(--success)] text-[#0a0a0a]",
        "hover:brightness-110",
        "active:brightness-90",
        "shadow-[var(--shadow-sm)]",
    ].join(" "),
    warning: [
        "bg-[var(--warning)] text-[#0a0a0a]",
        "hover:brightness-110",
        "active:brightness-90",
        "shadow-[var(--shadow-sm)]",
    ].join(" "),
} as const;

const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-base",
    xl: "h-12 px-6 text-base",
} as const;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = "primary",
            size = "md",
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
                    baseStyles,
                    variants[variant],
                    sizes[size],
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
